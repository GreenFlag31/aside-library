import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngx-aside-container',
  standalone: true,
  imports: [],
  templateUrl: 'aside-container.component.html',
  styleUrls: ['aside-container.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // encapsulation: ViewEncapsulation.None,
})
export class AsideContainerComponent {}
