import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ILoginResponse, IUser, UserRole } from '../models/api.models';
import { ISession } from '../models/session.models';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

const STORAGE_KEY = 'estoque.session';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _http: HttpClient = inject(HttpClient);
  private readonly _router: Router = inject(Router);

  private readonly _session = signal<ISession | null>(this.restore());

  public readonly user: Signal<IUser | null> = computed(() => this._session()?.user ?? null);
  public readonly role: Signal<UserRole | null> = computed(
    () => this._session()?.user?.role ?? null,
  );
  public readonly isAuthenticated: Signal<boolean> = computed(() => this._session() !== null);
  public readonly token: Signal<string | null> = computed(
    () => this._session()?.accessToken ?? null,
  );

  public login(email: string, password: string, remember = true): Observable<ILoginResponse> {
    return this._http
      .post<ILoginResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((response: ILoginResponse): void => {
          const session: ISession = {
            accessToken: response.accessToken,
            expiresAt: response.expiresAt,
            user: response.user,
          };
          this._session.set(session);
          this.save(session, remember);
        }),
      );
  }

  public logout(redirect = true): void {
    this._session.set(null);
    this.clear();
    if (redirect) {
      void this._router.navigate(['/login']);
    }
  }

  public hasRole(...roles: UserRole[]): boolean {
    const role: UserRole | null = this.role();
    return role !== null && roles.includes(role);
  }

  private save(session: ISession, remember: boolean): void {
    this.clear();
    try {
      (remember ? localStorage : sessionStorage).setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      //
    }
  }

  private clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      //
    }
  }

  private restore(): ISession | null {
    try {
      const raw: string | null =
        localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const session: ISession = JSON.parse(raw) as ISession;
      if (new Date(session.expiresAt).getTime() <= Date.now()) {
        this.clear();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }
}
