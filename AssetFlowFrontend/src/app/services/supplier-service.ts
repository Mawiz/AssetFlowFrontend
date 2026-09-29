import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments';
import { ListFilterDto } from '../model/list-filter';
import { CreateSupplier, Supplier, UpdateSupplier } from '../model/supplier';

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
export class SupplierService {
  private apiUrl = `${environment.apiUrl}/supplier`;

  constructor(private http: HttpClient) {}

  getAll(filter?: ListFilterDto): Observable<Supplier[]> {
    return this.http
      .post<ApiResult<Supplier[]>>(`${this.apiUrl}/filter`, filter ?? {})
      .pipe(map((res) => res.result));
  }

  getAllActive(tenantId?: number | null): Observable<Supplier[]> {
    const params =
      tenantId != null && tenantId !== 0 ? { tenantId: String(tenantId) } : undefined;
    return this.http
      .get<ApiResult<Supplier[]>>(this.apiUrl, { params })
      .pipe(map((res) => res.result));
  }

  create(dto: CreateSupplier): Observable<Supplier> {
    return this.http
      .post<ApiResult<Supplier>>(this.apiUrl, dto)
      .pipe(map((res) => res.result));
  }

  update(dto: UpdateSupplier): Observable<Supplier> {
    return this.http
      .put<ApiResult<Supplier>>(this.apiUrl, dto)
      .pipe(map((res) => res.result));
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<ApiResult<any>>(`${this.apiUrl}/${id}`)
      .pipe(map(() => undefined));
  }
}
