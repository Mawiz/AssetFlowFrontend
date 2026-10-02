import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments';
import { map } from 'rxjs/operators';
import {
  AssetPreventiveMaintenanceSummary,
  CalendarOccurrence,
  PreventiveMaintenanceFilter,
  PreventiveMaintenanceOccurrence
} from '../model/maintenance';

interface ApiResult<T> {
  result: T;
}

@Injectable({ providedIn: 'root' })
export class PreventiveMaintenanceService {
  private apiUrl = `${environment.apiUrl}/preventivemaintenance`;

  constructor(private http: HttpClient) {}

  filter(filter: PreventiveMaintenanceFilter) {
    return this.http.post<ApiResult<any>>(`${this.apiUrl}/filter`, filter).pipe(map((r) => r.result));
  }

  getById(id: number) {
    return this.http.get<ApiResult<PreventiveMaintenanceOccurrence>>(`${this.apiUrl}/${id}`).pipe(map((r) => r.result));
  }

  start(id: number) {
    return this.http.post<ApiResult<PreventiveMaintenanceOccurrence>>(`${this.apiUrl}/${id}/start`, {}).pipe(map((r) => r.result));
  }

  complete(dto: { occurrenceId: number; remarks?: string; checklistResponses: unknown[] }) {
    return this.http.post<ApiResult<PreventiveMaintenanceOccurrence>>(`${this.apiUrl}/complete`, dto).pipe(map((r) => r.result));
  }

  cancel(id: number) {
    return this.http.post<ApiResult<PreventiveMaintenanceOccurrence>>(`${this.apiUrl}/${id}/cancel`, {}).pipe(map((r) => r.result));
  }

  generate(dto?: { tenantId?: number; maintenanceScheduleId?: number; horizonDays?: number }) {
    return this.http.post<ApiResult<{ createdCount: number }>>(`${this.apiUrl}/generate`, dto ?? {}).pipe(map((r) => r.result));
  }

  calendar(filter: PreventiveMaintenanceFilter) {
    return this.http.post<ApiResult<CalendarOccurrence[]>>(`${this.apiUrl}/calendar`, filter).pipe(map((r) => r.result ?? []));
  }

  assetSummary(assetId: number) {
    return this.http
      .get<ApiResult<AssetPreventiveMaintenanceSummary>>(`${this.apiUrl}/assetsummary/${assetId}`)
      .pipe(map((r) => r.result));
  }
}
