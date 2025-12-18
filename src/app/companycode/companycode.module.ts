import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CompanycodePageRoutingModule } from './companycode-routing.module';

import { CompanycodePage } from './companycode.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CompanycodePageRoutingModule
  ],
  declarations: [CompanycodePage]
})
export class CompanycodePageModule {}
