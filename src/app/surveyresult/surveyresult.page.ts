import { Component, OnInit } from '@angular/core';
import { CommonService } from '../providers/common/common.service';
import { WebservicesService } from '../providers/webservices/webservices.service';
import { Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-surveyresult',
  templateUrl: './surveyresult.page.html',
  styleUrls: ['./surveyresult.page.scss'],
  standalone: false,
})
export class SurveyresultPage implements OnInit {
    userid: any;
    lId: any;
    exitBtnText: any;
    logoImage: string = '';
    thankyouContent = null;
    
    constructor(
        private web: WebservicesService,
        private common: CommonService,
        public router: Router,
        public navCtrl: NavController,
        public alertController: AlertController
    ) {
        this.userid = localStorage.getItem('SAloginID');
        if (this.userid == "anonymous") {
            this.exitBtnText = "Home";
        } else {
            this.exitBtnText = "Logout";
        }
        this.fillInfo();
    }

    ngOnInit() {
    }

    fillInfo() {
        let company = localStorage.getItem('surveyCompanyCodeLocal');
        if (company == null || company == '' || company == undefined || company == 'undefined') {
            this.router.navigate(['companycode']);
            return;
        }
        this.lId = window.localStorage.getItem("latestSurveyId");
        this.common.presentLoading();
        this.web.getData('getContent', 'page=survey_result&company=' + company).then(resData => {
            if (resData.status == 'success') {
                this.thankyouContent = resData.data[0].sa_section_content;
            } else {
                this.common.presentToast(resData.error);
            }
            this.common.closeLoading();
        }, (err) => {
            console.log(err);
            this.common.presentToast('Connection Error');
            this.common.closeLoading();
        });
    }

    gotoNav(navFor: any, button: any) {
        switch (navFor) {
            case 'startover':
                this.navCtrl.setDirection("root");
                this.router.navigateByUrl("/surveyform", {
                    skipLocationChange: true,
                });
                break;
            case 'sendcopy':
                let tempData = {
                    lSurveyId: this.lId,
                    userId: this.userid,
                    button_clicked: button
                };
                if (this.userid != "anonymous") {
                    this.common.presentLoading();
                    this.web.postData('api_SendCopyToUser', tempData).then(resData => {
                        if (resData.status == 'success') {
                            this.common.presentToast(resData.msg);
                        } else {
                            this.common.presentToast(resData.msg);
                        }
                        this.common.closeLoading();
                    }, (err) => {
                        console.log(err);
                        this.common.presentToast('Connection Error');
                        this.common.closeLoading();
                    });
                } else {
                    this.openEmailPrompt(button);
                }
                break;
        }
    }

    async openEmailPrompt(button: any) {
        const alert = await this.alertController.create({
            header: 'Send Survey Copy to Email!',
            backdropDismiss: false,
            inputs: [
                {
                    name: 'email',
                    type: 'text',
                    placeholder: 'Enter your email'
                }
            ],
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: () => {
                        console.log('Cancel');
                    }
                }, {
                    text: 'Ok',
                    handler: (data) => {
                        console.log('Ok');
                        console.log(data);
                        if (data.email != null && data.email != "") {
                            let emailTest = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
                            let emailTest2 = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+[^<>()\.,;:\s@\"]{2,})$/;
                            if (emailTest.test(data.email)) {
                                let tempData = {
                                    lSurveyId: this.lId,
                                    email: data.email,
                                    button_clicked: button
                                };
                                this.common.presentLoading();
                                this.web.postData('api_SendCopyToUser', tempData).then(resData => {
                                    if (resData.status == 'success') {
                                        this.common.presentToast(resData.msg);
                                        this.common.closeLoading();
                                        alert.dismiss();
                                    } else {
                                        this.common.presentToast(resData.msg);
                                        this.common.closeLoading();
                                    }
                                }, (err) => {
                                    console.log(err);
                                    this.common.presentToast('Connection Error');
                                    this.common.closeLoading();
                                    return false;
                                });
                            } else {
                                this.common.presentToast("Invalid email!");
                            }
                        } else {
                            this.common.presentToast("Please enter email");
                        }
                        return false;
                    }
                }
            ]
        });

        await alert.present();
    }

    LogoutApp() {
        localStorage.removeItem('SAloginID');
        if (this.exitBtnText == "Logout") {
            this.common.presentToast("Logout successfully!");
        }
        let navCtrlThis = this.navCtrl;
        let routerThis = this.router;
        setTimeout(function () {
            navCtrlThis.setDirection('root');
            routerThis.navigateByUrl('/home', { skipLocationChange: true });
        }, 500);
    }

    ionViewWillEnter() {
        this.updateLogo();
    }

    updateLogo() {
        let companyCode = localStorage.getItem('surveyCompanyCodeLocal');
        if (companyCode == null || companyCode == '' || companyCode == 'undefined') {
            this.router.navigate(['companycode']);
            return;
        }
        let logoUrl = localStorage.getItem('surveyCompanyLogoLocal');
        console.log(logoUrl, "logoUrl");
        if (logoUrl == null || logoUrl == '' || logoUrl == undefined || logoUrl == 'undefined' || logoUrl == 'null') {
            this.logoImage = '../../assets/img/logo.png';
        } else {
            this.logoImage = `${environment.base_url}uploads/logos/${logoUrl}`;
        }
    }
}