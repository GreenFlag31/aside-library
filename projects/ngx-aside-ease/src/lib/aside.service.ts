import { Injectable } from '@angular/core';
import { AsideContainerComponent } from '../public-api';
import { Subject } from 'rxjs';
import { Item } from './aside/interface';

@Injectable({
  providedIn: 'root',
})
export class AsideService {
  internalOnSelectionChange = new Subject<Item>();
  onSelectionChange = new Subject<HTMLElement>();
  asideContainer!: AsideContainerComponent;

  constructor() {}

  addInstance(instance: AsideContainerComponent) {
    this.asideContainer = instance;
  }

  toggleVisibility() {
    const aside = this.asideContainer.aside;

    if (aside.isResponsiveMode) {
      aside.setAsideFullWidth();
    } else {
      aside.onCollapseBtnClick();
    }
  }
}
