import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments';
import { map } from 'rxjs/operators';
import { IssueCategory } from '../model/issue';
import { ListFilterDto } from '../model/list-filter';

interface ApiResult<T> {
  result: T;
}

@Injectable({ providedIn: 'root' })
export class IssueCategoryService {
  private apiUrl = `${environment.apiUrl}/issuecategory`;

  constructor(private http: HttpClient) {}

  getAll(tenantId?: number | null) {
    const q = tenantId != null ? `?tenantId=${tenantId}` : '';
    return this.http.get<ApiResult<IssueCategory[]>>(`${this.apiUrl}${q}`).pipe(map((r) => r.result ?? []));
  }

  filter(filter: ListFilterDto) {
    return this.http.post<ApiResult<any>>(`${this.apiUrl}/filter`, filter).pipe(map((r) => r.result));
  }

  create(dto: Partial<IssueCategory>) {
    return this.http.post<ApiResult<IssueCategory>>(this.apiUrl, dto).pipe(map((r) => r.result));
  }

  update(dto: Partial<IssueCategory> & { id: number }) {
    return this.http.put<ApiResult<IssueCategory>>(this.apiUrl, dto).pipe(map((r) => r.result));
  }

  delete(id: number) {
    return this.http.delete<ApiResult<boolean>>(`${this.apiUrl}/${id}`).pipe(map((r) => r.result));
  }
}
