import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments';
import { ListFilterDto } from '../model/list-filter';
import {
  CreatePartCategory,
  PartCategory,
  UpdatePartCategory
} from '../model/part-category';

interface ApiResult<T> {
  success: boolean;
  result: T;
  message: string;
  statusCode: number;
  exception: any;
  errors: any[];
}

@Injectable({
  providedIn: 'root'
})
export class PartCategoryService {
  private apiUrl = `${environment.apiUrl}/partcategory`;

  constructor(private http: HttpClient) {}

  getAll(filter?: ListFilterDto): Observable<PartCategory[]> {
    return this.http
      .post<ApiResult<PartCategory[]>>(`${this.apiUrl}/filter`, filter ?? {})
      .pipe(map((res) => res.result));
  }

  getAllActive(tenantId?: number | null): Observable<PartCategory[]> {
    const params =
      tenantId != null && tenantId !== 0
        ? { tenantId: String(tenantId) }
        : undefined;
    return this.http
      .get<ApiResult<PartCategory[]>>(this.apiUrl, { params })
      .pipe(map((res) => res.result));
  }

  create(dto: CreatePartCategory): Observable<PartCategory> {
    return this.http
      .post<ApiResult<PartCategory>>(this.apiUrl, dto)
      .pipe(map((res) => res.result));
  }

  update(dto: UpdatePartCategory): Observable<PartCategory> {
    return this.http
      .put<ApiResult<PartCategory>>(this.apiUrl, dto)
      .pipe(map((res) => res.result));
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<ApiResult<any>>(`${this.apiUrl}/${id}`)
      .pipe(map(() => undefined));
  }
}
