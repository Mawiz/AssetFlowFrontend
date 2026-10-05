import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments';
import { map, Observable } from 'rxjs';
import {
  AssetCostHistoryRow,
  AssetCostSummary,
  AssetHistoryEvent,
  AssetHistoryFilter,
  AssetHistoryPaged,
  AssetHistorySummary
} from '../model/asset-history';

interface ApiResult<T> {
  result: T;
}

@Injectable({ providedIn: 'root' })
export class AssetHistoryService {
  private apiUrl = `${environment.apiUrl}/assethistory`;

  constructor(private http: HttpClient) {}

  getSummary(assetId: number): Observable<AssetHistorySummary> {
    return this.http.get<ApiResult<AssetHistorySummary>>(`${this.apiUrl}/${assetId}/summary`).pipe(map((r) => r.result));
  }

  getTimeline(filter: AssetHistoryFilter): Observable<AssetHistoryPaged> {
    return this.http.post<ApiResult<AssetHistoryPaged>>(`${this.apiUrl}/timeline`, filter).pipe(map((r) => r.result));
  }

  getMaintenanceHistory(filter: AssetHistoryFilter): Observable<unknown[]> {
    return this.http.post<ApiResult<unknown[]>>(`${this.apiUrl}/maintenance`, filter).pipe(map((r) => r.result ?? []));
  }

  getBreakdownHistory(filter: AssetHistoryFilter): Observable<unknown[]> {
    return this.http.post<ApiResult<unknown[]>>(`${this.apiUrl}/breakdown`, filter).pipe(map((r) => r.result ?? []));
  }

  getWorkOrderHistory(filter: AssetHistoryFilter): Observable<unknown[]> {
    return this.http.post<ApiResult<unknown[]>>(`${this.apiUrl}/workorders`, filter).pipe(map((r) => r.result ?? []));
  }

  getPartsHistory(filter: AssetHistoryFilter): Observable<unknown[]> {
    return this.http.post<ApiResult<unknown[]>>(`${this.apiUrl}/parts`, filter).pipe(map((r) => r.result ?? []));
  }

  getDowntimeHistory(filter: AssetHistoryFilter): Observable<unknown[]> {
    return this.http.post<ApiResult<unknown[]>>(`${this.apiUrl}/downtime`, filter).pipe(map((r) => r.result ?? []));
  }

  getCostHistory(filter: AssetHistoryFilter): Observable<AssetCostHistoryRow[]> {
    return this.http
      .post<ApiResult<AssetCostHistoryRow[]>>(`${this.apiUrl}/costs`, filter)
      .pipe(map((r) => r.result ?? []));
  }

  getCostSummary(assetId: number, filter: AssetHistoryFilter): Observable<AssetCostSummary> {
    return this.http
      .post<ApiResult<AssetCostSummary>>(`${this.apiUrl}/${assetId}/costsummary`, filter)
      .pipe(map((r) => r.result));
  }
}
