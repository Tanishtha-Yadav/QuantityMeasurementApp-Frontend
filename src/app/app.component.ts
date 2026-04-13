import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ErrorBannerComponent } from './components/shared/error-banner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ErrorBannerComponent],
  template: `
    <app-error-banner></app-error-banner>
    <router-outlet></router-outlet>
  `,
  styles: [
    `
      :host {
        @apply block w-full;
      }
    `,
  ],
})
export class AppComponent {
  title = 'Quantity Measurement App';
}
