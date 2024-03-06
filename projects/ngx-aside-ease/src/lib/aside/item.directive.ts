import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { InternalAsideService } from '../internal-aside.service';
import { AsideService } from '../aside.service';

@Directive({
  selector: '[ngxItem]',
  standalone: true,
  host: { class: 'ngx-item' },
})
export class AsideItemDirective {
  @Input() defaultActive = false;
  @Input() disable = false;

  constructor(
    private element: ElementRef<HTMLElement>,
    private internalAsideService: InternalAsideService,
    private asideService: AsideService
  ) {}

  get native() {
    return this.element.nativeElement;
  }

  @HostListener('click')
  onItemClick() {
    if (this.disable) return;

    this.internalAsideService.internalOnSelectionChange.next({
      element: this.native,
      animate: true,
    });
    this.asideService.onSelectionChange.next(this.native);
  }
}
