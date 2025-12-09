import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContentpagePage } from './contentpage.page';

const routes: Routes = [
  {
    path: '',
    component: ContentpagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContentpagePageRoutingModule {}
