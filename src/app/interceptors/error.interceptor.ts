import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MeasurementService } from '../services/measurement.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private measurementService: MeasurementService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unexpected error occurred';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = error.error.message;
        } else {
          // Server-side error
          if (error.error && error.error.error) {
            errorMessage = error.error.error.message;
          } else if (error.status === 0) {
            errorMessage =
              'Cannot connect to server. Make sure the backend is running on http://localhost:8080';
          } else if (error.status === 404) {
            errorMessage = 'Resource not found';
          } else if (error.status === 400) {
            errorMessage = 'Bad request. Please check your input';
          } else if (error.status === 401) {
            errorMessage = 'Unauthorized. Please login again';
          } else if (error.status === 500) {
            errorMessage = 'Server error. Please try again later';
          }
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
