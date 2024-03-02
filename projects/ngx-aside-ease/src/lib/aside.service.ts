import { Injectable } from '@angular/core';
import { AsideComponent } from '../public-api';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AsideService {
  onSelectionChange = new Subject<HTMLElement>();
  aside!: AsideComponent;

  constructor() {}

  addInstance(instance: AsideComponent) {
    this.aside = instance;
  }

  toggleAsideVisibility() {
    if (this.aside.asideIsTotallyHiden) {
      this.aside.setAsideFullWidth();
    } else {
      this.aside.onCollapseBtnClick();
    }
  }
}
