import type { BannerAdOptions } from '@capacitor-community/admob';
import { BannerAdPosition, BannerAdSize } from '@capacitor-community/admob';

/**
 * AdMob configuration – ad unit IDs and banner options.
 * Centralize all ad call config here for easy maintenance.
 */
export const ADMOB_CONFIG = {
  /** Banner ad unit ID (production) */
  BANNER_AD_ID: 'ca-app-pub-8416006941552663/5184354352',

  /** Use test ads during development */
  IS_TESTING: false,
} as const;

/**
 * Returns banner options for showBanner(). Called by admob.service.
 */
export function getBannerOptions(): BannerAdOptions {
  return {
    adId: ADMOB_CONFIG.BANNER_AD_ID,
    adSize: BannerAdSize.ADAPTIVE_BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    isTesting: ADMOB_CONFIG.IS_TESTING,
    margin: 0,
  };
}
