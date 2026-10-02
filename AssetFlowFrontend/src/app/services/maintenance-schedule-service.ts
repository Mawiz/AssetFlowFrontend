import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments';
import { map } from 'rxjs/operators';
import { MaintenanceSchedule } from '../model/maintenance';
import { ListFilterDto } from '../model/list-filter';

interface ApiResult<T> {
  result: T;
}

@Injectable({ providedIn: 'root' })
export class MaintenanceScheduleService {
  private apiUrl = `${environment.apiUrl}/maintenanceschedule`;

  constructor(private http: HttpClient) {}

  getById(id: number) {
    return this.http.get<ApiResult<MaintenanceSchedule>>(`${this.apiUrl}/${id}`).pipe(map((r) => r.result));
  }

  filter(filter: ListFilterDto & { assetId?: number; maintenanceTypeId?: number; locationId?: number; activeOnly?: boolean }) {
    return this.http.post<ApiResult<any>>(`${this.apiUrl}/filter`, filter).pipe(map((r) => r.result));
  }

  create(dto: unknown) {
    return this.http.post<ApiResult<MaintenanceSchedule>>(this.apiUrl, dto).pipe(map((r) => r.result));
  }

  update(dto: unknown) {
    return this.http.put<ApiResult<MaintenanceSchedule>>(this.apiUrl, dto).pipe(map((r) => r.result));
  }

  setActive(id: number, isActive: boolean) {
    return this.http.put<ApiResult<boolean>>(`${this.apiUrl}/${id}/active?isActive=${isActive}`, {}).pipe(map((r) => r.result));
  }
}
