import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../providers/common/common.service';
import { WebservicesService } from '../providers/webservices/webservices.service';
import { AlertController, NavController, Platform } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdPosition, BannerAdSize, type BannerAdOptions } from '@capacitor-community/admob';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  userid: any;
  introContent: any;
  introPageType: any = 0;
  logoImage: string = '';
  loading: boolean = false;

  constructor(
    public router: Router,
    public navCtrl: NavController,
    public common: CommonService,
    private alertCtrl: AlertController,
    public web: WebservicesService,
    public sanitize: DomSanitizer,
    private platform: Platform
  ) {
    this.introContent = null;
  }

  ngOnInit() {
    this.platform.ready().then(() => this.showBannerAd());
  }

  exitFromCompany() {
    this.alertCtrl.create({
      header: 'Confirmation',
      message: 'Are you sure to choose another company..?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Ok',
          handler: () => {
            console.log('go to choose company');
            localStorage.removeItem('surveyCompanyCodeLocal');
            localStorage.removeItem('surveyCompanyLogoLocal');
            this.router.navigate(['/']);
          }
        }
      ]
    }).then(alertData => {
      alertData.present();
    });
  }

  updateLogo() {
    let logoUrl = localStorage.getItem('surveyCompanyLogoLocal');
    console.log('logoUrl', logoUrl);
    if (logoUrl == null || logoUrl == '' || logoUrl == 'undefined' || logoUrl == 'null') {
      this.logoImage = '../../assets/img/logo.png';
    } else {
      this.logoImage = `${environment.base_url}uploads/logos/${logoUrl}`;
    }
  }

  gotoNav(navFor: any) {
    switch (navFor) {
      case 'login':
        this.router.navigate(["/login"]);
        break;
      case 'register':
        this.router.navigate(["/register"]);
        break;
      case 'anonymous':
        localStorage.setItem("SAloginID", "anonymous");
        this.navCtrl.setDirection("root");
        this.router.navigateByUrl("/surveyform", {
          skipLocationChange: true,
        });
        break;
    }
  }

  ionViewWillEnter() {
    this.fillInfo();
    this.updateLogo();
    this.showBannerAd();
  }

  fillInfo() {
    let companyCode = localStorage.getItem('surveyCompanyCodeLocal')
    if (companyCode == null || companyCode == '' || companyCode == 'undefined') {
      this.router.navigate(['companycode']);
      return;
    }

    this.userid = localStorage.getItem('SAloginID');
    console.log(this.userid);
    if (this.userid != "" && this.userid != null) {
      this.router.navigateByUrl('/surveyform', { skipLocationChange: true });
    }
    else {
      this.loading = true;
      this.web.getData('getContent', 'page=home&company=' + companyCode).then(resData => {
        this.loading = false;
        if (resData.status == 'success') {
          this.introContent = resData.data[0].sa_section_content;
          this.introPageType = parseInt(resData.data2[0].site_registration_status);
        }
      }, err => {
        this.loading = false;
        console.log(err);
        this.common.presentToast('Connection Error');
      });
    }
  }

  gotToPage(pageFor: any) {
    switch (pageFor) {
      case "tos":
        this.router.navigate(['/contentpage', { pageFor: "tos" }]);
        break;
      case "privacy":
        this.router.navigate(['/contentpage', { pageFor: "privacy" }]);
        break;
    }
  }

  async showBannerAd() {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    await this.platform.ready();

    try {
      await AdMob.initialize();

      const options: BannerAdOptions = {
        adId: 'ca-app-pub-8416006941552663/5184354352',
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: false,
      };

      await AdMob.showBanner(options);
      console.log('Home banner ad loaded');
    } catch (err) {
      console.error('Home banner ad error:', err);
    }
  }
}