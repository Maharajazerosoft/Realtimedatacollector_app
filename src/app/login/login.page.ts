import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { CommonService } from "../providers/common/common.service";
import { WebservicesService } from "../providers/webservices/webservices.service";
import { NavController, ModalController } from "@ionic/angular";
import { ForgotpasswordComponent } from '../forgot-password/forgot-password.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"],
  standalone: false
})
export class LoginPage implements OnInit, OnDestroy {
  dataModel: any = {
    uName: "",
    uEmail: "",
    uPass: "",
  };

  savedLogins: any;
  userid: any;
  logoImage: string = '';
  
  private clickListener: any;

  constructor(
    public navCtrl: NavController,
    public router: Router,
    public commonService: CommonService,
    public webServices: WebservicesService,
    private modalCtrl: ModalController
  ) {
    this.userid = localStorage.getItem('SAloginID');
    let tempSavedLogins = localStorage.getItem('SAsavedLogins');
    if (tempSavedLogins != null) {
      this.savedLogins = JSON.parse(tempSavedLogins);
    } else {
      this.savedLogins = null;
    }
    
    if (this.userid != "" && this.userid != null) {
      this.router.navigateByUrl('/surveyform', { skipLocationChange: true });
    }
    
    // Store the listener reference for proper cleanup
    this.clickListener = (e: Event) => {
      let suggestionLister = document.getElementById("suggestion-list-id");
      if (suggestionLister && e.target instanceof Element && e.target.id !== "suggestion-list-id") {
        suggestionLister.style.display = "none";
      }
    };

    document.addEventListener("click", this.clickListener);
  }

