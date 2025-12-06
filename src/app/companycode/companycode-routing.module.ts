import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CompanycodePage } from './companycode.page';

const routes: Routes = [
  {
    path: '',
    component: CompanycodePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompanycodePageRoutingModule {}
