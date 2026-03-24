import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AdMobBannerService } from './services/admob-banner.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private admobBanner: AdMobBannerService,
  ) {
    this.platform.ready().then(() => this.admobBanner.bootstrap());
  }
}