import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const auth: AuthService = inject(AuthService);
  const token: string | null = auth.token();
  const isApiCall: boolean = req.url.startsWith(environment.apiUrl);

  const request: HttpRequest<unknown> =
    token && isApiCall ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      const isLogin: boolean = req.url.endsWith('/auth/login');
      if (error instanceof HttpErrorResponse && error.status === 401 && !isLogin) {
        auth.logout();
      }
      return throwError(() => error);
    }),
  );
};
