import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SurveyresultPage } from './surveyresult.page';

const routes: Routes = [
  {
    path: '',
    component: SurveyresultPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SurveyresultPageRoutingModule {}
