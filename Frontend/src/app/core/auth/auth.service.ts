import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ISession } from './interfaces/ISession';
import { ILoginResponse, UserRole } from '../models/api.models';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

const STORAGE_KEY = 'estoque.session';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _http = inject(HttpClient);
  private readonly _router = inject(Router);

  private readonly _session = signal<ISession | null>(this.restore());

  public readonly user = computed(() => this._session()?.user ?? null);
  public readonly role = computed(() => this._session()?.user?.role ?? null);
  public readonly isAuthenticated = computed(() => this._session() !== null);
  public readonly token = computed(() => this._session()?.accessToken ?? null);

  public login(email: string, password: string): Observable<ILoginResponse> {
    return this._http
      .post<ILoginResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((response) => {
          const session: ISession = {
            accessToken: response.accessToken,
            expiresAt: response.expiresAt,
            user: response.user,
          };
          this._session.set(session);
          this.save(session);
        }),
      );
  }

  public logout(redirect = true): void {
    this._session.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* armazenamento indisponível */
    }
    if (redirect) {
      void this._router.navigate(['/login']);
    }
  }

  public hasRole(...roles: UserRole[]): boolean {
    const role = this.role();
    return role !== null && roles.includes(role);
  }

  private save(session: ISession): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      /* armazenamento indisponível: a sessão vale só até recarregar a página */
    }
  }

  private restore(): ISession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const session = JSON.parse(raw) as ISession;
      if (new Date(session.expiresAt).getTime() <= Date.now()) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }
}
