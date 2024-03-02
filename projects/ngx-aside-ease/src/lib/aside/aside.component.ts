import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
} from '@angular/core';
import { AsideService } from '../aside.service';
import { Subject, debounceTime, fromEvent, takeUntil } from 'rxjs';
import { AsideCategoryDirective } from './category.directive';

@Component({
  selector: 'ngx-aside',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'aside.component.html',
  styleUrls: ['aside.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsideComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() minWidth = 30;
  @Input() width = 300;
  @Input() maxWidth = '50';
  @Input() responsiveBreakpoint = 800;
  @Input() displayCollapsableIcon = true;
  @Input() asideAnimation = true;
  @Input() contentAnimation = true;
  @Input() enableResizer = true;
  @Input() enableMarker = true;
  @Input() markerAnimation = true;

  userWidth = 0;
  showCollapsableIcon = false;
  asideIsOpen = true;
  asideTotalHide = false;
  minWidthComp = 0;
  asideContentTop = 0;
  destroy$ = new Subject<void>();
  asideFullWidthResponsive = false;

  @ViewChild('asideWrapper') asideWrapper!: ElementRef<HTMLDivElement>;
  @ViewChild('asideContent') asideContent!: ElementRef<HTMLDivElement>;
  @ViewChild('resizer') resizer!: ElementRef<HTMLSpanElement>;
  @ViewChild('asideMarker') asideMarker!: ElementRef<HTMLSpanElement>;
  @ContentChildren(AsideCategoryDirective)
  items!: QueryList<AsideCategoryDirective>;

  constructor(
    private element: ElementRef<HTMLDivElement>,
    private asideService: AsideService,
    private cd: ChangeDetectorRef
  ) {}

  get native() {
    return this.element.nativeElement;
  }

  get asideNative() {
    return this.asideWrapper.nativeElement;
  }

  get resizerNative() {
    return this.resizer.nativeElement;
  }

  get asideContentTopValue() {
    return this.asideContent.nativeElement.getBoundingClientRect().top;
  }

  get asideIsTotallyHiden() {
    return this.asideTotalHide;
  }

  set asideFullWidth(value: boolean) {
    this.asideFullWidthResponsive = value;
  }

  ngOnInit() {
    this.asideService.addInstance(this);

    this.asideService.onSelectionChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((element) => {
        this.onItemSelection(element);
      });

    fromEvent(window, 'resize')
      .pipe(takeUntil(this.destroy$), debounceTime(300))
      .subscribe(() => {
        this.applyResponsive();
      });
  }

  ngAfterViewInit() {
    this.userWidth =
      parseFloat(localStorage.getItem('user-width') || '') || this.width;
    this.minWidthComp = this.minWidth || 0.1 * this.userWidth;
    this.updateMinWidthPercentDiff();

    this.native.style.setProperty('--min-width', `${this.minWidthComp}px`);
    this.native.style.setProperty('--width', `${this.userWidth}px`);
    this.native.style.setProperty('--max-width', `${this.maxWidth}vw`);

    this.applyResponsive(false);
    this.selectDefaultItem();

    if (this.enableResizer) {
      this.resize();
    }
  }

  updateMinWidthPercentDiff() {
    const minWidthPercentDiff = (this.minWidthComp / this.userWidth - 1) * 100;

    this.native.style.setProperty(
      '--min-width-percent-diff',
      `${minWidthPercentDiff}%`
    );
  }

  applyResponsive(animate = true) {
    this.asideTotalHide = window.innerWidth < this.responsiveBreakpoint;
    this.applyAnimations(animate);

    if (this.asideTotalHide) {
      this.native.style.setProperty('--width', '0');
    } else {
      this.native.style.setProperty('--width', `${this.userWidth}px`);
      this.asideFullWidthResponsive = false;
    }

    this.cd.markForCheck();
  }

  setAsideFullWidth() {
    this.applyAnimations();

    this.asideFullWidthResponsive = !this.asideFullWidthResponsive;
    this.showCollapsableIcon = !this.asideFullWidthResponsive;
    this.cd.markForCheck();
  }

  onItemSelection(element: HTMLElement, animated = this.markerAnimation) {
    this.asideContentTop = this.asideContentTopValue;
    const top = element.getBoundingClientRect().top - this.asideContentTop;

    this.asideMarker.nativeElement.style.transition = animated
      ? 'top 0.3s ease-out'
      : 'none';
    this.asideMarker.nativeElement.style.top = `${top}px`;
  }

  selectDefaultItem() {
    for (const item of this.items) {
      if (item.defaultActive) {
        this.onItemSelection(item.native, false);
        this.asideService.onSelectionChange.next(item.native);
        break;
      }
    }
  }

  resize() {
    this.resizerNative.addEventListener(
      'pointerdown',
      this.onPointerDown.bind(this)
    );
  }

  /**
   * Triggered on Mouse and Touch event.
   * Prevent text selection, set the CSS variable for width adaptation, add other event listeners.
   */
  onPointerDown(e: PointerEvent) {
    e.preventDefault();
    this.asideNative.style.transition = 'none';
    this.native.style.transition = 'none';

    const onPointerMove = (e: PointerEvent) => {
      if (e.pageX < this.minWidthComp) return;
      this.native.style.setProperty('--width', `${e.pageX}px`);
    };

    const onPointerUp = () => {
      this.userWidth = parseFloat(
        this.native.style.getPropertyValue('--width')
      );
      this.updateMinWidthPercentDiff();

      localStorage.setItem('user-width', `${this.userWidth}px`);
      document.removeEventListener('pointermove', onPointerMove);
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp, {
      once: true,
    });
  }

  applyAnimations(animate = true) {
    this.asideNative.style.transition =
      this.asideAnimation && animate ? '0.3s ease-out' : 'none';
    this.native.style.transition =
      this.contentAnimation && animate ? '0.3s ease-out' : 'none';
  }

  onCollapseBtnClick() {
    this.applyAnimations();
    this.asideIsOpen = !this.asideIsOpen;
    this.cd.markForCheck();
  }

  onMouseEnter() {
    this.showCollapsableIcon = true;
  }

  onMouseLeave() {
    this.showCollapsableIcon = false;
  }

  @HostBinding('class.not-open')
  get notOpened() {
    return !this.asideIsOpen;
  }

  ngOnDestroy() {
    this.destroy$.next();
  }
}
