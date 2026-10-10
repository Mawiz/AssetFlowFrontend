import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments';
import { map } from 'rxjs/operators';
import { WorkflowModuleItemMapping, WorkflowModuleItemMappingFilter } from '../model/workflow-runtime';

interface ApiResult<T> {
  result: T;
}

@Injectable({ providedIn: 'root' })
export class WorkflowModuleItemMappingService {
  private url = `${environment.apiUrl}/workflowmoduleitemmapping`;

  constructor(private http: HttpClient) {}

  filter(model: WorkflowModuleItemMappingFilter) {
    return this.http.post<ApiResult<any>>(`${this.url}/Filter`, model).pipe(map((r) => r.result));
  }

  getAll(tenantId?: number | null) {
    const q = tenantId != null ? `?tenantId=${tenantId}` : '';
    return this.http.get<ApiResult<WorkflowModuleItemMapping[]>>(`${this.url}${q}`).pipe(map((r) => r.result));
  }

  create(dto: Partial<WorkflowModuleItemMapping>) {
    return this.http.post<ApiResult<WorkflowModuleItemMapping>>(this.url, dto).pipe(map((r) => r.result));
  }

  update(dto: Partial<WorkflowModuleItemMapping> & { moduleItemMappingId: number }) {
    return this.http.put<ApiResult<WorkflowModuleItemMapping>>(this.url, dto).pipe(map((r) => r.result));
  }

  delete(id: number) {
    return this.http.delete<ApiResult<boolean>>(`${this.url}/${id}`).pipe(map((r) => r.result));
  }
}
