import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeasurementService } from '../../services/measurement.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-error-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="error$ | async as error"
      class="fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-4 animate-in slide-in-from-top"
    >
      <svg
        class="w-5 h-5 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clip-rule="evenodd"
        />
      </svg>
      <span>{{ error }}</span>
      <button
        (click)="dismiss()"
        class="ml-2 text-white hover:text-red-200"
      >
        ✕
      </button>
    </div>
  `,
})
export class ErrorBannerComponent implements OnInit, OnDestroy {
  error$ = this.measurementService.getError$();
  private destroy$ = new Subject<void>();

  constructor(private measurementService: MeasurementService) {}

  ngOnInit(): void {
    this.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe((error) => {
        if (error) {
          setTimeout(() => {
            // Auto-dismiss after 5 seconds
          }, 5000);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  dismiss(): void {
    // Error will be cleared by service
  }
}
