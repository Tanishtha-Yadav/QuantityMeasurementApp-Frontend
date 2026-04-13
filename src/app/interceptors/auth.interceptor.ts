import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();

    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError((error) => {
        if (
          error instanceof HttpErrorResponse &&
          error.status === 401 &&
          !this.isRefreshing
        ) {
          this.isRefreshing = true;
          this.refreshTokenSubject.next(null);

          return this.authService.refreshToken().pipe(
            switchMap((response: any) => {
              this.isRefreshing = false;
              const newToken = response.data.token;
              this.refreshTokenSubject.next(newToken);
              return next.handle(
                this.addToken(request, newToken)
              );
            }),
            catchError((err) => {
              this.isRefreshing = false;
              this.authService.logout();
              return throwError(() => err);
            })
          );
        } else if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.refreshTokenSubject.pipe(
            filter((token) => token != null),
            take(1),
            switchMap((token) => {
              return next.handle(this.addToken(request, token));
            })
          );
        }

        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
