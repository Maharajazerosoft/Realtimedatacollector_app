import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SurveyresultPageRoutingModule } from './surveyresult-routing.module';

import { SurveyresultPage } from './surveyresult.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SurveyresultPageRoutingModule
  ],
  declarations: [SurveyresultPage]
})
export class SurveyresultPageModule {}
