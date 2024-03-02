import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { AsideService } from '../aside.service';

@Directive({
  selector: '[ngxCategory]',
  standalone: true,
  host: { class: 'ngx-category' },
})
export class AsideCategoryDirective {
  @Input() defaultActive = false;

  constructor(
    private element: ElementRef<HTMLElement>,
    private asideService: AsideService
  ) {}

  get native() {
    return this.element.nativeElement;
  }

  @HostListener('click')
  onItemClick() {
    this.asideService.onSelectionChange.next(this.native);
  }
}
