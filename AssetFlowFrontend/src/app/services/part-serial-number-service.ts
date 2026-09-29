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
}
