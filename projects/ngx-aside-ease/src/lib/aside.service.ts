import { Injectable } from '@angular/core';
import { AsideContainerComponent } from '../public-api';
import { Subject } from 'rxjs';
import { Item } from './aside/interface';

@Injectable({
  providedIn: 'root',
})
export class InternalAsideService {
  internalOnSelectionChange = new Subject<Item>();
  onSelectionChange = new Subject<HTMLElement>();
  asideContainer!: AsideContainerComponent;

  constructor() {}

  addInstance(instance: AsideContainerComponent) {
    this.asideContainer = instance;
  }

  /**
   * Toggle the panel visibility.
   * The panel will either open partially or totally, depending on the responsive breakpoint set.
   */
  toggleVisibility() {
    const aside = this.asideContainer.aside;

    if (aside.isResponsiveMode) {
      aside.setAsideFullWidth();
    } else {
      aside.onCollapseBtnClick();
    }
  }
}
