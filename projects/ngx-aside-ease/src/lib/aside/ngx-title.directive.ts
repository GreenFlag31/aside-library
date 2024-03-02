import { Directive } from '@angular/core';

@Directive({
  selector: '[ngxTitle]',
  standalone: true,
  host: { class: 'ngx-title' },
})
export class AsideTitleDirective {
  constructor() {}
}
