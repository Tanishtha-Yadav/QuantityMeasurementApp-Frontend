import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  AuthRequest,
  AuthResponse,
  UserRegistrationDTO,
  UserInfo,
  RefreshTokenRequest,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = environment.authUrl;
  private authToken$ = new BehaviorSubject<string | null>(
    this.getStoredToken()
  );
  private currentUser$ = new BehaviorSubject<UserInfo | null>(
    this.getStoredUser()
  );
  private isAuthenticatedSubject$ = new BehaviorSubject<boolean>(
    !!this.getStoredToken()
  );

  constructor(private http: HttpClient) {
    this.loadAuthState();
  }

  private loadAuthState(): void {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    if (token && user) {
      this.authToken$.next(token);
      this.currentUser$.next(user);
      this.isAuthenticatedSubject$.next(true);
    }
  }

  private getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private getStoredUser(): UserInfo | null {
    const user = localStorage.getItem('current_user');
    return user ? JSON.parse(user) : null;
  }

  getToken$(): Observable<string | null> {
    return this.authToken$.asObservable();
  }

  getCurrentUser$(): Observable<UserInfo | null> {
    return this.currentUser$.asObservable();
  }

  isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticatedSubject$.asObservable();
  }

  getToken(): string | null {
    return this.authToken$.value;
  }

  getCurrentUser(): UserInfo | null {
    return this.currentUser$.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject$.value;
  }

  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response.success && response.data) {
          const authData = response.data;
          localStorage.setItem('auth_token', authData.token);
          localStorage.setItem('current_user', JSON.stringify(authData.user));
          this.authToken$.next(authData.token);
          this.currentUser$.next(authData.user);
          this.isAuthenticatedSubject$.next(true);
        }
      }),
      catchError(this.handleError)
    );
  }

  register(userData: UserRegistrationDTO): Observable<AuthResponse> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      tap((response) => {
        if (response.success && response.data) {
          const authData = response.data;
          localStorage.setItem('auth_token', authData.token);
          localStorage.setItem('current_user', JSON.stringify(authData.user));
          this.authToken$.next(authData.token);
          this.currentUser$.next(authData.user);
          this.isAuthenticatedSubject$.next(true);
        }
      }),
      catchError(this.handleError)
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token available'));
    }

    const refreshRequest: RefreshTokenRequest = { token };
    return this.http.post<any>(`${this.apiUrl}/refresh`, refreshRequest).pipe(
      tap((response) => {
        if (response.success && response.data) {
          const authData = response.data;
          localStorage.setItem('auth_token', authData.token);
          this.authToken$.next(authData.token);
        }
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    this.authToken$.next(null);
    this.currentUser$.next(null);
    this.isAuthenticatedSubject$.next(false);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error && error.error.error) {
        errorMessage = error.error.error.message || errorMessage;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
