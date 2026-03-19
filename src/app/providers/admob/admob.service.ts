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
    // Prevent overlapping requests during fast page transitions.
    if (this.showBannerPromise) return this.showBannerPromise;
    this.showBannerPromise = (async () => {
      const options = getBannerOptions();
      try {
        await AdMob.showBanner(options);
      } catch (err: any) {
        // iOS sometimes returns "Request Error: No ad to show" after hide/resume.
        // Force banner recreation once, then retry.
        const msg = String(err?.message ?? err ?? '');
        const code = Number(err?.code ?? NaN);
        const isNoAdToShow = msg.includes('No ad to show') || code === 8;

        if (!isNoAdToShow) throw err;

        try {
          await AdMob.removeBanner();
        } catch (_) {}

        // Small delay for native view teardown.
        await new Promise((resolve) => setTimeout(resolve, 250));
        await AdMob.showBanner(options);
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
    AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (error: AdMobError) =>
      console.error('AdMob banner failed to load', error)
    );
    AdMob.addListener(BannerAdPluginEvents.Opened, () =>
      console.info('AdMob banner opened')
    );
    AdMob.addListener(BannerAdPluginEvents.Closed, () =>
      console.info('AdMob banner closed')
    );
  }
}
