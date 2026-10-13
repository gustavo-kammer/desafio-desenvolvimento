import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IReservation, ReservationStatus } from '../models/api.models';

export interface IReservationFilter {
  status?: ReservationStatus | '';
  productId?: number | null;
}

export interface ICreateReservationRequest {
  productId: number;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class ReservationsService {
  private readonly _http: HttpClient = inject(HttpClient);
  private readonly _url: string = `${environment.apiUrl}/reservations`;

  public list(filter: IReservationFilter): Observable<IReservation[]> {
    let params = new HttpParams();
    if (filter.status) {
      params = params.set('status', filter.status);
    }
    if (filter.productId) {
      params = params.set('productId', filter.productId);
    }
    return this._http.get<IReservation[]>(this._url, { params });
  }

  public create(request: ICreateReservationRequest): Observable<IReservation> {
    return this._http.post<IReservation>(this._url, request);
  }

  public cancel(id: number): Observable<IReservation> {
    return this._http.post<IReservation>(`${this._url}/${id}/cancel`, {});
  }

  public consume(id: number): Observable<IReservation> {
    return this._http.post<IReservation>(`${this._url}/${id}/consume`, {});
  }
}
