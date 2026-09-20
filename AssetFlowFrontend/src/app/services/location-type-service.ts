import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments';
import { ListFilterDto } from '../model/list-filter';
import {
  CreateLocationType,
  LocationType,
  UpdateLocationType
} from '../model/location-type';

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
export class LocationTypeService {
  private apiUrl = `${environment.apiUrl}/locationtype`;

  constructor(private http: HttpClient) {}

  getAll(filter?: ListFilterDto): Observable<LocationType[]> {
    return this.http
      .post<ApiResult<LocationType[]>>(`${this.apiUrl}/filter`, filter ?? {})
      .pipe(map((res) => res.result));
  }

  getAllActive(tenantId?: number | null): Observable<LocationType[]> {
    const params =
      tenantId != null && tenantId !== 0
        ? { tenantId: String(tenantId) }
        : undefined;
    return this.http
      .get<ApiResult<LocationType[]>>(this.apiUrl, { params })
      .pipe(map((res) => res.result));
  }

  getById(id: number): Observable<LocationType> {
    return this.http
      .get<ApiResult<LocationType>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.result));
  }

  create(dto: CreateLocationType): Observable<LocationType> {
    return this.http
      .post<ApiResult<LocationType>>(this.apiUrl, dto)
      .pipe(map((res) => res.result));
  }

  update(dto: UpdateLocationType): Observable<LocationType> {
    return this.http
      .put<ApiResult<LocationType>>(this.apiUrl, dto)
      .pipe(map((res) => res.result));
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<ApiResult<any>>(`${this.apiUrl}/${id}`)
      .pipe(map(() => undefined));
  }
}
