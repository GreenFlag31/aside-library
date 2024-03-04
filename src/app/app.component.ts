import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AsideModule } from '../../projects/ngx-aside-ease/src/lib/aside.module';
import { AsideService } from '../../projects/ngx-aside-ease/src/public-api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AsideModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
  view = 'ngx-aside-ease';
  @ViewChild('content') content!: ElementRef<HTMLDivElement>;

  constructor(private asideService: AsideService) {}

  ngOnInit() {
    this.asideService.onSelectionChange.subscribe((item) => {
      this.view = item.innerText.toLowerCase();

      if (this.view === 'general') this.view = 'ngx-aside-ease';
    });
  }

  onItemClick(text: string) {
    this.view = text;
  }

  onVisibilityToggle() {
    this.asideService.toggleVisibility();
  }
}
