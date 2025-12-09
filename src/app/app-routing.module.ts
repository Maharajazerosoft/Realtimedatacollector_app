import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'select-intro', pathMatch: 'full' },
  {
    path: 'select-intro',
    loadChildren: () => import('./select-intro/select-intro.module').then(m => m.SelectIntroPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'companycode',
    loadChildren: () => import('./companycode/companycode.module').then( m => m.CompanycodePageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'surveyform',
    loadChildren: () => import('./surveyform/surveyform.module').then( m => m.SurveyformPageModule)
  },
  {
    path: 'surveyresult',
    loadChildren: () => import('./surveyresult/surveyresult.module').then( m => m.SurveyresultPageModule)
  },  {
    path: 'contentpage',
    loadChildren: () => import('./contentpage/contentpage.module').then( m => m.ContentpagePageModule)
  },
  {
    path: 'signup',
    loadChildren: () => import('./signup/signup.module').then( m => m.SignupPageModule)
  }


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
