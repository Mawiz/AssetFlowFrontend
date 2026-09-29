import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments';
import {
  PartSerialNumber,
  PartSerialNumberFilterDto,
  UpdatePartSerialNumber
} from '../model/part-serial-number';

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
export class PartSerialNumberService {
  private apiUrl = `${environment.apiUrl}/partserialnumber`;

  constructor(private http: HttpClient) {}

  filter(filter?: PartSerialNumberFilterDto): Observable<PartSerialNumber[]> {
    return this.http
      .post<ApiResult<PartSerialNumber[]>>(`${this.apiUrl}/filter`, filter ?? {})
      .pipe(map((res) => res.result));
  }

  getById(id: number): Observable<PartSerialNumber> {
    return this.http
      .get<ApiResult<PartSerialNumber>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.result));
  }

  update(dto: UpdatePartSerialNumber): Observable<PartSerialNumber> {
    return this.http
      .put<ApiResult<PartSerialNumber>>(this.apiUrl, dto)
      .pipe(map((res) => res.result));
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<ApiResult<any>>(`${this.apiUrl}/${id}`)
      .pipe(map(() => undefined));
  }

  getNextSerials(partId: number, count: number, tenantId?: number | null): Observable<string[]> {
    const params: Record<string, string> = { partId: String(partId), count: String(count) };
    if (tenantId != null && tenantId !== 0) params['tenantId'] = String(tenantId);
    return this.http
      .get<ApiResult<{ serialNumber: string; serialNumbers: string[] }>>(`${this.apiUrl}/next`, { params })
      .pipe(map((res) => res.result.serialNumbers ?? (res.result.serialNumber ? [res.result.serialNumber] : [])));
  }

  serialExists(serial: string, tenantId?: number | null): Observable<boolean> {
    const params: Record<string, string> = { serial };
    if (tenantId != null && tenantId !== 0) params['tenantId'] = String(tenantId);
    return this.http
      .get<ApiResult<boolean>>(`${this.apiUrl}/exists`, { params })
      .pipe(map((res) => res.result));
  }
}
