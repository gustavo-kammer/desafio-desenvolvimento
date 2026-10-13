import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ICreateUserRequest,
  IResetPasswordRequest,
  IUpdateUserRequest,
  IUser,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly _http: HttpClient = inject(HttpClient);
  private readonly _url: string = `${environment.apiUrl}/users`;

  public list(): Observable<IUser[]> {
    return this._http.get<IUser[]>(this._url);
  }

  public create(request: ICreateUserRequest): Observable<IUser> {
    return this._http.post<IUser>(this._url, request);
  }

  public update(id: number, request: IUpdateUserRequest): Observable<IUser> {
    return this._http.put<IUser>(`${this._url}/${id}`, request);
  }

  public resetPassword(id: number, request: IResetPasswordRequest): Observable<void> {
    return this._http.put<void>(`${this._url}/${id}/password`, request);
  }

  public setActive(id: number, active: boolean): Observable<IUser> {
    return this._http.post<IUser>(`${this._url}/${id}/${active ? 'activate' : 'deactivate'}`, {});
  }
}
