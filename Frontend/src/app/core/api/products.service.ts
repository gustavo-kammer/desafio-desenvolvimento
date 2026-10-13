import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ICreateProductRequest,
  IPagedResult,
  IProduct,
  IUpdateProductRequest,
} from '../models/api.models';

export interface IProductFilter {
  search?: string;
  categoryId?: number | null;
  onlyBelowMinimumStock?: boolean;
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly _http: HttpClient = inject(HttpClient);
  private readonly _url: string = `${environment.apiUrl}/products`;

  public list(filter: IProductFilter = {}): Observable<IPagedResult<IProduct>> {
    let params: HttpParams = new HttpParams();

    const search: string = filter.search?.trim() ?? '';
    if (search) {
      params = params.set('search', search);
    }
    if (typeof filter.categoryId === 'number') {
      params = params.set('categoryId', filter.categoryId);
    }
    if (filter.onlyBelowMinimumStock) {
      params = params.set('onlyBelowMinimumStock', true);
    }
    params = params.set('page', filter.page ?? 1).set('pageSize', filter.pageSize ?? 10);

    return this._http.get<IPagedResult<IProduct>>(this._url, { params });
  }

  public get(id: number): Observable<IProduct> {
    return this._http.get<IProduct>(`${this._url}/${id}`);
  }

  public create(request: ICreateProductRequest): Observable<IProduct> {
    return this._http.post<IProduct>(this._url, request);
  }

  public update(id: number, request: IUpdateProductRequest): Observable<IProduct> {
    return this._http.put<IProduct>(`${this._url}/${id}`, request);
  }

  public archive(id: number): Observable<void> {
    return this._http.delete<void>(`${this._url}/${id}`);
  }
}
