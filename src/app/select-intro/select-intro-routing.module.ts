import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectIntroPage } from './select-intro.page';

const routes: Routes = [
  {
    path: '',
    component: SelectIntroPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectIntroPageRoutingModule {}
