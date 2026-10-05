import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments';
import { map, Observable } from 'rxjs';
import { MaintenanceCostUpsert } from '../model/asset-history';

interface ApiResult<T> {
  result: T;
}

@Injectable({ providedIn: 'root' })
export class MaintenanceCostService {
  private apiUrl = `${environment.apiUrl}/maintenancecost`;

  constructor(private http: HttpClient) {}

  upsertCost(dto: MaintenanceCostUpsert) {
    const call = dto.id ? this.http.put<ApiResult<unknown>>(this.apiUrl, dto) : this.http.post<ApiResult<unknown>>(this.apiUrl, dto);
    return call.pipe(map((r) => r.result));
  }

  deleteCost(id: number): Observable<boolean> {
    return this.http.delete<ApiResult<boolean>>(`${this.apiUrl}/${id}`).pipe(map((r) => r.result));
  }
}
