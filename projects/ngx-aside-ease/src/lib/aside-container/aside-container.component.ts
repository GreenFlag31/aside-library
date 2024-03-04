import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChild,
  Input,
} from '@angular/core';
import { AsideComponent } from '../aside/aside.component';
import { AsideService } from '../aside.service';

@Component({
  selector: 'ngx-aside-container',
  standalone: true,
  imports: [],
  template: `<section class="ngx-aside-content-container">
    <ng-content></ng-content>
  </section>`,
  styles: [
    `
      .ngx-aside-content-container {
        display: flex;
      }
    `,
  ],
})
export class AsideContainerComponent implements AfterViewInit {
  @ContentChild(AsideComponent) aside!: AsideComponent;

  constructor(private asideService: AsideService) {}

  ngAfterViewInit() {
    this.asideService.addInstance(this);
  }
}
