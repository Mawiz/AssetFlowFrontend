import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments';
import { map } from 'rxjs/operators';
import { MaintenanceType } from '../model/maintenance';
import { ListFilterDto } from '../model/list-filter';

interface ApiResult<T> {
  result: T;
}

@Injectable({ providedIn: 'root' })
export class MaintenanceTypeService {
  private apiUrl = `${environment.apiUrl}/maintenancetype`;

  constructor(private http: HttpClient) {}

  getAll(tenantId?: number | null) {
    const q = tenantId != null ? `?tenantId=${tenantId}` : '';
    return this.http.get<ApiResult<MaintenanceType[]>>(`${this.apiUrl}${q}`).pipe(map((r) => r.result ?? []));
  }

  filter(filter: ListFilterDto) {
    return this.http.post<ApiResult<any>>(`${this.apiUrl}/filter`, filter).pipe(map((r) => r.result));
  }

  create(dto: Partial<MaintenanceType>) {
    return this.http.post<ApiResult<MaintenanceType>>(this.apiUrl, dto).pipe(map((r) => r.result));
  }

  update(dto: Partial<MaintenanceType> & { id: number }) {
    return this.http.put<ApiResult<MaintenanceType>>(this.apiUrl, dto).pipe(map((r) => r.result));
  }

  delete(id: number) {
    return this.http.delete<ApiResult<boolean>>(`${this.apiUrl}/${id}`).pipe(map((r) => r.result));
  }
}
