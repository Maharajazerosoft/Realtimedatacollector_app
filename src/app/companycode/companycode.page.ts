import { Component, OnInit } from "@angular/core";
import { CommonService } from "../providers/common/common.service";
import { WebservicesService } from "../providers/webservices/webservices.service";
import { Router } from "@angular/router";
import { Platform } from "@ionic/angular";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";
import { AdMobService } from '../providers/admob/admob.service';
import type { PluginListenerHandle } from '@capacitor/core';

@Component({
  selector: "app-companycode",
  templateUrl: "./companycode.page.html",
  styleUrls: ["./companycode.page.scss"],
  standalone: false,
})
export class CompanycodePage implements OnInit {
  companyCode: string = '';
  localCompanyCodes: any = [];
  keyboardVisible = false;
  private keyboardListenerHandles: PluginListenerHandle[] = [];

  constructor(
    private common: CommonService,
    private web: WebservicesService,
    private router: Router,
    private platform: Platform,
    private admobService: AdMobService
  ) { }

  ngOnInit() {
    this.bannerad();
  }

  ionViewDidEnter() {
    this.setupKeyboardListeners();
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
            // this.router.navigate(['/subscription-failed']);
            this.router.navigate(["/home"]);
          } else {
            this.router.navigate(["/home"]);
          }
        } else {
          localStorage.removeItem('surveyCompanyCodeLocal');
          localStorage.removeItem('surveyCompanyLogoLocal');
          this.common.presentToast(res.error);
        }
      },
      (err) => {
        console.log(err);
        this.common.closeLoading();
        this.common.presentToast("Connection Error");
      }
    );
  }

  submitCode(str: string) {
    if (str == null || str == "") {
      this.common.presentToast("Please enter access code");
    } else {
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

            this.addCompanyCodeLocal({ comp_name: res.data.comp_name, comp_code: res.data.comp_code })

            this.updateCompany(res.data.id);
            this.companyCode = '';
            //this.router.navigate(["/home"]);
          } else {
            this.common.presentToast(res.error);
          }
        },
        (err) => {
          console.log(err);
          this.common.closeLoading();
          this.common.presentToast("Connection Error");
        }
      );
    }
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

    this.localCompanyCodes = JSON.parse(codes);
  }

  addCompanyCodeLocal(company: any) {
    let codes: any = localStorage.getItem('company_codes_local');
    if (codes && codes != '') {
      codes = JSON.parse(codes);
    } else {
      codes = [];
    }

    const isExist = codes.find((x: any) => x.comp_code == company.comp_code);
    if (!isExist) {
      codes.push(company);
      localStorage.setItem('company_codes_local', JSON.stringify(codes));
      this.localCompanyCodes = codes;
    }
  }

  private async setupKeyboardListeners() {
    if (!Capacitor.isNativePlatform()) return;
    if (this.keyboardListenerHandles.length > 0) return;

    const willShowHandle = await Keyboard.addListener('keyboardWillShow', async () => {
      this.keyboardVisible = true;
      await this.admobService.hideBanner();
    });

    const didHideHandle = await Keyboard.addListener('keyboardDidHide', async () => {
      this.keyboardVisible = false;
      await this.admobService.resumeBanner();
    });

    this.keyboardListenerHandles.push(willShowHandle, didHideHandle);
  }

  async ionViewDidLeave() {
    await this.cleanupKeyboardListeners();
    this.keyboardVisible = false;
    try {
      await this.admobService.resumeBanner();
    } catch (_) {}
  }

  private async cleanupKeyboardListeners() {
    const handles = [...this.keyboardListenerHandles];
    this.keyboardListenerHandles = [];
    for (const handle of handles) {
      try {
        await handle.remove();
      } catch (_) {}
    }
  }

  async bannerad() {
    if (!Capacitor.isNativePlatform()) return;
    await this.platform.ready();
    try {
      await this.admobService.showBanner();
      console.info('AdMob banner loaded (companycode)');
    } catch (e) {
      console.error('AdMob banner error:', e);
    }
  }

  async ngOnDestroy() {
    await this.cleanupKeyboardListeners();
  }
}