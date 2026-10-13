import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ICategory, ISaveCategoryRequest } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly _http: HttpClient = inject(HttpClient);
  private readonly _url: string = `${environment.apiUrl}/categories`;

  public list(): Observable<ICategory[]> {
    return this._http.get<ICategory[]>(this._url);
  }

  public create(request: ISaveCategoryRequest): Observable<ICategory> {
    return this._http.post<ICategory>(this._url, request);
  }

  public update(id: number, request: ISaveCategoryRequest): Observable<ICategory> {
    return this._http.put<ICategory>(`${this._url}/${id}`, request);
  }
}
