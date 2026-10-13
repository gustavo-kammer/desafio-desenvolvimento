import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { UserRole } from '../models/api.models';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (): boolean | UrlTree =>
  inject(AuthService).isAuthenticated() ? true : inject(Router).createUrlTree(['/login']);

export const guestGuard: CanActivateFn = (): boolean | UrlTree =>
  inject(AuthService).isAuthenticated() ? inject(Router).createUrlTree(['/']) : true;

export const roleGuard =
  (...roles: UserRole[]): CanActivateFn =>
  (): boolean | UrlTree =>
    inject(AuthService).hasRole(...roles) ? true : inject(Router).createUrlTree(['/']);
