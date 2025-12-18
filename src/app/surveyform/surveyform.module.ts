import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SurveyformPageRoutingModule } from './surveyform-routing.module';

import { SurveyformPage } from './surveyform.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SurveyformPageRoutingModule
  ],
  declarations: [SurveyformPage]
})
export class SurveyformPageModule {}