  ngOnDestroy() {
    // Clean up event listeners to prevent memory leaks
    if (this.clickListener) {
      document.removeEventListener("click", this.clickListener);
    }
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

  ionViewWillEnter() {
    this.updateLogo();
  }

  fixScrollbarView() {
    let scrollbarSuggestion = document.getElementById("suggestion-list-scrollbar-id");
    let containerSuggestion = document.getElementById("suggestion-list-id");
    let sListSuggestion = document.getElementsByClassName("suggestion-list-email")[0];

    if (containerSuggestion && sListSuggestion && scrollbarSuggestion) {
      let containerHeight = containerSuggestion.offsetHeight;
      let listHeight = (sListSuggestion as HTMLElement).offsetHeight;
      let scrollbarRatio = containerHeight / listHeight;
      let scrollTotal = (listHeight - containerHeight) + 2;
      let scrollbarHeight = Math.max(scrollbarRatio * 100, 10);
      let scrollbarHeightEmpty = 100 - scrollbarHeight;
      let scrollbarHeightEmptyInPixel = (scrollbarHeightEmpty / 100) * containerHeight;
      let scrollbarHeightEmptyInPixel2 = listHeight - scrollbarHeightEmptyInPixel;
      scrollbarSuggestion.style.cssText = 'height:' + scrollbarHeight + '%; top:' + ((((containerSuggestion.scrollTop / scrollTotal) * 100) * scrollbarHeightEmptyInPixel2) / 100) + 'px;';
    }
  }

  ionViewDidEnter() {
    let scrollbarSuggestion = document.getElementById("suggestion-list-scrollbar-id");
    let containerSuggestion = document.getElementById("suggestion-list-id");
    let sListSuggestion = document.getElementsByClassName("suggestion-list-email")[0];
    
    const scrollerSuggestion = () => {
      if (containerSuggestion && sListSuggestion && scrollbarSuggestion) {
        let containerHeight = containerSuggestion.offsetHeight;
        let listHeight = (sListSuggestion as HTMLElement).offsetHeight;
        let scrollbarRatio = containerHeight / listHeight;
        let scrollTotal = (listHeight - containerHeight) + 2;
        let scrollbarHeight = Math.max(scrollbarRatio * 100, 10);
        let scrollbarHeightEmpty = 100 - scrollbarHeight;
        let scrollbarHeightEmptyInPixel = (scrollbarHeightEmpty / 100) * containerHeight;
        let scrollbarHeightEmptyInPixel2 = listHeight - scrollbarHeightEmptyInPixel;
        scrollbarSuggestion.style.cssText = 'height:' + scrollbarHeight + '%; top:' + ((((containerSuggestion.scrollTop / scrollTotal) * 100) * scrollbarHeightEmptyInPixel2) / 100) + 'px;';
      }
    };
    
    let suggestionLister = document.getElementById("suggestion-list-id");
    if (suggestionLister) {
      suggestionLister.addEventListener("scroll", scrollerSuggestion);
    }
  }

  ngOnInit() {}

  formValidation(userInput: any) {
    if (userInput.uEmail === undefined || userInput.uEmail === "") {
      this.commonService.presentToast(`Please enter email`);
      return false;
    } else if (!this.commonService.validateEmail(userInput.uEmail)) {
      this.commonService.presentToast(`Please enter valid email`);
      return false;
    } else if (userInput.uPass === undefined || userInput.uPass === "") {
      this.commonService.presentToast(`Please enter password`);
      return false;
    } else {
      return true;
    }
  }

  async forgotPasswordModal() {
    const modal = await this.modalCtrl.create({
      component: ForgotpasswordComponent
    });

    return await modal.present();
  }

  onButtonClick(actionFrom: any, extra: any) {
    switch (actionFrom) {
      case "login":
        let checkForn = this.formValidation(extra);
        if (checkForn) {
          let chkAlreadyExistUserName = this.checkAlreadyExistUserName(extra.uEmail);
          if (!chkAlreadyExistUserName) {
            if (this.savedLogins == null) {
              this.savedLogins = [];
            }
            this.savedLogins.push({ "userName": extra.uEmail, "userPass": extra.uPass });
            window.localStorage.setItem('SAsavedLogins', JSON.stringify(this.savedLogins));
          } else {
            this.savedLogins = this.updateByUserName(extra.uEmail, extra.uPass);
            window.localStorage.setItem('SAsavedLogins', JSON.stringify(this.savedLogins));
          }

          let code = localStorage.getItem('surveyCompanyCodeLocal');
          if (code == null || code == '' || code == 'undefined') {
            this.router.navigate(['/companycode'])
            return;
          }

          let tempData = {
            app_userEmail: extra.uEmail,
            app_userPass: extra.uPass,
            app_comp_code: code
          };
          
          this.commonService.presentLoading();
          this.webServices.postData("api_login", tempData).then(
            (result: any) => {
              switch (result.status) {
                case "success":
                  this.dataModel = {
                    uEmail: "",
                    uPass: "",
                  };
                  localStorage.setItem("SAloginID", result.data.userid);
                  this.commonService.closeLoading();
                  this.commonService.presentToast(result.msg);
                  this.navCtrl.setDirection("root");
                  this.router.navigateByUrl("/surveyform", {
                    skipLocationChange: true,
                  });
                  break;
                case "error":
                  this.commonService.closeLoading();
                  this.commonService.presentToast(result.msg);
                  break;
              }
            },
            (err: any) => {
              this.commonService.closeLoading();
              this.commonService.presentToast(`Connection error`);
            }
          );
        }
        break;
      case "cancel":
        this.dataModel = {
          uEmail: "",
          uPass: "",
        };
        // Note: /home route might not exist in new project structure
        // Check if you need to adjust this route
        this.router.navigate(['/select-intro']); // Changed from '/home' to '/select-intro'
        break;
    }
  }

  findSuggestion(email: any) {
    let that = this;
    console.log(email);
    setTimeout(function () {
      let suggestionList = that.findUserName(email);
      that.listSuggestionList(suggestionList);
      that.fixScrollbarView();
    }, 200);
  }

  findUserName(userName: any) {
    let tempSavedLogin = this.savedLogins;
    let tempSearchedArray: any[] = [];
    
    if (userName == "" || !tempSavedLogin)
      return tempSearchedArray;
      
    tempSavedLogin.forEach((obj: any) => {
      if (obj.userName && obj.userName.indexOf(userName) > -1) {
        tempSearchedArray.push({ "userName": obj.userName, "userPass": obj.userPass });
      }
    });
    return tempSearchedArray;
  }

  listSuggestionList(suggestionList: any[]) {
    let sdiv = document.getElementsByClassName("suggestion-list")[0];
    let slist = document.getElementsByClassName("suggestion-list-email")[0];
    
    if (suggestionList.length > 0 && sdiv && slist) {
      (slist as HTMLElement).innerHTML = "";
      for (let i = 0; i < suggestionList.length; i++) {
        let list = document.createElement("LI");
        list.innerHTML = suggestionList[i].userName;
        list.addEventListener("click", (e) => {
          this.dataModel.uEmail = suggestionList[i].userName;
          this.dataModel.uPass = suggestionList[i].userPass;
          (sdiv as HTMLElement).style.display = "none";
        });
        (slist as HTMLElement).appendChild(list);
      }
      (sdiv as HTMLElement).style.display = "block";
    } else if (sdiv && slist) {
      (sdiv as HTMLElement).style.display = "none";
      (slist as HTMLElement).innerHTML = "";
    }
  }

  checkAlreadyExistUserName(userName: any) {
    let result = false;
    if (this.savedLogins != null) {
      let tempSavedLogin = this.savedLogins;
      tempSavedLogin.forEach((obj: any) => {
        if (obj.userName == userName) {
          result = true;
        }
      });
    }
    return result;
  }

  updateByUserName(userName: any, userPass: any) {
    let tempSavedLogin = this.savedLogins;
    if (tempSavedLogin != null) {
      for (let i = 0; i < tempSavedLogin.length; i++) {
        if (tempSavedLogin[i].userName == userName) {
          tempSavedLogin[i].userPass = userPass;
        }
      }
    }
    return tempSavedLogin;
  }
}