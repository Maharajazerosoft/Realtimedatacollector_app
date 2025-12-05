import { Injectable } from '@angular/core';
import {LoadingController, Platform, ToastController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  loading: any;
  profile: any;

  constructor(
      public loadingController: LoadingController,
      public toastController: ToastController,
      public platform: Platform) {
    console.log('Hello CommonProvider Provider');
  }

  validateEmail(email : string) {
    const re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
  }

  async presentLoading(time:number=17000, msg:string='Please wait..') {
    this.loading = await this.loadingController.create({
      message:"Please wait ...",
      duration: time
    });
    await this.loading.present();
  }

  async closeLoading() {
    setTimeout(async () => {
      try{
        let topLoader = await this.loadingController.getTop();
        while (topLoader) {
          if (!(await topLoader.dismiss())) {
            throw new Error("Could not dismiss the topmost loader. Aborting...");
            //console.log('Error aborting');
          }
          topLoader = await this.loadingController.getTop();
        }
      }
      catch(e){
        console.log('problem with loader');
      }

    }, 800);

    //await this.loading.dismiss();
  }

  async presentToast(msg: any) {
    const toast = await this.toastController.create({
      message: `${msg}`,
      duration: 3000
    });
    toast.present();
  }
}
