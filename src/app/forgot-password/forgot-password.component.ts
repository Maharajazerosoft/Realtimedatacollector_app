import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CommonService } from 'src/app/providers/common/common.service';
import { WebservicesService } from 'src/app/providers/webservices/webservices.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: false
})
export class ForgotpasswordComponent implements OnInit {
  data: any = {};

  constructor(
    private modalCtrl: ModalController,
    private common: CommonService,
    private web: WebservicesService,
    private router: Router
  ) { }

  ngOnInit() {}

  async forgotPassword(val: any) {
    // Added null/undefined check for val parameter
    if (!val || val === undefined || val === "") {
      this.common.presentToast(`Enter your email.`);
      return;
    }
    
    if (val.email === undefined || val.email === "") {
      this.common.presentToast(`Enter email.`);
      return;
    }
    
    if (!this.common.validateEmail(val.email)) {
      this.common.presentToast(`Enter valid email.`);
      return;
    }

    let code = localStorage.getItem('surveyCompanyCodeLocal');
    if (code == null || code == '' || code == 'undefined') {
      // Note: Check if /companycode route exists in your new routing
      // If not, you may need to create this route or adjust it
      this.router.navigate(['/companycode'])
      return;
    }

    let obj = {
      email: val.email,
      company: code
    }

    this.common.presentLoading();
    this.web.postData("api_forgot_password", obj).then(
      (response: any) => {
        if (response.status === "success") {
          this.common.closeLoading();
          this.goToLogin();
          // Note: Fixed variable name from Response.error to response.msg
          // Changed from Response.error to response.msg for consistency with other services
          this.common.presentToast(response.msg || response.error || 'Password reset instructions sent');
        } else {
          this.common.closeLoading();
          // Note: Fixed variable name from Response.error to response.msg
          this.common.presentToast(response.msg || response.error || 'Error occurred');
        }
      },
      (err: any) => {
        this.common.closeLoading();
        this.common.presentToast(`Connection error`);
      }
    );
  }

  async goToLogin() {
    await this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

  // Added optional method for closing modal (useful for close button in template)
  async closeModal() {
    await this.modalCtrl.dismiss({
      'dismissed': true
    });
  }
}