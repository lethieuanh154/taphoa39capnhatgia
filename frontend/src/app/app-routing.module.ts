import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';

export const routes: Routes = [
  { path: 'SUA_NGU_COC', component: AppComponent },
  { path: 'MY_TOM_GAO_TRUNG_XUC_XICH', component: AppComponent },
  { path: 'GIAY_DO_DUNG_BEP_AO_MUA', component: AppComponent },
  { path: 'BIA_NUOC_NGOT', component: AppComponent },
  { path: 'THUOC_LA', component: AppComponent },
  { path: 'BANH_HOP_GOI', component: AppComponent },
  { path: 'KEM_DO_DONG_LANH', component: AppComponent },
  { path: 'HOA_MY_PHAM', component: AppComponent },
  { path: 'BANH_MY_TUOI', component: AppComponent },
  { path: 'CARD', component: AppComponent },
  { path: 'DO_HOP', component: AppComponent },
  { path: 'GIA_VI_DO_KHO', component: AppComponent },
  { path: 'KEO_DO_CHOI', component: AppComponent },
  { path: 'NUOC_YEN', component: AppComponent },
  { path: 'RUOU_TRA_CAFE', component: AppComponent },
  { path: 'BANH_TRANG', component: AppComponent },
  { path: 'HUONG_NHANG_DO_CUNG', component: AppComponent },
  { path: 'SUA_CHUA_LEN_MEN', component: AppComponent },
  { path: 'VAN_PHONG_PHAM', component: AppComponent },
  { path: 'AN_VAT', component: AppComponent },
  { path: 'all', component: AppComponent },
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: '**', redirectTo: '/' },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }