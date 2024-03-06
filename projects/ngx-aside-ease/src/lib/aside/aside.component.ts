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
import { InternalAsideService } from '../internal-aside.service';
import { Subject, debounceTime, fromEvent, takeUntil } from 'rxjs';
import { AsideItemDirective } from './item.directive';
import { ActivatedRoute, Router } from '@angular/router';
import { AsideService } from '../aside.service';

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
  @Input() asideAnimationTiming = '0.3s ease-out';
  @Input() markerAnimationTiming = '0.3s ease-out';
  @Input() enableResize = true;
  @Input() resizerColor = '#0095be';
  @Input() enableMarker = true;
  @Input() storePreference = true;
  @Input() updateUrl = true;
  @Input() paramUrlName = 'name';

  userWidth = 0;
  showCollapsableIcon = false;
  asideIsOpen = true;
  responsiveMode = false;
  asideContentTop = 0;
  destroy$ = new Subject<void>();
  asideFullWidthResponsive = false;
  keepUserNavigationChoice = false;
  reverse = false;
  timeoutID!: number;

  @ViewChild('asideWrapper') asideWrapper!: ElementRef<HTMLDivElement>;
  @ViewChild('asideContent') asideContent!: ElementRef<HTMLDivElement>;
  @ViewChild('resizer') resizer!: ElementRef<HTMLSpanElement>;
  @ViewChild('asideMarker') asideMarker!: ElementRef<HTMLSpanElement>;
  @ContentChildren(AsideItemDirective)
  items!: QueryList<AsideItemDirective>;

  constructor(
    private element: ElementRef<HTMLDivElement>,
    private internalAsideService: InternalAsideService,
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

  get isResponsiveMode() {
    return this.responsiveMode;
  }

  ngOnInit() {
    this.internalAsideService.internalOnSelectionChange
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
   * Retrieve the previous stored preference or take the defined width.
   * Initialise CSS variables.
   */
  ngAfterViewInit() {
    this.userWidth = this.width;
    if (this.storePreference) {
      this.userWidth =
        parseFloat(localStorage.getItem('user-width') || '') || this.width;
    }

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

  /**
   * Navigation by URL.
   * Not through the Angular API for synchronous reason. Give priority to the user choice over the default active item.
   * Apply 100 ms delay, a custom font can be not fully loaded.
   */
  activateParamsUrl() {
    if (!this.updateUrl) return;

    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    const params = new URLSearchParams(url.search);
    const name = params.get(this.paramUrlName)?.toLowerCase().trim() || '';
    const active = this.findTabToActivate(name);

    if (active instanceof HTMLElement) {
      this.timeoutID = window.setTimeout(() => {
        this.internalAsideService.internalOnSelectionChange.next({
          element: active,
          animate: false,
        });
      }, 100);

      this.asideService.onSelectionChange.next(active);
      this.keepUserNavigationChoice = true;
    }
  }

  /**
   * Navigation by URL.
   * Find the corresponding item and activate it.
   */
  findTabToActivate(name: string) {
    if (!name) return;
    const cleanedName = name.toLowerCase().trim();

    for (const item of this.items) {
      if (item.disable) return null;

      const text = item.native.innerText.toLowerCase();
      if (cleanedName === text) {
        return item.native;
      }
    }

    return null;
  }

  updateUrlTabs(text: string) {
    if (!this.updateUrl) return;

    const newUrl = {
      ...this.route.snapshot.queryParams,
      [this.paramUrlName]: text,
    };
    this.router.navigate([], { relativeTo: this.route, queryParams: newUrl });
  }

  /**
   * Set the default selected item.
   * Apply an delay of 100 ms in case of loading a custom font.
   * Give priority to user choice (URL) over the default item.
   */
  selectDefaultItem() {
    if (this.keepUserNavigationChoice) return;

    for (const item of this.items) {
      if (item.defaultActive && !item.disable) {
        this.timeoutID = window.setTimeout(() => {
          this.internalAsideService.internalOnSelectionChange.next({
            element: item.native,
            animate: false,
          });
        }, 100);
        this.asideService.onSelectionChange.next(item.native);
        break;
      }
    }
  }

  /**
   * Compute the min width in percent based in the provided value for the panel visibility reduction (non responsive mode).
   */
  updateMinWidthPercentDiff() {
    const minWidthPercentDiff = (this.minVisible / this.userWidth - 1) * 100;

    this.native.style.setProperty(
      '--min-width-percent-diff',
      `${minWidthPercentDiff}%`
    );
  }

  /**
   * Responsive mode triggered on basis on the breakpoint set.
   */
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
    this.native.style.transition = animate
      ? `width ${this.asideAnimationTiming}`
      : 'none';
    this.asideNative.style.transition = animate
      ? this.asideAnimationTiming
      : 'none';
  }

  /**
   * Position the left marker correctly.
   * Inverse it in reverse mode.
   */
  positionMarker(element: HTMLElement, animated = true) {
    if (!this.enableMarker) return;

    this.asideContentTop =
      this.asideContent.nativeElement.getBoundingClientRect().top;

    const { top } = element.getBoundingClientRect();
    const topMarker = top - this.asideContentTop;
    const leftMarker = this.reverse ? '100' : '0';

    this.asideMarker.nativeElement.style.height = element.clientHeight + 'px';
    this.asideMarker.nativeElement.style.transition = animated
      ? `top ${this.markerAnimationTiming}`
      : 'none';
    this.asideMarker.nativeElement.style.top = `${topMarker}px`;
    this.asideMarker.nativeElement.style.left = `${leftMarker}%`;
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
      if (pageX < this.minWidth) return;
      this.native.style.setProperty('--width', `${pageX}px`);
    };

    const onPointerUp = () => {
      this.userWidth = parseFloat(
        this.native.style.getPropertyValue('--width')
      );
      this.updateMinWidthPercentDiff();

      if (this.storePreference) {
        localStorage.setItem('user-width', `${this.userWidth}px`);
      }
      document.removeEventListener('pointermove', onPointerMove);
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp, {
      once: true,
    });
  }

  /**
   * In responsive mode, display/hide panel totally.
   */
  setAsideFullWidth() {
    this.asideFullWidthResponsive = !this.asideFullWidthResponsive;
    this.applyAnimations();
    this.cd.markForCheck();
  }

  onCollapseBtnClick() {
    this.asideIsOpen = !this.asideIsOpen;
    this.applyAnimations();
    this.cd.markForCheck();
  }

  /**
   * Reverse the panel position.
   * An overflow hidden has to be applied in reversed mode.
   */
  reverseDisplay() {
    this.reverse = true;
    document.body.style.overflow = 'hidden';
  }

  onMouseEnter() {
    this.showCollapsableIcon = true;
  }

  onMouseLeave() {
    this.showCollapsableIcon = false;
  }

  /**
   * Add active class to the element so the user can overload it with custom styles.
   */
  addClassActiveToElement(element: HTMLElement) {
    const prev = this.asideContent.nativeElement.querySelector('.active');
    prev?.classList.remove('active');
    element.classList.add('active');
  }

  @HostBinding('class.not-open')
  get notOpened() {
    return !this.asideIsOpen;
  }

  ngOnDestroy() {
    this.destroy$.next();
    clearTimeout(this.timeoutID);
  }
}
