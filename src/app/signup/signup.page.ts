import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { CommonService } from "../providers/common/common.service";
import { WebservicesService } from "../providers/webservices/webservices.service";

@Component({
  selector: "app-companycode",
  templateUrl: "./signup.page.html",
  styleUrls: ["./signup.page.scss"],
  standalone: false,
})
export class SignupPage implements OnInit {
  signupform!: FormGroup;

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private common: CommonService,
    private web: WebservicesService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.buildForm();
  }

  togglePasswordVisibility(field: string) {
    if (field === "password") {
      this.showPassword = !this.showPassword;
    } else if (field === "confirm") {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  buildForm() {
    this.signupform = new FormGroup({
      cname: new FormControl("", [Validators.required]),
      uname: new FormControl("", [Validators.required]),
      email: new FormControl("", [
        Validators.required,
        Validators.pattern(
          /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i,
        ),
      ]),
      password: new FormControl("", [Validators.required]),
      confirm: new FormControl("", [Validators.required]),
      desc: new FormControl("", [Validators.required]),
    });
  }

  onsubmit() {
    if (this.signupform.value.password !== this.signupform.value.confirm) {
      this.common.presentToast("Confirm password is mismatched");
    } else {
      if (this.signupform.valid) {
        this.web.postData("registration", this.signupform.value)
          .then((res: any) => {
            if (res.status == "200") {
              this.common.presentToast(res.error);
              this.signupform.reset();
            } else {
              this.common.presentToast(res.error);
            }
          })
          .catch(err => {
            console.log(err);
            this.common.presentToast("Connection Error");
          });
      } else {
        this.common.presentToast("Check if all fields are filled properly and then try");
      }
    }
  }
}
