import { Component, OnDestroy, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { WebservicesService } from '../providers/webservices/webservices.service';
import { CommonService } from '../providers/common/common.service';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { Capacitor } from '@capacitor/core';
import { Platform, ViewWillEnter, ViewDidEnter } from '@ionic/angular';
import { AdMobBannerService } from '../services/admob-banner.service';

@Component({
  selector: 'app-select-intro',
  templateUrl: './select-intro.page.html',
  styleUrls: ['./select-intro.page.scss'],
  standalone: false
})
export class SelectIntroPage implements OnInit, OnDestroy, ViewWillEnter, ViewDidEnter {

  userid: any;
  introContent: any = {};
  introPageType: any = 0;
  logoImage: string | undefined;
  fetchingStatus: boolean = false;

  clientUrl: string = environment.clientAdminUrl;

  constructor(
    private web: WebservicesService,
    private common: CommonService,
    private router: Router,
    public sanitize: DomSanitizer,
    private platform: Platform,
    private admobBanner: AdMobBannerService,
  ) { }

  ngOnInit() {
    this.fillInfo();
  }

  ionViewWillEnter() {
    let code = localStorage.getItem("surveyCompanyCodeLocal");
    if (code != null && code != "" && code != "undefined") {
      this.router.navigate(["/companycode"]);
    }
  }

  ionViewDidEnter() {
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    const code = localStorage.getItem('surveyCompanyCodeLocal');
    if (code != null && code !== '' && code !== 'undefined') {
      return;
    }
    // Defer until WebView layout is ready (improves first-frame banner attach).
    this.platform.ready().then(() => {
      setTimeout(() => void this.showBannerAd(), 450);
    });
  }

  ngOnDestroy(): void {
    void this.admobBanner.disposeBannerRetryListeners();
  }

  fillInfo() {
    this.fetchingStatus = true;
    this.web.getData('getAdminIntroContent', '').then(res => {
      this.fetchingStatus = false;
      if (res.status == '200') {
        this.introContent = res.data;

        console.log(this.introContent);

      } else {
        this.common.presentToast(res.error);
      }
    }, err => {
      this.fetchingStatus = false;
      console.log(err);
      this.common.presentToast('Connection Error.')
    })
  }

  goToOtherContentPage(page: string) {
    if (page == 'privacy-master' || page == 'terms-master') {
      this.router.navigate(['/contentpage', { pageFor: page }]);
    }
  }

  async showBannerAd() {
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    await this.admobBanner.showBanner();
  }

}
