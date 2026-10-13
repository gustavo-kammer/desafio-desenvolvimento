import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IMovementRequest, IPagedResult, IStockMovement, MovementType } from '../models/api.models';

export type MovementOperation = 'entry' | 'exit' | 'adjustmentIn' | 'adjustmentOut';

export interface IMovementFilter {
  productId?: number | null;
  type?: MovementType | null;
  from?: string | null;
  to?: string | null;
  page?: number;
  pageSize?: number;
}

const OPERATION_PATHS: Record<MovementOperation, string> = {
  entry: 'entries',
  exit: 'exits',
  adjustmentIn: 'adjustments/increase',
  adjustmentOut: 'adjustments/decrease',
};

@Injectable({ providedIn: 'root' })
export class MovementsService {
  private readonly _http: HttpClient = inject(HttpClient);
  private readonly _url: string = `${environment.apiUrl}/stock`;

  public list(filter: IMovementFilter = {}): Observable<IPagedResult<IStockMovement>> {
    let params: HttpParams = new HttpParams();

    if (typeof filter.productId === 'number') {
      params = params.set('productId', filter.productId);
    }
    if (filter.type) {
      params = params.set('type', filter.type);
    }
    if (filter.from) {
      params = params.set('from', MovementsService.startOfDayIso(filter.from));
    }
    if (filter.to) {
      params = params.set('to', MovementsService.endOfDayIso(filter.to));
    }
    params = params.set('page', filter.page ?? 1).set('pageSize', filter.pageSize ?? 10);

    return this._http.get<IPagedResult<IStockMovement>>(`${this._url}/movements`, { params });
  }

  public register(
    operation: MovementOperation,
    request: IMovementRequest,
  ): Observable<IStockMovement> {
    return this._http.post<IStockMovement>(`${this._url}/${OPERATION_PATHS[operation]}`, request);
  }

  private static startOfDayIso(date: string): string {
    return new Date(`${date}T00:00:00`).toISOString();
  }

  private static endOfDayIso(date: string): string {
    return new Date(`${date}T23:59:59.999`).toISOString();
  }
}
