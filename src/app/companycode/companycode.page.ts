import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonService } from "../providers/common/common.service";
import { WebservicesService } from "../providers/webservices/webservices.service";
import { Router } from "@angular/router";

// Capacitor AdMob
import { AdMob, BannerAdPosition } from '@capacitor-community/admob';

@Component({
  selector: "app-companycode",
  templateUrl: "./companycode.page.html",
  styleUrls: ["./companycode.page.scss"],
  standalone: false
})
export class CompanycodePage implements OnInit, OnDestroy {
  companyCode: string = '';
  localCompanyCodes: any = [];

  constructor(
    private common: CommonService,
    private web: WebservicesService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.initializeAdMob();
    await this.bannerAd();
  }

  ngOnDestroy() {
    this.removeBannerAd();
  }

  async initializeAdMob() {
    try {
      const { status } = await AdMob.trackingAuthorizationStatus();
      console.log('AdMob tracking authorization status:', status);
    } catch (error) {
      console.error('Error initializing AdMob:', error);
    }
  }

  async bannerAd() {
    try {
      const options = {
        adId: 'ca-app-pub-8416006941552663/5184354352',
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
      };
      
      await AdMob.showBanner(options);
      console.log('Banner ad shown');
    } catch (error) {
      console.error('Error showing banner ad:', error);
    }
  }

  async removeBannerAd() {
    try {
      await AdMob.hideBanner();
      console.log('Banner ad hidden');
    } catch (error) {
      console.error('Error hiding banner ad:', error);
    }
  }

  updateCompany(code: string) {
    this.common.presentLoading();
    this.web.postData("retrieveCompanyDetails", { code: code }).then(
      (res: any) => {
        this.common.closeLoading();
        if (res.status == "success") {
          localStorage.setItem(
            "surveyCompanyLogoLocal",
            res.logo.comp_logo_image
          );
          if (res.members_status == false || res.questions_status == false) {
            this.router.navigate(["/select-intro"]);
          } else {
            this.router.navigate(["/select-intro"]);
          }
        } else {
          localStorage.removeItem('surveyCompanyCodeLocal');
          localStorage.removeItem('surveyCompanyLogoLocal');
          this.common.presentToast(res.error || res.msg || 'Error retrieving company details');
        }
      },
      (err: any) => {
        console.log(err);
        this.common.closeLoading();
        this.common.presentToast("Connection Error");
      }
    );
  }

  submitCode(str: string) {
    if (!str || str.trim() === "") {
      this.common.presentToast("Please enter access code");
      return;
    }
    
    console.log(str);
    let data = {
      code: str,
    };
    
    this.common.presentLoading();
    this.web.postData("submitCompanyCode", data).then(
      (res: any) => {
        this.common.closeLoading();
        if (res.status == "success") {
          localStorage.setItem("surveyCompanyCodeLocal", res.data.id);
          localStorage.setItem(
            "surveyCompanyLogoLocal",
            res.logo.comp_logo_image
          );

          this.addCompanyCodeLocal({comp_name: res.data.comp_name, comp_code: res.data.comp_code})
          
          this.updateCompany(res.data.id);
          this.companyCode = '';
        } else {
          this.common.presentToast(res.error || res.msg || 'Invalid company code');
        }
      },
      (err: any) => {
        console.log(err);
        this.common.closeLoading();
        this.common.presentToast("Connection Error");
      }
    );
  }

  ionViewWillEnter() {
    let code = localStorage.getItem("surveyCompanyCodeLocal");
    if (code != null && code != "" && code != "undefined") {
      this.updateCompany(code);
    }

    let codes: any = localStorage.getItem('company_codes_local');
    if (!codes || codes == '') {
      return;
    }

    try {
      this.localCompanyCodes = JSON.parse(codes);
    } catch (e) {
      console.error('Error parsing company codes:', e);
      this.localCompanyCodes = [];
    }
  }

  addCompanyCodeLocal(company: any) {
    let codes: any = localStorage.getItem('company_codes_local');
    let parsedCodes: any[] = [];
    
    if (codes && codes != '') {
      try {
        parsedCodes = JSON.parse(codes);
      } catch (e) {
        console.error('Error parsing existing company codes:', e);
        parsedCodes = [];
      }
    }

    const isExist = parsedCodes.find((x: any) => x.comp_code == company.comp_code);
    if (!isExist) {
      parsedCodes.push(company);
      localStorage.setItem('company_codes_local', JSON.stringify(parsedCodes));
      this.localCompanyCodes = parsedCodes;
    }
  }

  selectPreviousCode(company: any) {
    this.companyCode = company.comp_code;
    this.submitCode(company.comp_code);
  }

  clearStoredCodes() {
    localStorage.removeItem('company_codes_local');
    this.localCompanyCodes = [];
    this.common.presentToast('Cleared stored company codes');
  }
}