import { Component } from '@angular/core';
// import { AdMob } from '@capacitor-community/admob';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor() {
    this.initializeAdMob();
  }

  async initializeAdMob() {
    // await AdMob.initialize();
  }
}