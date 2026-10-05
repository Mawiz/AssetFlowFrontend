import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments';
import { map, Observable } from 'rxjs';
import {
  ConfirmPartReplacement,
  PartReplacement,
  PartReplacementValidationResult,
  ValidatePartReplacement
} from '../model/part-replacement';

interface ApiResult<T> {
  result: T;
}

@Injectable({ providedIn: 'root' })
export class PartReplacementService {
  private apiUrl = `${environment.apiUrl}/partreplacement`;

  constructor(private http: HttpClient) {}

  getByWorkOrder(workOrderId: number): Observable<PartReplacement[]> {
    return this.http
      .get<ApiResult<PartReplacement[]>>(`${this.apiUrl}/ByWorkOrder/${workOrderId}`)
      .pipe(map((r) => r.result ?? []));
  }

  validate(dto: ValidatePartReplacement): Observable<PartReplacementValidationResult> {
    return this.http
      .post<ApiResult<PartReplacementValidationResult>>(`${this.apiUrl}/Validate`, dto)
      .pipe(map((r) => r.result));
  }

  lookupSerial(workOrderId: number, serial: string): Observable<PartReplacementValidationResult> {
    const params = new HttpParams().set('workOrderId', workOrderId).set('serial', serial);
    return this.http
      .get<ApiResult<PartReplacementValidationResult>>(`${this.apiUrl}/LookupSerial`, { params })
      .pipe(map((r) => r.result));
  }

  replace(dto: ConfirmPartReplacement): Observable<PartReplacement> {
    return this.http
      .post<ApiResult<PartReplacement>>(`${this.apiUrl}/Replace`, dto)
      .pipe(map((r) => r.result));
  }
}
