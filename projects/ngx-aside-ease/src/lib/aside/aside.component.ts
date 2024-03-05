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
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'ngx-aside',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'aside.component.html',
  styleUrls: ['aside.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsideComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() minVisible = 30;
  @Input() minWidth = 250;
  @Input() width = 300;
  @Input() maxWidth = '50';
  @Input() responsiveBreakpoint = 800;
  @Input() displayCollapsableIcon = true;
  @Input() asideAnimation = true;
  @Input() asideAnimationTiming = '0.3s ease-out';
  // @Input() contentAnimation = true;
  @Input() enableResize = true;
  @Input() resizerColor = '#0095be';
  @Input() enableMarker = true;
  @Input() markerAnimation = true;
  @Input() markerAnimationTiming = '0.3s ease-out';
  @Input() updateUrl = true;
  @Input() updateParamsUrl = { name: '' };

  userWidth = 0;
  showCollapsableIcon = false;
  asideIsOpen = true;
  responsiveMode = false;
  minWidthComp = 0;
  asideContentTop = 0;
  destroy$ = new Subject<void>();
  asideFullWidthResponsive = false;
  keepUserNavigationChoice = false;
  reverse = false;

  @ViewChild('asideWrapper') asideWrapper!: ElementRef<HTMLDivElement>;
  @ViewChild('asideContent') asideContent!: ElementRef<HTMLDivElement>;
  @ViewChild('resizer') resizer!: ElementRef<HTMLSpanElement>;
  @ViewChild('asideMarker') asideMarker!: ElementRef<HTMLSpanElement>;
  @ContentChildren(AsideCategoryDirective)
  items!: QueryList<AsideCategoryDirective>;

  constructor(
    private element: ElementRef<HTMLDivElement>,
    private asideService: AsideService,
    private router: Router,
    private route: ActivatedRoute,
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

  get isResponsiveMode() {
    return this.responsiveMode;
  }

  set asideFullWidth(value: boolean) {
    this.asideFullWidthResponsive = value;
  }

  ngOnInit() {
    this.asideService.internalOnSelectionChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((item) => {
        const { element, animate } = item;
        this.positionMarker(element, animate);
        this.updateUrlTabs(element.innerText.toLowerCase());
        this.addClassActiveToElement(element);
      });

    fromEvent(window, 'resize')
      .pipe(takeUntil(this.destroy$), debounceTime(300))
      .subscribe(() => {
        this.applyResponsive();
      });
  }

  /**
   * Add active class to the element so the user can overload it with custom styles.
   */
  addClassActiveToElement(element: HTMLElement) {
    const prev = this.asideContent.nativeElement.querySelector('.active');
    prev?.classList.remove('active');
    element.classList.add('active');
  }

  /**
   * Retrieve the previous stored preference or take the width set.
   * Initialise CSS variables.
   */
  ngAfterViewInit() {
    this.userWidth =
      parseFloat(localStorage.getItem('user-width') || '') || this.width;
    this.minWidthComp = this.minWidth || 0.1 * this.userWidth;
    this.updateMinWidthPercentDiff();

    this.native.style.setProperty('--min-width', `${this.minWidth}px`);
    this.native.style.setProperty(
      '--min-width-visible',
      `${this.minVisible}px`
    );
    this.native.style.setProperty('--width', `${this.userWidth}px`);
    this.native.style.setProperty('--max-width', `${this.maxWidth}vw`);

    this.applyResponsive(false);
    this.activateParamsUrl();
    this.selectDefaultItem();

    if (this.enableResize) this.resize();
  }

  reverseDisplay() {
    this.reverse = true;
    document.body.style.overflow = 'hidden';
  }

  /**
   * Keep user choice for navigation.
   * Not through the Angular API for a synchronous reason. Give priority to the user choice over the default active item.
   * Apply 100 ms delay, a custom font can be not fully loaded.
   */
  activateParamsUrl() {
    if (!this.updateUrl) return;

    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    const params = new URLSearchParams(url.search);
    const name = params.get('name')?.toLowerCase().trim() || '';

    const active = this.findTabToActivate(name);

    if (active instanceof HTMLElement) {
      setTimeout(() => {
        this.asideService.internalOnSelectionChange.next({
          element: active,
          animate: false,
        });
      }, 100);

      this.asideService.onSelectionChange.next(active);
      this.keepUserNavigationChoice = true;
    }
  }

  findTabToActivate(active: string) {
    for (const item of this.items) {
      const text = item.native.innerText.toLowerCase();

      if (active.toLowerCase().trim() === text) {
        return item.native;
      }
    }

    return null;
  }

  updateMinWidthPercentDiff() {
    const minWidthPercentDiff = (this.minVisible / this.userWidth - 1) * 100;

    this.native.style.setProperty(
      '--min-width-percent-diff',
      `${minWidthPercentDiff}%`
    );
  }

  applyResponsive(animate = true) {
    this.responsiveMode = window.innerWidth < this.responsiveBreakpoint;
    this.applyAnimations(animate);

    if (this.responsiveMode) {
      this.native.style.setProperty('--width', '0');
      this.native.style.setProperty('--min-width-visible', '0');
    } else {
      this.native.style.setProperty('--width', `${this.userWidth}px`);
      this.native.style.setProperty(
        '--min-width-visible',
        `${this.minVisible}px`
      );
      this.asideFullWidthResponsive = false;
    }

    this.cd.markForCheck();
  }

  applyAnimations(animate = true) {
    if (this.asideAnimation && animate) {
      this.native.style.transition = `width ${this.asideAnimationTiming}`;
      this.asideNative.style.transition = `${this.asideAnimationTiming}`;
    } else if (!this.asideAnimation && !animate) {
      this.native.style.transition = 'none';
      this.asideNative.style.transition = 'none';
    }
  }

  setAsideFullWidth() {
    this.asideFullWidthResponsive = !this.asideFullWidthResponsive;
    this.applyAnimations();

    this.cd.markForCheck();
  }

  positionMarker(element: HTMLElement, animated = this.markerAnimation) {
    if (!this.enableMarker) return;

    this.asideContentTop = this.asideContentTopValue;

    const { top } = element.getBoundingClientRect();
    const topMarker = top - this.asideContentTop;
    const leftMarker = this.reverse ? '100%' : '0';

    this.asideMarker.nativeElement.style.height = element.clientHeight + 'px';
    this.asideMarker.nativeElement.style.transition = animated
      ? `top ${this.markerAnimationTiming}`
      : 'none';
    this.asideMarker.nativeElement.style.top = `${topMarker}px`;
    this.asideMarker.nativeElement.style.left = `${leftMarker}`;
  }

  /**
   * Set the default selected item.
   * Apply an delay of 100 ms in case of loading a custom font.
   * Give priority to user choice (URL) over the default item.
   */
  selectDefaultItem() {
    if (this.keepUserNavigationChoice) return;

    for (const item of this.items) {
      if (item.defaultActive) {
        setTimeout(() => {
          this.asideService.internalOnSelectionChange.next({
            element: item.native,
            animate: false,
          });
        }, 100);
        this.asideService.onSelectionChange.next(item.native);
        break;
      }
    }
  }

  updateUrlTabs(text: string) {
    if (!this.updateUrl) return;

    this.updateParamsUrl.name = text;
    const newUrl = {
      ...this.route.snapshot.queryParams,
      ...this.updateParamsUrl,
    };
    this.router.navigate([], { relativeTo: this.route, queryParams: newUrl });
  }

  resize() {
    this.resizerNative.style.setProperty('--resizer-color', this.resizerColor);
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
      const pageX = this.reverse ? window.innerWidth - e.pageX : e.pageX;
      if (pageX < this.minWidthComp) return;
      this.native.style.setProperty('--width', `${pageX}px`);
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

  onCollapseBtnClick() {
    this.asideIsOpen = !this.asideIsOpen;
    this.applyAnimations();
    this.cd.markForCheck();
  }

  /**
   * Display toggle icon on mouse enter
   * Hide if full width on responsive.
   */
  onMouseEnter() {
    // if (this.responsiveMode) return;
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
