import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SurveyformPage } from './surveyform.page';

const routes: Routes = [
  {
    path: '',
    component: SurveyformPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SurveyformPageRoutingModule {}
