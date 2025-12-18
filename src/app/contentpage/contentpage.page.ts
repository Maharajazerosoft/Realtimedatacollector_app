import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from "@angular/common";
import { CommonService } from '../providers/common/common.service';
import { WebservicesService } from '../providers/webservices/webservices.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-contentpage',
  templateUrl: './contentpage.page.html',
  styleUrls: ['./contentpage.page.scss'],
  standalone: false
})
export class ContentpagePage implements OnInit {

  pageTitle: any;
  pageContent: any;
  pageType: any;
  logoImage: string = '';

  constructor(
    public activatedRoute: ActivatedRoute,
    public location: Location,
    public common: CommonService,
    public web: WebservicesService
  ) {
    this.pageType = this.activatedRoute.snapshot.paramMap.get('pageFor');
    console.log(this.pageType);
    this.loadPage();
  }

  ngOnInit() {
    this.updateLogo();
  }

  goBack() {
    this.common.closeLoading();
    this.location.back();
  }

  updateLogo() {
    let logoUrl = localStorage.getItem('surveyCompanyLogoLocal');
    console.log('logoUrl', logoUrl);
    if (logoUrl == null || logoUrl == '' || logoUrl == 'undefined' || logoUrl == 'null') {
      this.logoImage = 'assets/img/logo.png';
    } else {
      this.logoImage = `${environment.base_url}uploads/logos/${logoUrl}`;
    }
  }

  loadPage() {
    switch (this.pageType) {
      case "tos":
        this.loadContent("tos_pg");
        break;
      case "privacy":
        this.loadContent("privacy_pg");
        break;
      case "terms-master":
        this.loadContent("terms-master");
        break;
      case "privacy-master":
        this.loadContent("privacy-master");
        break;
    }
  }

  loadContent(pageFor: any) {
    var code = 'no';
    const company_code = localStorage.getItem('surveyCompanyCodeLocal');
    if (company_code != null && company_code != '') {
      code = company_code;
    }

    this.common.presentLoading();
    // Keep the original Promise-based approach since getData returns a Promise
    this.web.getData('getContent', 'page=' + pageFor + '&company=' + code).then(
      (resData: any) => {
        if (resData.status == 'success') {
          this.pageTitle = resData.data[0].sa_section_title;
          this.pageContent = resData.data[0].sa_section_content;
        }
        this.common.closeLoading();
      },
      (err: any) => {
        console.log(err);
        this.common.presentToast('Connection Error');
        this.common.closeLoading();
      }
    );
  }
}