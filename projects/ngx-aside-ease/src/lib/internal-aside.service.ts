import { Injectable } from '@angular/core';
import { AsideContainerComponent } from '../public-api';
import { Subject } from 'rxjs';
import { Item } from './aside/interface';

@Injectable({
  providedIn: 'root',
})
export class InternalAsideService {
  asideContainer!: AsideContainerComponent;
  internalOnSelectionChange = new Subject<Item>();

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
