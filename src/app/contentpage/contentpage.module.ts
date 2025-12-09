import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContentpagePageRoutingModule } from './contentpage-routing.module';

import { ContentpagePage } from './contentpage.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContentpagePageRoutingModule
  ],
  declarations: [ContentpagePage]
})
export class ContentpagePageModule {}
