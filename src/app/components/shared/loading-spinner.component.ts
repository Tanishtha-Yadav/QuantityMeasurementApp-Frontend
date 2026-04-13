import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isLoading" class="flex items-center justify-center p-4">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>
  `,
})
export class LoadingSpinnerComponent {
  @Input() isLoading: boolean | null = false;
}
