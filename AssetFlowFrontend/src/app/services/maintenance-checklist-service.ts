import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments';
import { map } from 'rxjs/operators';
import { MaintenanceChecklist } from '../model/maintenance';
import { ListFilterDto } from '../model/list-filter';

interface ApiResult<T> {
  result: T;
}

@Injectable({ providedIn: 'root' })
export class MaintenanceChecklistService {
  private apiUrl = `${environment.apiUrl}/maintenancechecklist`;

  constructor(private http: HttpClient) {}

  getById(id: number) {
    return this.http.get<ApiResult<MaintenanceChecklist>>(`${this.apiUrl}/${id}`).pipe(map((r) => r.result));
  }

  getAll(tenantId?: number | null, maintenanceTypeId?: number | null) {
    let q = '';
    if (tenantId != null) q += `tenantId=${tenantId}`;
    if (maintenanceTypeId != null) q += `${q ? '&' : '?'}maintenanceTypeId=${maintenanceTypeId}`;
    return this.http.get<ApiResult<MaintenanceChecklist[]>>(`${this.apiUrl}${q ? '?' + q : ''}`).pipe(map((r) => r.result ?? []));
  }

  filter(filter: ListFilterDto & { maintenanceTypeId?: number | null }) {
    return this.http.post<ApiResult<any>>(`${this.apiUrl}/filter`, filter).pipe(map((r) => r.result));
  }

  create(dto: unknown) {
    return this.http.post<ApiResult<MaintenanceChecklist>>(this.apiUrl, dto).pipe(map((r) => r.result));
  }

  update(dto: unknown) {
    return this.http.put<ApiResult<MaintenanceChecklist>>(this.apiUrl, dto).pipe(map((r) => r.result));
  }

  delete(id: number) {
    return this.http.delete<ApiResult<boolean>>(`${this.apiUrl}/${id}`).pipe(map((r) => r.result));
  }
}
