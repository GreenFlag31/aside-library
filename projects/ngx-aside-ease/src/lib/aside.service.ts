import { Injectable } from '@angular/core';
import { InternalAsideService } from './internal-aside.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AsideService {
  onSelectionChange = new Subject<HTMLElement>();

  constructor(private internalAsideService: InternalAsideService) {}

  /**
   * Toggle the panel visibility.
   * The panel will either open partially or totally, depending on the responsive breakpoint set.
   */
  toggleVisibility() {
    this.internalAsideService.toggleVisibility();
  }
}
