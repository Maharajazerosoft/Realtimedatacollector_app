import { Component, OnInit, SecurityContext, ViewChild, ViewEncapsulation } from "@angular/core";
import { AdMob, BannerAdPosition, BannerAdSize, type BannerAdOptions } from '@capacitor-community/admob';
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import {
  ActionSheetController,
  AlertController,
  IonContent,
  ModalController,
  NavController,
  Platform,
} from "@ionic/angular";
import { environment } from "src/environments/environment";
import { AddressComponent } from "../address/address.component";
import { CommonService } from "../providers/common/common.service";
import { WebservicesService } from "../providers/webservices/webservices.service";

@Component({
  selector: "app-surveyform",
  templateUrl: "./surveyform.page.html",
  styleUrls: ["./surveyform.page.scss"],
  standalone: false,
  encapsulation: ViewEncapsulation.None,
})
export class SurveyformPage implements OnInit {
  @ViewChild(IonContent, { static: true })
  content!: IonContent;
  formBuilder: any = [];
  appResID: any = [];
  findCountryIndex: any = -1;
  findCountryExist: any = false;
  formLoop: any = 0;
  formTempLoop: any = [];
  formCountrySwitch: any = "yes";
  userid: any;
  exitBtnText: any;
  formData: any = [];
  logoImage: string = "../../assets/img/logo.png";
  formLoopRequired: any = [];
  validationText: string = "";
  baseUrl: string = environment.base_url;
  loading: boolean = false;
  companylogo: any;
  captchaNumber: string = "";
  captchaInput: string = "";
  isCaptchaInvalid: boolean = false;
  formattedCaptcha: string = "";
  allowed_member: any;
  submitted_cnt: any;

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public commonService: CommonService,
    public webServices: WebservicesService,
    public router: Router,
    private actionCtrl: ActionSheetController,
    private platform: Platform,
    public sanitize: DomSanitizer,
  ) {
    this.formBuilder = [];
    this.userid = localStorage.getItem("SAloginID");
    if (this.userid == "anonymous") {
      this.exitBtnText = "Home";
    } else {
      this.exitBtnText = "Logout";
    }
    this.loadFormData();
  }

  ngOnInit() {
    this.generateCaptcha();
    this.formBuilder = [];
    this.companylogo = localStorage.getItem("surveyCompanyLogoLocal");
    this.updateLogo();
    this.platform.ready().then(() => this.showBannerAd());
  }

  generateCaptcha() {
    const characters = "abcdefghijklmnopqrstuvwxyz";
    let captcha = "";
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      captcha += characters[randomIndex];
    }
    this.captchaNumber = captcha;
    this.formattedCaptcha = this.captchaNumber.toString().split("").join(" ");
  }

  refreshCaptcha() {
    this.generateCaptcha();
    this.captchaInput = "";
    this.isCaptchaInvalid = false;
  }

  updateLogo() {
    let companyCode = localStorage.getItem("surveyCompanyCodeLocal");
    if (companyCode == null || companyCode == "" || companyCode == "undefined") {
      this.router.navigate(["companycode"]);
      return;
    }
    let logoUrl = localStorage.getItem("surveyCompanyLogoLocal");
    console.log("logoUrl", logoUrl);
    if (logoUrl == null || logoUrl == "" || logoUrl == "undefined" || logoUrl == "null") {
      this.logoImage = "../../assets/img/logo.png";
    } else {
      this.logoImage = `${environment.base_url}uploads/logos/${logoUrl}`;
    }
  }

  private async showBannerAd() {
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    const options: BannerAdOptions = {
      adId: 'ca-app-pub-8416006941552663/5184354352',
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: false,
    };
    try {
      await AdMob.initialize();
      await AdMob.showBanner(options);
    } catch (err) {
      console.error('Survey form banner ad failed to show', err);
    }
  }

  loadFormData() {
    this.formBuilder = [];
    let company = localStorage.getItem("surveyCompanyCodeLocal");
    this.commonService.presentLoading();
    this.webServices.postData("api_getsurveyform2", { code: company }).then((result: any) => {
      this.commonService.closeLoading();
      switch (result.status) {
        case "success":
          let loopForm = 0;
          this.formLoopRequired = [];
          for (let j = 0; j < result.data.length; j++) {
            this.formTempLoop[j] = [];
            for (let i = 0; i < result.data[j].qnData.length; i++) {
              this.formData[loopForm] = null;
              this.formTempLoop[j][i] = loopForm;
              this.formLoopRequired.push({ section: j, mandatory: result.data[j].qnData[i].qnRequired, index: i });
              this.appResID.push(result.data[j].qnData[i].qnID);
              if (result.data[j].qnData[i].qnType == "country") {
                this.findCountryIndex = loopForm;
                this.findCountryExist = true;
                this.formData[this.findCountryIndex] = "yes";
              }
              loopForm++;
            }
          }
          for (let i = 0; i < result.data.length; i++) {
            for (let j = 0; j < result.data[i].qnData.length; j++) {
              if (result.data[i].qnData[j].qnType === "admin_cmd" && result.data[i].qnData[j].adminCmd) {
                const adminCmdText = result.data[i].qnData[j].adminCmd.replace(/<\/?[^>]+(>|$)/g, "").replace(
                  /\\r\\n/g,
                  "\n",
                );
                result.data[i].qnData[j].adminCmd = adminCmdText;
              }
            }
          }
          console.log(result.data.length);
          console.log(result.allowed_member, "allowed_member");
          this.allowed_member = result.allowed_member;
          this.submitted_cnt = result.submitted_cnt;
          this.formBuilder = result.data;
          console.log(this.formBuilder, " this.formBuilder");

          var self = this;
          setTimeout(function () {
            var subSec = document.getElementsByClassName("formSubSection");
            if (subSec != undefined) {
              for (let k = 0; k < subSec.length; k++) {
                let elemE = (<HTMLElement>subSec[k]).getElementsByClassName("subsecQuestionContainer")[0];
                let elemEHead = (<HTMLElement>subSec[k]).getElementsByClassName("formSubHead")[0];
                let elemEColRight = (<HTMLElement>elemEHead).getElementsByClassName("col-right")[0];
                let elemEIconSwitcher = (<HTMLElement>elemEColRight).getElementsByClassName("chevron-icon")[0];
                elemEIconSwitcher.classList.remove("expand");
                (<HTMLElement>elemE).style.display = "none";
                (<HTMLElement>elemEHead).addEventListener("click", (e) => {
                  let elll = e.currentTarget as HTMLElement;
                  let elll2 = elll.parentElement;
                  if (elll2) {
                    let elll3 = elll2.getElementsByClassName("subsecQuestionContainer")[0];
                    let ellEHead = (<HTMLElement>elll2).getElementsByClassName("formSubHead")[0];
                    let ellEColRight = (<HTMLElement>ellEHead).getElementsByClassName("col-right")[0];
                    let ellEIconSwitcher = (<HTMLElement>ellEColRight).getElementsByClassName("chevron-icon")[0];
                    let findOpenOrClose = (<HTMLElement>elll3).style.display;
                    if (findOpenOrClose != "none") {
                      ellEIconSwitcher.classList.remove("expand");
                      (<HTMLElement>elll3).style.display = "none";
                    } else {
                      ellEIconSwitcher.classList.add("expand");
                      (<HTMLElement>elll3).style.display = "block";
                      let yOffset = (<HTMLElement>elll).offsetTop;
                      self.content.scrollToPoint(0, yOffset - 10, 700);
                    }
                  }
                });
              }
            }
          }, 1000);
          this.commonService.closeLoading();
          break;
        case "error":
          this.formBuilder = false;
          this.commonService.closeLoading();
          this.commonService.presentToast(result.msg);
          break;
      }
    }, (err: any) => {
      this.formBuilder = false;
      this.commonService.closeLoading();
      this.commonService.presentToast(`Connection error`);
    });
  }

  async openAddress(ix: number) {
    const modal = await this.modalCtrl.create({
      component: AddressComponent,
    });
    modal.onDidDismiss().then((data) => {
      this.formData[ix] = window.localStorage.getItem("addressData");
    });
    return await modal.present();
  }

  gotoNav(navFor: any) {
    switch (navFor) {
      case "result":
        break;
    }
  }

  getLoopVal(i: any, j: any) {
    if (this.formTempLoop != undefined) {
      if (this.formTempLoop[i][j] != undefined) {
        return this.formTempLoop[i][j];
      }
    }
    return 0;
  }

  isCheckboxSelected(i: any, j: any): boolean {
    const selectedValues = this.formData[this.getLoopVal(i, j)];
    return selectedValues && selectedValues.length > 0;
  }

  toggleCheckbox(event: any, i: any, j: any): void {
    const checkboxValue = event.detail.checked;
    const selectedValues = this.formData[this.getLoopVal(i, j)] || [];
    if (checkboxValue) {
      if (selectedValues.indexOf("Male") === -1) {
        selectedValues.push("Male");
      }
    } else {
      const index = selectedValues.indexOf("Male");
      if (index !== -1) {
        selectedValues.splice(index, 1);
      }
    }
    this.formData[this.getLoopVal(i, j)] = selectedValues;
  }

  convertArraysToStrings(inputArray: any[]) {
    return inputArray.map((item: any) => {
      if (Array.isArray(item)) {
        return this.convertArrayToString(item);
      } else {
        return item;
      }
    });
  }

  convertArrayToString(array: any[]) {
    return array.join(",");
  }

  getDynamicHTML(tForm: any, i: number, j: number): string {
    if (tForm.qnType === "admin_cmd") {
      return `
            <div class="formText">
                <ion-item class="item-background-color">
                    <ion-label></ion-label>
                    <ion-textarea rows="2" cols="20" [(ngModel)]="tForm.adminCmd" name="formData[${this.getLoopVal(i, j)
        }]" readonly></ion-textarea>
                </ion-item>
            </div>
        `;
    } else {
      return "";
    }
  }

  sanitizeHtml(html: string): string {
    const sanitizedHtml = this.sanitize.sanitize(SecurityContext.NONE, html);
    if (!sanitizedHtml) {
      return "";
    }
    const tempElement = document.createElement("div");
    tempElement.innerHTML = sanitizedHtml;
    return tempElement.innerText;
  }

  async onButtonClick(actionFrom: any, extra: any) {
    const convertedUserInput = this.convertArraysToStrings(extra);
    let missingValid: any[] = [];

    this.formLoopRequired.forEach((el: any, i: number) => {
      if (el.mandatory == 1) {
        if (extra[i] == null || extra[i] == "") {
          missingValid.push({ section: el.section, index: el.index });
        }
      }
    });

    if (missingValid.length > 0) {
      let txt = "<b>Please answer</b>:\n";
      let memo: any = {};
      missingValid.forEach((element: any) => {
        txt += (!memo[element.section] ? `<br> Section ${element.section + 1}` : "")
          + (!memo[element.section] ? `: Question No:  ${element.index + 1}` : `${element.index + 1}`) + ", ";
        memo[element.section] = true;
      });
      this.validationText = txt.substring(0, txt.length - 2);
      this.commonService.presentToast("Please make sure fill all the mandatory questions");
      return;
    } else if (this.captchaInput == "") {
      this.commonService.presentToast(`Enter the captcha.`);
    } else if (this.captchaInput !== this.captchaNumber) {
      this.commonService.presentToast(`Invalid CAPTCHA, please try again.`);
    } else {
      this.validationText = "";
      switch (actionFrom) {
        case "submit":
          if (extra.length > 0) {
            let eligibleCount = 0;
            let eligible = false;
            for (let i = 0; i < extra.length; i++) {
              if (this.formData[i] != "" && this.formData[i] != null && (this.findCountryIndex != i)) {
                eligible = true;
                eligibleCount++;
              }
            }
            if (eligible) {
              let company = localStorage.getItem("surveyCompanyCodeLocal");
              const ipAddress = await this.getUserIP();
              if (company == null || company == "" || company == "undefined") {
                this.router.navigate(["companycode"]);
                return;
              }
              let tempData = {
                app_userInput: convertedUserInput,
                app_qnIDs: this.appResID,
                app_userID: this.userid,
                code: company,
                ipAddr: ipAddress || "N/A",
              };
              this.commonService.presentLoading();
              this.webServices.postData("api_saveResult", tempData).then((result: any) => {
                this.commonService.closeLoading();
                switch (result.status) {
                  case "success":
                    window.localStorage.removeItem("addressData");
                    window.localStorage.setItem("latestSurveyId", result.lId);
                    this.formData = [];
                    this.formTempLoop = [];
                    this.formCountrySwitch = "yes";
                    this.commonService.presentToast(result.msg);
                    this.navCtrl.setDirection("root");
                    this.router.navigateByUrl("/surveyresult", { skipLocationChange: true });
                    break;
                  case "error":
                    this.commonService.presentToast(result.msg);
                    break;
                }
              }, (err: any) => {
                this.commonService.closeLoading();
                this.commonService.presentToast(`Connection error`);
              });
            } else {
              this.commonService.presentToast(`Please answer atleast one question`);
            }
          } else {
            this.commonService.presentToast(`Error occurred`);
          }
          break;
        case "cancel":
          this.formData = [];
          break;
      }
    }
  }

  countryValue(evt: any) {
    this.formCountrySwitch = evt.detail.value;
  }

  async getUserIP() {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error("Error fetching IP:", error);
      return null;
    }
  }

  LogoutApp() {
    localStorage.removeItem("SAloginID");
    if (this.exitBtnText == "Logout") {
      this.commonService.presentToast("Logout successfully!");
    }
    let navCtrlThis = this.navCtrl;
    let routerThis = this.router;
    setTimeout(function () {
      navCtrlThis.setDirection("root");
      routerThis.navigateByUrl("/home", { skipLocationChange: true });
    }, 500);
  }

  questionConverter(text: string, required: number, index: number, type: any) {
    let qnNumber = (index + 1) + ". ";
    qnNumber = "";
    if (type === "admin_cmd") {
      const adminNoteDiv = "<span style=\"min-width: 27px; margin-top: 10px;\">(Admin Notes) &nbsp</span>";
      const tagMatch = text.match(/<[^>]+>/);
      if (tagMatch) {
        const tag = tagMatch[0];
        text = text.replace(tag, `${tag}${adminNoteDiv}`);
      } else {
        text = adminNoteDiv + text;
      }
    }
    text = text.replace(/<\/?u>/g, "");
    text = text.replace(/<\/?i>/g, "");
    text = text.replace(/<\/?em>/g, "");
    return qnNumber + text;
  }

  getSubsecTitle(tSubSec: any, index: number): string {
    return tSubSec.qnData.some((qn: any) => qn.qnType === "admin_cmd")
      ? tSubSec.subsecTitle
      : (index + 1) + ". " + tSubSec.subsecTitle;
  }

  getFileType(url: string): string {
    if (!url) return "";

    if (
      url.toLowerCase().endsWith(".jpg")
      || url.toLowerCase().endsWith(".jpeg")
      || url.toLowerCase().endsWith(".png")
      || url.toLowerCase().endsWith(".gif")
    ) {
      return "image";
    } else if (url.toLowerCase().endsWith(".pdf")) {
      return "pdf";
    } else {
      return "unknown";
    }
  }

  async actionSheetUpload(index: number) {
    // Hide banner before opening ActionSheet
    try {
      await AdMob.hideBanner();
    } catch (e) { }

    const actionSheet = await this.actionCtrl.create({
      header: 'Upload File',
      buttons: [
        {
          text: 'Camera',
          icon: 'camera-outline',
          handler: () => {
            this.captureImageCamera(index);
          },
        },
        {
          text: 'Gallery',
          icon: 'image-outline',
          handler: () => {
            this.captureImageGallery(index);
          },
        },
        {
          text: 'PDF File',
          icon: 'document-text-outline',
          handler: () => {
            this.uploadPDF(index);
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          icon: 'close-outline',
        },
      ],
    });

    // Resume banner AFTER ActionSheet is closed
    actionSheet.onDidDismiss().then(async () => {
      try {
        await AdMob.resumeBanner();
      } catch (e) { }
    });

    await actionSheet.present();
  }

  async captureImageCamera(index: number) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        correctOrientation: true,
      });

      if (image && image.webPath) {
        await this.uploadImageServer(image.webPath, index);
      }
    } catch (error) {
      console.error("Camera error:", error);
      this.commonService.presentToast("Camera cancelled or error occurred");
    }
  }

  async captureImageGallery(index: number) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
        correctOrientation: true,
      });

      if (image && image.webPath) {
        await this.uploadImageServer(image.webPath, index);
      }
    } catch (error) {
      console.error("Gallery error:", error);
      this.commonService.presentToast("Gallery cancelled or error occurred");
    }
  }

  async uploadImageServer(imagePath: any, questionIndex: number) {
    try {
      // Get image as blob
      const response = await fetch(imagePath);
      const blob = await response.blob();

      // Create filename
      const fileName = `survey-${Date.now()}.jpg`;

      const formData = new FormData();
      formData.append("image", blob, fileName);
      formData.append("filename", fileName);


      const uploadUrl = `${this.baseUrl}upload_website_image.php`;

      this.commonService.presentLoading(17000, "Image is uploading..");

      // Make the request
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      // Get response text first
      const responseText = await uploadResponse.text();

      // Parse JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        throw new Error("Invalid server response");
      }

      this.commonService.closeLoading();

      if (result.status === "200") {
        this.formData[questionIndex] = `${this.baseUrl}uploads/images/${fileName}`;
        this.commonService.presentToast("Image uploaded successfully");
      } else {
        console.error("Upload failed with result:", result);
        this.commonService.presentToast(result.error || "Image upload failed");
      }
    } catch (error) {
      this.commonService.closeLoading();
      console.error("Upload error details:", error);
      this.commonService.presentToast("Image upload failed: " + (error as Error).message);
    }
  }

  async uploadPDF(questionIndex: number) {
    try {
      // Create a file input element
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf,.PDF";

      input.onchange = async (event: any) => {
        const file = event.target.files[0];

        if (!file) {
          return;
        }

        // Check file type
        if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
          this.commonService.presentToast("Please select a PDF file");
          return;
        }

        // Check file size
        if (file.size > 10 * 1024 * 1024) {
          this.commonService.presentToast("File size should be less than 10MB");
          return;
        }

        await this.uploadPDFServer(file, questionIndex);
      };

      // Trigger file selection
      input.click();
    } catch (error) {
      console.error("PDF selection error:", error);
      this.commonService.presentToast("Error selecting PDF file");
    }
  }

  async uploadPDFServer(file: File, questionIndex: number) {
    try {
      // Create filename
      const fileName = `survey-${Date.now()}.pdf`;

      const formData = new FormData();
      formData.append("file", file, fileName);
      formData.append("filename", fileName);


      // Use the PDF upload endpoint
      const uploadUrl = `${this.baseUrl}upload_website_pdf.php`;

      this.commonService.presentLoading(17000, "PDF is uploading..");

      // Make the request
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      // Get response text first
      const responseText = await uploadResponse.text();

      // Parse JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        throw new Error("Invalid server response");
      }

      this.commonService.closeLoading();

      if (result.status === "200") {
        this.formData[questionIndex] = `${this.baseUrl}uploads/pdf/${fileName}`;
        this.commonService.presentToast("PDF uploaded successfully");
      } else {
        console.error("Upload failed with result:", result);
        this.commonService.presentToast(result.error || result.message || "PDF upload failed");
      }
    } catch (error) {
      this.commonService.closeLoading();
      console.error("Upload error details:", error);
      this.commonService.presentToast("PDF upload failed: " + (error as Error).message);
    }
  }
}
