import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AsideContainerComponent,
  AsideComponent,
  AsideItemDirective,
} from '../public-api';
import { AsideTitleDirective } from './aside/ngx-title.directive';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AsideContainerComponent,
    AsideComponent,
    AsideItemDirective,
    AsideTitleDirective,
  ],
  exports: [
    AsideContainerComponent,
    AsideComponent,
    AsideItemDirective,
    AsideTitleDirective,
  ],
})
export class AsideModule {}
