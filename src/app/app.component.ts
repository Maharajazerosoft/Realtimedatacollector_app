import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdPluginEvents, type AdMobError } from '@capacitor-community/admob';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  private admobReady = false;

  constructor(private platform: Platform) {
    this.platform.ready().then(() => this.initializeAdMob());
  }

  private async initializeAdMob() {
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    if (this.admobReady) {
      return;
    }
    try {
      await AdMob.initialize();
      this.admobReady = true;
      this.registerAdListeners();
    } catch (err) {
      // Surface init errors early; otherwise banners will silently fail.
      console.error('AdMob initialization failed', err);
    }
  }

  private registerAdListeners() {
    // Log banner lifecycle; helps diagnose no-fill vs. runtime failures.
    AdMob.addListener(BannerAdPluginEvents.Loaded, () => console.info('AdMob banner loaded'));
    AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (error: AdMobError) =>
      console.error('AdMob banner failed to load', error)
    );
    AdMob.addListener(BannerAdPluginEvents.Opened, () => console.info('AdMob banner opened'));
    AdMob.addListener(BannerAdPluginEvents.Closed, () => console.info('AdMob banner closed'));
  }
}