import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';
import {
  AdMob,
  BannerAdPluginEvents,
  BannerAdPosition,
  BannerAdSize,
  type AdMobError,
  type BannerAdOptions,
} from '@capacitor-community/admob';
import { Platform } from '@ionic/angular';
import { environment } from 'src/environments/environment';

/**
 * Single place for banner init, show (with no-fill retry), hide/resume.
 * Use this instead of calling @capacitor-community/admob directly from pages.
 */
@Injectable({ providedIn: 'root' })
export class AdMobBannerService {
  private initPromise: Promise<void> | null = null;
  private globalListenersRegistered = false;
  private bannerRetryHandles: PluginListenerHandle[] = [];
  /** Serializes show/load so rapid calls (e.g. ngOnInit + ionViewWillEnter) do not remove listeners mid-flight. */
  private bannerShowChain: Promise<void> = Promise.resolve();

  constructor(private platform: Platform) {}

  /** Call once from AppComponent after platform.ready — initializes SDK and logs lifecycle. */
  async bootstrap(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    await this.platform.ready();
    try {
      await this.ensureInitialized();
      this.registerGlobalListenersOnce();
    } catch (err) {
      console.error('AdMob initialization failed', err);
    }
  }

  private registerGlobalListenersOnce(): void {
    if (this.globalListenersRegistered) {
      return;
    }
    this.globalListenersRegistered = true;
    AdMob.addListener(BannerAdPluginEvents.Loaded, () => console.info('AdMob banner loaded'));
    // No-fill (3) is common for live inventory; avoid noisy console.error on every page.
    AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (error: AdMobError) => {
      if (error.code === 3) {
        return;
      }
      console.warn('AdMob banner failed to load', error);
    });
    AdMob.addListener(BannerAdPluginEvents.Opened, () => console.info('AdMob banner opened'));
    AdMob.addListener(BannerAdPluginEvents.Closed, () => console.info('AdMob banner closed'));
  }

  async ensureInitialized(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    await this.platform.ready();
    if (!this.initPromise) {
      this.initPromise = AdMob.initialize();
    }
    await this.initPromise;
  }

  private getDefaultBannerOptions(): BannerAdOptions {
    return {
      adId: environment.admobBannerAdUnitId,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: environment.admobUseTestAds,
    };
  }

  private async clearBannerRetryListeners(): Promise<void> {
    for (const h of this.bannerRetryHandles) {
      try {
        await h.remove();
      } catch {
        /* ignore */
      }
    }
    this.bannerRetryHandles = [];
  }

  /**
   * Shows the bottom adaptive banner using environment ad unit + test/prod flags.
   * Retries once on ERROR_CODE_NO_FILL (3).
   * Calls are queued so overlapping requests cannot strip Loaded/Failed listeners before the ad finishes loading.
   */
  async showBanner(overrides?: Partial<BannerAdOptions>): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    await this.platform.ready();
    this.bannerShowChain = this.bannerShowChain
      .then(() => this.runShowBanner(overrides))
      .catch(() => undefined);
    await this.bannerShowChain;
  }

  private async runShowBanner(overrides?: Partial<BannerAdOptions>): Promise<void> {
    try {
      await this.ensureInitialized();
      await this.clearBannerRetryListeners();
      const options: BannerAdOptions = { ...this.getDefaultBannerOptions(), ...overrides };
      await this.showBannerWithNoFillRetry(options, 0);
    } catch (err) {
      console.error('Banner ad error:', err);
    }
  }

  private async showBannerWithNoFillRetry(options: BannerAdOptions, attempt: number): Promise<void> {
    const maxAttempts = 2;

    const loaded = await AdMob.addListener(BannerAdPluginEvents.Loaded, async () => {
      await loaded.remove();
      await failed.remove();
      this.bannerRetryHandles = this.bannerRetryHandles.filter((h) => h !== loaded && h !== failed);
      console.log('Banner ad loaded');
    });

    const failed = await AdMob.addListener(BannerAdPluginEvents.FailedToLoad, async (error: AdMobError) => {
      await loaded.remove();
      await failed.remove();
      this.bannerRetryHandles = this.bannerRetryHandles.filter((h) => h !== loaded && h !== failed);

      if (error.code === 3 && attempt < maxAttempts - 1) {
        // Do not call removeBanner here: destroying the view between attempts often prevents the retry from showing.
        console.info('[AdMob] No fill (code 3); retrying banner load…');
        await new Promise((r) => setTimeout(r, 1200));
        await this.showBannerWithNoFillRetry(options, attempt + 1);
        return;
      }

      if (error.code === 3) {
        console.info('[AdMob] No banner after retry (no inventory / region / dev URL).');
      } else {
        console.warn('Banner ad load error:', error);
      }
    });

    this.bannerRetryHandles.push(loaded, failed);
    await AdMob.showBanner(options);
  }

  /** Clears page-level retry listeners when leaving a page that called showBanner (optional). */
  async disposeBannerRetryListeners(): Promise<void> {
    await this.clearBannerRetryListeners();
  }

  /**
   * Prefer hideBanner (keeps the loaded ad). If the native view is in a bad state, fall back to removeBanner.
   */
  async hideBanner(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    try {
      await AdMob.hideBanner();
    } catch {
      try {
        await AdMob.removeBanner();
      } catch {
        /* ignore */
      }
    }
  }

  /**
   * Prefer resumeBanner. If resume fails (e.g. after removeBanner), reload the banner via showBanner.
   */
  async resumeBanner(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    try {
      await AdMob.resumeBanner();
    } catch {
      try {
        await this.showBanner();
      } catch {
        /* ignore */
      }
    }
  }
}
