import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SelectIntroPageRoutingModule } from './select-intro-routing.module';
import { SelectIntroPage } from './select-intro.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SelectIntroPageRoutingModule
  ],
  declarations: [SelectIntroPage]
})
export class SelectIntroPageModule {}
