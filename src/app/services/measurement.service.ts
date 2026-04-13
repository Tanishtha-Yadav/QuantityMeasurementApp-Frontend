import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, debounceTime, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  QuantityDTO,
  HistoryRecord,
  ApiResponse,
  MeasurementType,
  ActionType,
  Operator,
  MeasurementState,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class MeasurementService {
  private readonly apiUrl = environment.apiUrl;

  private initialState: MeasurementState = {
    selectedType: 'LENGTH',
    selectedAction: 'COMPARISON',
    value1: null,
    unit1: null,
    value2: null,
    unit2: null,
    operator: null,
    result: null,
    isLoading: false,
    error: null,
  };

  private state$ = new BehaviorSubject<MeasurementState>(this.initialState);
  public result$ = new BehaviorSubject<string | null>(null);
  public error$ = new BehaviorSubject<string | null>(null);
  public isLoading$ = new BehaviorSubject<boolean>(false);
  public history$ = new BehaviorSubject<HistoryRecord[]>([]);

  constructor(private http: HttpClient) {
    this.loadHistory();
  }

  get state(): MeasurementState {
    return this.state$.value;
  }

  getState$(): Observable<MeasurementState> {
    return this.state$.asObservable();
  }

  getResult$(): Observable<string | null> {
    return this.result$.asObservable();
  }

  getError$(): Observable<string | null> {
    return this.error$.asObservable();
  }

  getIsLoading$(): Observable<boolean> {
    return this.isLoading$.asObservable();
  }

  getHistory$(): Observable<HistoryRecord[]> {
    return this.history$.asObservable();
  }

  setMeasurementType(type: MeasurementType): void {
    const currentState = this.state$.value;
    this.state$.next({ ...currentState, selectedType: type });
    this.result$.next(null);
    this.error$.next(null);
  }

  setActionType(action: ActionType): void {
    const currentState = this.state$.value;
    this.state$.next({ ...currentState, selectedAction: action });
    this.result$.next(null);
    this.error$.next(null);
  }

  setValue1(value: number | null): void {
    const currentState = this.state$.value;
    this.state$.next({ ...currentState, value1: value });
  }

  setUnit1(unit: string | null): void {
    const currentState = this.state$.value;
    this.state$.next({ ...currentState, unit1: unit });
  }

  setValue2(value: number | null): void {
    const currentState = this.state$.value;
    this.state$.next({ ...currentState, value2: value });
  }

  setUnit2(unit: string | null): void {
    const currentState = this.state$.value;
    this.state$.next({ ...currentState, unit2: unit });
  }

  setOperator(operator: Operator | null): void {
    const currentState = this.state$.value;
    this.state$.next({ ...currentState, operator });
  }

  // Comparison
  compare(
    value1: number,
    unit1: string,
    value2: number,
    unit2: string
  ): Observable<any> {
    this.isLoading$.next(true);
    const request = {
      thisQuantityDTO: { value: value1, unit: unit1 },
      thatQuantityDTO: { value: value2, unit: unit2 },
    };

    return this.http
      .post<ApiResponse<string>>(`${this.apiUrl}/quantities/compareWithSign`, request)
      .pipe(
        tap((response) => {
          console.log('Compare response:', response);
          this.isLoading$.next(false);
          if (response.success && response.data) {
            const comparisonSymbol = response.data;
            const expression = `from ${value1} ${unit1} to ${value2} ${unit2}`;
            this.result$.next(comparisonSymbol);
            this.saveToHistory({
              type: this.state.selectedType,
              action: 'COMPARISON',
              expression: expression,
              result: comparisonSymbol,
            });
          } else {
            const errorMsg = response.error?.message || 'Comparison failed';
            console.error('Comparison error:', errorMsg);
            this.error$.next(errorMsg);
          }
        }),
        catchError((error) => {
          console.error('Compare HTTP error:', error);
          this.isLoading$.next(false);
          this.handleError(error);
          return throwError(() => error);
        })
      );
  }

  // Conversion
  convert(
    value: number,
    fromUnit: string,
    toUnit: string
  ): Observable<any> {
    console.log('Converting:', value, fromUnit, toUnit);
    this.isLoading$.next(true);
    const request = {
      value,
      unit: fromUnit,
    };

    return this.http
      .post<ApiResponse<QuantityDTO>>(
        `${this.apiUrl}/quantities/convert/${toUnit}`,
        request
      )
      .pipe(
        tap((response) => {
          console.log('Convert response:', response);
          this.isLoading$.next(false);
          if (response.success && response.data) {
            const resultValue = response.data.value;
            const formattedValue = this.formatNumber(resultValue);
            const result = `${formattedValue} ${toUnit}`;
            this.result$.next(result);
            this.saveToHistory({
              type: this.state.selectedType,
              action: 'CONVERSION',
              expression: `${value} ${fromUnit} = X ${toUnit}`,
              result: result,
            });
          } else {
            const errorMsg = response.error?.message || 'Conversion failed';
            console.error('Conversion error:', errorMsg);
            this.error$.next(errorMsg);
          }
        }),
        catchError((error) => {
          console.error('Convert HTTP error:', error);
          this.isLoading$.next(false);
          this.handleError(error);
          return throwError(() => error);
        })
      );
  }

  // Arithmetic
  arithmetic(
    value1: number,
    unit1: string,
    value2: number,
    unit2: string,
    operator: Operator
  ): Observable<any> {
    console.log('Arithmetic:', value1, unit1, operator, value2, unit2);
    this.isLoading$.next(true);
    const endpoint =
      operator === '+' ? 'add' : operator === '-' ? 'subtract' : operator === '/' ? 'divide' : 'subtract';

    const request = {
      thisQuantityDTO: { value: value1, unit: unit1 },
      thatQuantityDTO: { value: value2, unit: unit2 },
    };

    return this.http
      .post<ApiResponse<any>>(
        `${this.apiUrl}/quantities/${endpoint}`,
        request
      )
      .pipe(
        tap((response) => {
          console.log('Arithmetic response:', response);
          this.isLoading$.next(false);
          if (response.success && response.data) {
            const resultValue = response.data.value || response.data;
            const resultUnit = response.data.unit || unit1;
            // Round to 2 decimal places and remove trailing zeros
            const formattedValue = this.formatNumber(resultValue);
            const result = `${formattedValue} ${resultUnit}`;
            this.result$.next(result);
            this.saveToHistory({
              type: this.state.selectedType,
              action: 'ARITHMETIC',
              expression: `${value1} ${unit1} ${operator} ${value2} ${unit2}`,
              result: result,
            });
          } else {
            const errorMsg = response.error?.message || 'Arithmetic failed';
            console.error('Arithmetic error:', errorMsg);
            this.error$.next(errorMsg);
          }
        }),
        catchError((error) => {
          console.error('Arithmetic HTTP error:', error);
          this.isLoading$.next(false);
          this.handleError(error);
          return throwError(() => error);
        })
      );
  }

  private saveToHistory(record: Omit<HistoryRecord, 'id' | 'timestamp'>): void {
    const newRecord: HistoryRecord = {
      ...record,
      timestamp: new Date().toISOString(),
    };

    const history = this.history$.value;
    this.history$.next([newRecord, ...history]);
  }

  private formatNumber(value: number): string {
    // Round to 2 decimal places
    const rounded = Math.round(value * 100) / 100;
    // If it's a whole number, return as integer
    if (rounded % 1 === 0) {
      return rounded.toString();
    }
    // Otherwise return with up to 2 decimal places, removing trailing zeros
    return parseFloat(rounded.toFixed(2)).toString();
  }

  private loadHistory(): void {
    this.http
      .get<ApiResponse<HistoryRecord[]>>(`${this.apiUrl}/quantities/history`)
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.history$.next(response.data);
          }
        }),
        catchError((error: HttpErrorResponse) => {
          // Silently ignore 401 errors during initial load (user not authenticated yet)
          if (error.status === 401) {
            return throwError(() => null);
          }
          console.error('Failed to load history', error);
          return throwError(() => error);
        })
      )
      .subscribe({
        error: () => {
          // Silently handle subscription errors
        }
      });
  }

  clearHistory(): void {
    this.history$.next([]);
  }

  reset(): void {
    this.state$.next(this.initialState);
    this.result$.next(null);
    this.error$.next(null);
    this.isLoading$.next(false);
  }

  private handleError(error: any): void {
    let message = 'An error occurred';
    if (error.error && error.error.error) {
      message = error.error.error.message;
    } else if (error.message) {
      message = error.message;
    }
    this.error$.next(message);
  }
}
