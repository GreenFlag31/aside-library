import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AsideContainerComponent,
  AsideComponent,
  AsideCategoryDirective,
} from '../public-api';
import { AsideTitleDirective } from './aside/ngx-title.directive';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AsideContainerComponent,
    AsideComponent,
    AsideCategoryDirective,
    AsideTitleDirective,
  ],
  exports: [
    AsideContainerComponent,
    AsideComponent,
    AsideCategoryDirective,
    AsideTitleDirective,
  ],
})
export class AsideModule {}
