import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { AdMobService } from './providers/admob/admob.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private admobService: AdMobService
  ) {
    this.platform.ready().then(() => this.initializeAdMob());
  }

  private async initializeAdMob() {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await this.admobService.initialize();
      this.admobService.registerListeners();
    } catch (err) {
      console.error('AdMob initialization failed', err);
    }
  }
}