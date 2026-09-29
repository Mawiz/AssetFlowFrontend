import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments';
import {
  PartAdjustment,
  PartInventory,
  PartInventoryFilterDto,
  PartBatchReceipt,
  PartBatchReceiptResult,
  PartTransfer
} from '../model/part-inventory';

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
export class PartInventoryService {
  private apiUrl = `${environment.apiUrl}/partinventory`;

  constructor(private http: HttpClient) {}

  filter(filter?: PartInventoryFilterDto): Observable<PartInventory[]> {
    return this.http
      .post<ApiResult<PartInventory[]>>(`${this.apiUrl}/filter`, filter ?? {})
      .pipe(map((res) => res.result));
  }

  batchReceipt(dto: PartBatchReceipt): Observable<PartBatchReceiptResult> {
    return this.http
      .post<ApiResult<PartBatchReceiptResult>>(`${this.apiUrl}/batchreceipt`, dto)
      .pipe(map((res) => res.result));
  }

  transfer(dto: PartTransfer): Observable<PartInventory> {
    return this.http
      .post<ApiResult<PartInventory>>(`${this.apiUrl}/transfer`, dto)
      .pipe(map((res) => res.result));
  }

  adjust(dto: PartAdjustment): Observable<PartInventory> {
    return this.http
      .post<ApiResult<PartInventory>>(`${this.apiUrl}/adjust`, dto)
      .pipe(map((res) => res.result));
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<ApiResult<any>>(`${this.apiUrl}/${id}`)
      .pipe(map(() => undefined));
  }
}
