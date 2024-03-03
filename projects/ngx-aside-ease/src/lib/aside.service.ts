import { Injectable } from '@angular/core';
import { AsideComponent } from '../public-api';
import { Subject } from 'rxjs';
import { Item } from './aside/interface';

@Injectable({
  providedIn: 'root',
})
export class AsideService {
  internalOnSelectionChange = new Subject<Item>();
  onSelectionChange = new Subject<HTMLElement>();
  aside!: AsideComponent;

  constructor() {}

  addInstance(instance: AsideComponent) {
    this.aside = instance;
  }

  toggleVisibility() {
    if (this.aside.asideIsTotallyHiden) {
      this.aside.setAsideFullWidth();
    } else {
      this.aside.onCollapseBtnClick();
    }
  }
}
