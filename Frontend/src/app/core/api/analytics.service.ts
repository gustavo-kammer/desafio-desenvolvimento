import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IAnalyticsSummary } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly _http: HttpClient = inject(HttpClient);
  private readonly _url: string = `${environment.apiUrl}/analytics`;

  public summary(days: number): Observable<IAnalyticsSummary> {
    const utcOffsetMinutes: number = -new Date().getTimezoneOffset();
    const params: HttpParams = new HttpParams()
      .set('days', days)
      .set('utcOffsetMinutes', utcOffsetMinutes);

    return this._http.get<IAnalyticsSummary>(`${this._url}/summary`, { params });
  }
}
