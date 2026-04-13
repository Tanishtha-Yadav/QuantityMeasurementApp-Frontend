import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MeasurementService } from '../../services/measurement.service';
import { AuthService } from '../../services/auth.service';
import { MeasurementType, ActionType, Operator } from '../../models';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';
import { UnitFormatPipe } from '../../pipes/unit-format.pipe';
import { ComparisonSymbolPipe } from '../../pipes/comparison-symbol.pipe';

@Component({
  selector: 'app-quantity-measurement',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent, UnitFormatPipe, ComparisonSymbolPipe],
  template: `
    <div class="min-h-screen bg-surface">
      <!-- Navbar -->
      <nav class="bg-primary text-white py-4 px-6 shadow-lg">
        <div class="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-bold">Quantity Measurement</h2>
          </div>
          <div class="flex items-center gap-6">
            <span *ngIf="(currentUser$ | async) as user" class="text-sm">
              Welcome, <span class="font-semibold">{{ user.email }}</span>
            </span>
            <button
              (click)="logout()"
              class="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div class="py-8">
        <div class="max-w-6xl mx-auto px-4">
          <!-- Header -->
          <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-6 px-6 rounded-lg mb-8 shadow-lg">
            <h1 class="text-4xl font-bold text-center">Welcome To Quantity Measurement</h1>
          </div>

        <div class="space-y-8">
          <!-- Type Selector -->
          <div class="card">
            <h2 class="text-sm font-bold text-text-secondary mb-4 uppercase">Choose Type</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                *ngFor="let type of measurementTypes"
                (click)="selectType(type)"
                [class.border-2]="state.selectedType === type"
                [class.border-primary]="state.selectedType === type"
                [class.bg-blue-50]="state.selectedType === type"
                class="p-6 rounded-lg border-2 border-gray-200 hover:border-primary transition-all text-center font-semibold"
              >
                <div class="text-4xl mb-2">{{ getTypeIcon(type) }}</div>
                {{ formatTypeName(type) }}
              </button>
            </div>
          </div>

          <!-- Action Tabs -->
          <div class="card">
            <h2 class="text-sm font-bold text-text-secondary mb-4 uppercase">Choose Action</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                *ngFor="let action of actionTypes"
                (click)="selectAction(action)"
                [class.bg-primary]="state.selectedAction === action"
               [class.text-white]="state.selectedAction === action"
                [class.bg-gray-100]="state.selectedAction !== action"
                class="px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-md"
              >
                {{ formatActionName(action) }}
              </button>
            </div>
          </div>

          <!-- Input Section -->
          <div class="card">
            <form [formGroup]="measurementForm" (ngSubmit)="onSubmit()">
              <!-- CONVERSION Section -->
              <div *ngIf="state.selectedAction === 'CONVERSION'" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <!-- VALUE INPUT -->
                  <div>
                    <label class="block text-sm font-bold text-text-secondary mb-4 uppercase">Value</label>
                    <input
                      type="number"
                      formControlName="value1"
                      class="input-field text-2xl font-bold"
                      placeholder="0"
                      step="any"
                    />
                  </div>

                  <!-- FROM UNIT DROPDOWN -->
                  <div>
                    <label class="block text-sm font-bold text-text-secondary mb-4 uppercase">From</label>
                    <select
                      formControlName="unit1"
                      class="select-field"
                    >
                      <option value="">Select Unit</option>
                      <option *ngFor="let unit of units" [value]="unit">{{ formatUnitName(unit) }}</option>
                    </select>
                  </div>

                  <!-- TO UNIT DROPDOWN -->
                  <div>
                    <label class="block text-sm font-bold text-text-secondary mb-4 uppercase">To</label>
                    <select
                      formControlName="unit2"
                      class="select-field"
                    >
                      <option value="">Select Unit</option>
                      <option *ngFor="let unit of units" [value]="unit">{{ formatUnitName(unit) }}</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- COMPARISON Section -->
              <div
                *ngIf="state.selectedAction === 'COMPARISON'"
                class="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <!-- VALUE 1 -->
                <div>
                  <label class="block text-sm font-bold text-text-secondary mb-4 uppercase">
                    VALUE 1
                  </label>
                  <input
                    type="number"
                    formControlName="value1"
                    class="input-field text-2xl font-bold mb-4"
                    placeholder="0"
                    step="any"
                  />
                  <select
                    formControlName="unit1"
                    class="select-field"
                  >
                    <option value="">Select Unit</option>
                    <option *ngFor="let unit of units" [value]="unit">{{ formatUnitName(unit) }}</option>
                  </select>
                </div>

                <!-- VALUE 2 -->
                <div>
                  <label class="block text-sm font-bold text-text-secondary mb-4 uppercase">
                    VALUE 2
                  </label>
                  <input
                    type="number"
                    formControlName="value2"
                    class="input-field text-2xl font-bold mb-4"
                    placeholder="0"
                    step="any"
                  />
                  <select
                    formControlName="unit2"
                    class="select-field"
                  >
                    <option value="">Select Unit</option>
                    <option *ngFor="let unit of units" [value]="unit">{{ formatUnitName(unit) }}</option>
                  </select>
                </div>
              </div>

              <!-- Arithmetic Section -->
              <div *ngIf="state.selectedAction === 'ARITHMETIC'" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <!-- VALUE 1 -->
                  <div>
                    <label class="block text-sm font-bold text-text-secondary mb-4 uppercase">Value 1</label>
                    <input
                      type="number"
                      formControlName="value1"
                      class="input-field text-2xl font-bold mb-4"
                      placeholder="0"
                      step="any"
                    />
                    <select
                      formControlName="unit1"
                      class="select-field"
                    >
                      <option value="">Select Unit</option>
                      <option *ngFor="let unit of units" [value]="unit">{{ formatUnitName(unit) }}</option>
                    </select>
                  </div>

                  <!-- OPERATOR -->
                  <div class="flex flex-col items-center gap-2">
                    <label class="text-sm font-bold text-text-secondary uppercase">Operator</label>
                    <div class="flex gap-2 flex-wrap justify-center">
                      <button
                        *ngFor="let op of operators"
                        type="button"
                        (click)="selectOperator(op)"
                        [class.bg-primary]="state.operator === op"
                        [class.text-white]="state.operator === op"
                        [class.bg-gray-100]="state.operator !== op"
                        class="px-4 py-2 rounded-lg font-bold text-lg border-2"
                        [class.border-primary]="state.operator === op"
                        [class.border-gray-200]="state.operator !== op"
                      >
                        {{ op }}
                      </button>
                    </div>
                  </div>

                  <!-- VALUE 2 -->
                  <div>
                    <label class="block text-sm font-bold text-text-secondary mb-4 uppercase">Value 2</label>
                    <input
                      type="number"
                      formControlName="value2"
                      class="input-field text-2xl font-bold mb-4"
                      placeholder="0"
                      step="any"
                    />
                    <select
                      formControlName="unit2"
                      class="select-field"
                    >
                      <option value="">Select Unit</option>
                      <option *ngFor="let unit of units" [value]="unit">{{ formatUnitName(unit) }}</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Calculate Button -->
              <div class="mt-8 flex justify-center">
                <button
                  type="submit"
                  [disabled]="measurementForm.invalid || (isLoading$ | async)"
                  class="px-8 py-3 bg-primary text-white font-bold text-lg rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {{ (isLoading$ | async) ? 'Calculating...' : 'Calculate' }}
                </button>
              </div>

              <!-- Result Section -->
              <div *ngIf="(result$ | async) as result" class="mt-8 p-6 bg-blue-50 rounded-lg border-l-4 border-primary">
                <p class="text-sm font-bold text-text-secondary mb-2 uppercase">Result</p>
                <p class="text-4xl font-bold text-primary mb-4" [ngSwitch]="state.selectedAction">
                  <span *ngSwitchCase="'COMPARISON'">{{ result | comparisonSymbol }}</span>
                  <span *ngSwitchDefault>{{ result }}</span>
                </p>
              </div>

              <!-- Loading -->
              <app-loading-spinner [isLoading]="(isLoading$ | async) ?? false"></app-loading-spinner>
            </form>
          </div>

          <!-- History -->
          <div class="card" *ngIf="(history$ | async) as history">
            <h2 class="text-xl font-bold mb-4">Calculation History</h2>
            <div *ngIf="history.length > 0; else noHistory" class="space-y-2 max-h-96 overflow-y-auto">
              <div
                *ngFor="let record of history"
                class="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-semibold text-text-primary">{{ record.action }}</p>
                    <p class="text-sm text-text-secondary">{{ record.expression }}</p>
                    <p class="text-lg font-bold text-primary mt-2">= {{ record.result }}</p>
                  </div>
                  <p class="text-xs text-text-secondary">
                    {{ record.timestamp | date: 'short' }}
                  </p>
                </div>
              </div>
            </div>
            <ng-template #noHistory>
              <p class="text-center text-text-secondary py-8">No history yet</p>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class QuantityMeasurementComponent implements OnInit {
  measurementForm: FormGroup;
  state$ = this.measurementService.getState$();
  result$ = this.measurementService.getResult$();
  isLoading$ = this.measurementService.getIsLoading$();
  error$ = this.measurementService.getError$();
  history$ = this.measurementService.getHistory$();
  currentUser$ = this.authService.getCurrentUser$();

  state = this.measurementService.state;
  units: string[] = [];
  measurementTypes: MeasurementType[] = ['LENGTH', 'WEIGHT', 'TEMPERATURE', 'VOLUME'];
  actionTypes: ActionType[] = ['COMPARISON', 'CONVERSION', 'ARITHMETIC'];
  operators: Operator[] = ['+', '-', '*', '/'];

  constructor(
    private fb: FormBuilder,
    private measurementService: MeasurementService,
    private authService: AuthService,
    private router: Router
  ) {
    this.measurementForm = this.fb.group({
      value1: [null, [Validators.required, Validators.pattern(/^-?\d+\.?\d*$/)]],
      unit1: [null, Validators.required],
      value2: [null],
      unit2: [null, Validators.required],
      resultUnit: [null],
    });
  }

  ngOnInit(): void {
    this.initializeUnits();
    this.subscribeToStateChanges();
    this.updateFormValidators();
    
    // Subscribe to errors to see if there are any HTTP errors
    this.error$.subscribe((error) => {
      if (error) {
        console.error('Error from service:', error);
      }
    });
    
    // Subscribe to results to debug
    this.result$.subscribe((result) => {
      console.log('Result updated:', result);
    });
  }

  private updateFormValidators(): void {
    const value1Control = this.measurementForm.get('value1');
    const value2Control = this.measurementForm.get('value2');

    if (this.state.selectedAction === 'CONVERSION') {
      // Conversion only needs: value1, unit1, unit2
      value1Control?.setValidators([Validators.required, Validators.pattern(/^-?\d+\.?\d*$/)]);
      value2Control?.setValidators([]);
      value2Control?.reset();
    } else {
      // Comparison and Arithmetic need: value1, unit1, value2, unit2
      value1Control?.setValidators([Validators.required, Validators.pattern(/^-?\d+\.?\d*$/)]);
      value2Control?.setValidators([Validators.required, Validators.pattern(/^-?\d+\.?\d*$/)]);
    }

    value1Control?.updateValueAndValidity({ emitEvent: false });
    value2Control?.updateValueAndValidity({ emitEvent: false });
  }

  private initializeUnits(): void {
    // Units must match backend enum names exactly (case-sensitive)
    const unitsByType: { [key: string]: string[] } = {
      LENGTH: ['METERS', 'CENTIMETERS', 'FEET', 'INCHES', 'YARDS'],
      WEIGHT: ['KILOGRAM', 'GRAM', 'MILLIGRAM', 'POUND', 'TONNE'],
      TEMPERATURE: ['CELSIUS', 'FAHRENHEIT', 'KELVIN'],
      VOLUME: ['LITRE', 'MILLILITRE', 'GALLON'],
    };
    this.units = unitsByType[this.state.selectedType] || [];
  }

  private subscribeToStateChanges(): void {
    this.state$.subscribe((state) => {
      this.state = state;
      this.initializeUnits();
      this.updateFormValidators();
    });
  }

  selectType(type: MeasurementType): void {
    this.measurementService.setMeasurementType(type);
    this.measurementForm.reset();
    this.initializeUnits();
  }

  selectAction(action: ActionType): void {
    this.measurementService.setActionType(action);
    this.measurementForm.reset();
    this.updateFormValidators();
  }

  selectOperator(operator: Operator): void {
    this.measurementService.setOperator(operator);
  }

  performCalculation(): void {
    const { value1, unit1, value2, unit2 } = this.measurementForm.value;

    // Validate required fields based on action type
    if (!value1 || !unit1 || !unit2) {
      console.error('Missing required fields: value1, unit1, unit2');
      this.measurementService.error$.next('Missing required fields');
      return;
    }

    switch (this.state.selectedAction) {
      case 'CONVERSION':
        console.log('Converting:', value1, unit1, 'to', unit2);
        this.measurementService
          .convert(parseFloat(value1), unit1, unit2)
          .subscribe({
            next: (result) => {
              console.log('✓ Conversion successful:', result);
            },
            error: (error) => {
              console.error('✗ Conversion failed:', error);
            },
            complete: () => {
              console.log('Conversion observable completed');
            }
          });
        break;

      case 'COMPARISON':
        if (!value2) {
          console.error('Missing value2 for comparison');
          this.measurementService.error$.next('Missing value for comparison');
          return;
        }
        console.log('Comparing:', value1, unit1, 'with', value2, unit2);
        this.measurementService
          .compare(parseFloat(value1), unit1, parseFloat(value2), unit2)
          .subscribe({
            next: (result) => {
              console.log('✓ Comparison successful:', result);
            },
            error: (error) => {
              console.error('✗ Comparison failed:', error);
            },
            complete: () => {
              console.log('Comparison observable completed');
            }
          });
        break;

      case 'ARITHMETIC':
        if (!value2 || !this.state.operator) {
          console.error('Missing value2 or operator for arithmetic');
          this.measurementService.error$.next('Missing value or operator');
          return;
        }
        console.log('Arithmetic:', value1, unit1, this.state.operator, value2, unit2);
        this.measurementService
          .arithmetic(
            parseFloat(value1),
            unit1,
            parseFloat(value2),
            unit2,
            this.state.operator
          )
          .subscribe({
            next: (result) => {
              console.log('✓ Arithmetic successful:', result);
            },
            error: (error) => {
              console.error('✗ Arithmetic failed:', error);
            },
            complete: () => {
              console.log('Arithmetic observable completed');
            }
          });
        break;

      default:
        console.error('Unknown action:', this.state.selectedAction);
    }
  }

  onSubmit(): void {
    console.log('Form submitted!');
    console.log('Form value:', this.measurementForm.value);
    console.log('Form valid:', this.measurementForm.valid);
    console.log('Selected action:', this.state.selectedAction);
    this.performCalculation();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  formatTypeName(type: MeasurementType): string {
    return type.charAt(0) + type.slice(1).toLowerCase();
  }

  formatActionName(action: ActionType): string {
    return action.charAt(0) + action.slice(1).toLowerCase();
  }

  getTypeIcon(type: MeasurementType): string {
    const icons: { [key: string]: string } = {
      LENGTH: '📏',
      WEIGHT: '⚖️',
      TEMPERATURE: '🌡️',
      VOLUME: '🧃',
    };
    return icons[type] || '';
  }

  formatUnitName(unit: string): string {
    // Convert 'METERS' to 'Meters', 'FAHRENHEIT' to 'Fahrenheit', etc.
    return unit.charAt(0) + unit.slice(1).toLowerCase();
  }
}
