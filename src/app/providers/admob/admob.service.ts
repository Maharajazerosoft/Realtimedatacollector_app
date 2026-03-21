import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  BannerAdPluginEvents,
  type AdMobError,
} from '@capacitor-community/admob';
import { getBannerOptions } from './admob-config';

/**
 * Central AdMob service – init, show, hide, resume.
 * Uses admob-config.ts for ad unit IDs and banner options.
 */
@Injectable({
  providedIn: 'root',
})
export class AdMobService {
  private initPromise: Promise<void> | null = null;
  private showBannerPromise: Promise<void> | null = null;
  /** True when a banner was shown and may still exist (e.g. after page transition). */
  private bannerWasShown = false;

  /** Initialize AdMob once at app startup. Safe to call multiple times. */
  async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return Promise.resolve();
    if (this.initPromise !== null) return this.initPromise;

    this.initPromise = AdMob.initialize().catch((err) => {
      this.initPromise = null;
      throw err;
    });
    return this.initPromise;
  }

  /** Show banner. Waits for init, uses options from admob-config. */
  async showBanner(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    await this.initialize();
    // If banner was already shown (e.g. from previous page), try resume first to avoid "No ad to show" on rapid transitions.
    if (this.bannerWasShown) {
      try {
        await AdMob.resumeBanner();
        return;
      } catch (_) {
        this.bannerWasShown = false;
      }
    }
    // Prevent overlapping requests during fast page transitions.
    if (this.showBannerPromise) return this.showBannerPromise;
    this.showBannerPromise = (async () => {
      const options = getBannerOptions();
      try {
        await AdMob.showBanner(options);
        this.bannerWasShown = true;
      } catch (err: any) {
        const msg = String(err?.message ?? err ?? '');
        const code = Number(err?.code ?? NaN);
        const isNoAdToShow = msg.includes('No ad to show') || code === 0 || code === 8;

        if (!isNoAdToShow) throw err;

        // Alternative: use hide/resume when "No ad to show" (e.g. after keyboard hide or page transition).
        // Banner may already exist but in a bad state; hide+resume often restores it.
        try {
          await AdMob.hideBanner();
          await new Promise((resolve) => setTimeout(resolve, 150));
          await AdMob.resumeBanner();
          this.bannerWasShown = true;
          return;
        } catch (_) {}

        // Fallback: remove and recreate banner.
        this.bannerWasShown = false;
        try {
          await AdMob.removeBanner();
        } catch (_) {}
        await new Promise((resolve) => setTimeout(resolve, 250));
        await AdMob.showBanner(options);
        this.bannerWasShown = true;
      }
    })();
    try {
      await this.showBannerPromise;
    } finally {
      this.showBannerPromise = null;
    }
  }

  /** Hide banner (e.g. keyboard open). Use resumeBanner() to show again. */
  async hideBanner(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await AdMob.hideBanner();
    } catch (e) {}
  }

  /** Resume banner after hide. */
  async resumeBanner(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await AdMob.resumeBanner();
    } catch (e) {}
  }

  /** Register banner event listeners for logging. */
  registerListeners(): void {
    AdMob.addListener(BannerAdPluginEvents.Loaded, () =>
      console.info('AdMob banner loaded')
    );
    AdMob.addListener(BannerAdPluginEvents.FailedToLoad, async (error: AdMobError) => {
      console.error('AdMob banner failed to load', error);
      const msg = String(error?.message ?? '');
      const code = Number(error?.code ?? NaN);
      const isNoAdToShow = msg.includes('No ad to show') || code === 0 || code === 8;
      if (isNoAdToShow && Capacitor.isNativePlatform()) {
        try {
          await AdMob.hideBanner();
          await new Promise((r) => setTimeout(r, 150));
          await AdMob.resumeBanner();
        } catch (_) {}
      }
    });
    AdMob.addListener(BannerAdPluginEvents.Opened, () =>
      console.info('AdMob banner opened')
    );
    AdMob.addListener(BannerAdPluginEvents.Closed, () =>
      console.info('AdMob banner closed')
    );
  }
}
