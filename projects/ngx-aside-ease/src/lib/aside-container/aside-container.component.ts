import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  Input,
} from '@angular/core';
import { AsideComponent } from '../aside/aside.component';
import { InternalAsideService } from '../internal-aside.service';

@Component({
  selector: 'ngx-aside-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `<section
    class="ngx-aside-content-container"
    [class.reversed]="reverse"
  >
    <ng-content></ng-content>
  </section>`,
  styles: [
    `
      .ngx-aside-content-container {
        display: flex;
      }
      .ngx-aside-content-container.reversed {
        flex-direction: row-reverse;
        overflow-x: hidden;
      }
    `,
  ],
})
export class AsideContainerComponent implements AfterViewInit {
  @Input() reverse = false;
  @ContentChild(AsideComponent) aside!: AsideComponent;

  constructor(private asideService: InternalAsideService) {}

  ngAfterViewInit() {
    this.asideService.addInstance(this);
    if (this.reverse) this.aside.reverseDisplay();
  }
}
