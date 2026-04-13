import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center p-4">
      <div class="card w-full max-w-md shadow-xl">
        <!-- Beaker Icon -->
        <div class="flex justify-center mb-4">
          <svg class="w-16 h-16 text-primary" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Beaker Body -->
            <rect x="20" y="15" width="35" height="55" rx="2" fill="currentColor" opacity="0.3" stroke="currentColor" stroke-width="2.5"/>
            <!-- Beaker Neck -->
            <rect x="30" y="8" width="15" height="8" fill="none" stroke="currentColor" stroke-width="2.5"/>
            <!-- Beaker Spout -->
            <line x1="50" y1="25" x2="65" y2="20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            <!-- Liquid Level -->
            <rect x="22" y="50" width="31" height="15" fill="currentColor" opacity="0.7"/>
            <!-- Base -->
            <rect x="18" y="72" width="39" height="8" rx="1" fill="currentColor" opacity="0.4" stroke="currentColor" stroke-width="2"/>
            <!-- Measurement Marks -->
            <line x1="48" y1="30" x2="58" y2="30" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="48" y1="38" x2="58" y2="38" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="48" y1="46" x2="58" y2="46" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        
        <h1 class="text-3xl font-bold text-center mb-2 text-primary">Quantity Measurement</h1>
        <h2 class="text-xl font-semibold text-center mb-6 text-text-secondary">Login</h2>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              formControlName="email"
              class="input-field"
              placeholder="Enter your email"
              required
            />
            <div
              *ngIf="
                loginForm.get('email')?.hasError('required') &&
                loginForm.get('email')?.touched
              "
              class="error-text"
            >
              Email is required
            </div>
            <div
              *ngIf="
                loginForm.get('email')?.hasError('email') &&
                loginForm.get('email')?.touched
              "
              class="error-text"
            >
              Please enter a valid email
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              formControlName="password"
              class="input-field"
              placeholder="Enter your password"
              required
            />
            <div
              *ngIf="
                loginForm.get('password')?.hasError('required') &&
                loginForm.get('password')?.touched
              "
              class="error-text"
            >
              Password is required
            </div>
          </div>

          <app-loading-spinner [isLoading]="isLoading"></app-loading-spinner>

          <button
            type="submit"
            class="btn btn-primary w-full justify-center text-lg"
            [disabled]="isLoading || loginForm.invalid"
          >
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <div class="mt-6 border-t pt-4">
          <p class="text-center text-text-secondary mb-4">
            Don't have an account?
            <a routerLink="/register" class="text-primary font-semibold hover:underline">
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        @apply block w-full;
      }
    `,
  ],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    const credentials = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value,
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/measurement']);
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.message;
      },
    });
  }
}
