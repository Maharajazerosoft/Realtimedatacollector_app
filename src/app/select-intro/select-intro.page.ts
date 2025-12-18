import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { WebservicesService } from '../providers/webservices/webservices.service';
import { CommonService } from '../providers/common/common.service';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-select-intro',
  templateUrl: './select-intro.page.html',
  styleUrls: ['./select-intro.page.scss'],
  standalone: false
})
export class SelectIntroPage implements OnInit {

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
    // private admobFree: AdMobFree,
    private platform: Platform,
  ) { }

  ngOnInit() {
    this.fillInfo();
    this.platform.ready().then(() => {
      this.showBannerAd();
    });
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad SearchresultPage");
    this.showBannerAd();
  }



  fillInfo() {
    this.showBannerAd();
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

  ionViewWillEnter() {
    let code = localStorage.getItem("surveyCompanyCodeLocal");
    if (code != null && code != "" && code != "undefined") {
      this.router.navigate(["/companycode"]);
    }
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

    // Disable test ads now that integration is verified.
    const useTestAds = false;

    const options: BannerAdOptions = {
      adId: 'ca-app-pub-8416006941552663/5184354352', // <-- Your banner Ad ID
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: useTestAds,
    };

    try {
      await AdMob.initialize();
      await AdMob.showBanner(options);
    } catch (err) {
      console.error('Banner ad failed to show', err);
    }
  }

}
