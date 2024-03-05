import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { InternalAsideService } from '../aside.service';

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
    private asideService: InternalAsideService
  ) {}

  get native() {
    return this.element.nativeElement;
  }

  @HostListener('click')
  onItemClick() {
    if (this.disable) return;

    this.asideService.internalOnSelectionChange.next({
      element: this.native,
      animate: true,
    });
    this.asideService.onSelectionChange.next(this.native);
  }
}
