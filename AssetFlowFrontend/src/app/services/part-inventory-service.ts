import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments';
import {
  PartAdjustment,
  PartBatchReceipt,
  PartBatchReceiptResult,
  PartInventory,
  PartInventoryBatchDetail,
  PartInventoryDetail,
  PartInventoryFilterDto,
  PartInventoryStateChange,
  PartIssue,
  PartReceiveStock,
  PartReturn,
  PartReturnToSupplier,
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

@Injectable({ providedIn: 'root' })
export class PartInventoryService {
  private apiUrl = `${environment.apiUrl}/partinventory`;

  constructor(private http: HttpClient) {}

  filter(filter?: PartInventoryFilterDto): Observable<PartInventory[]> {
    return this.http
      .post<ApiResult<PartInventory[]>>(`${this.apiUrl}/filter`, filter ?? {})
      .pipe(map((r) => r.result ?? []));
  }

  getById(id: number): Observable<PartInventoryDetail> {
    return this.http.get<ApiResult<PartInventoryDetail>>(`${this.apiUrl}/${id}`).pipe(map((r) => r.result!));
  }

  getBatchById(batchId: number): Observable<PartInventoryBatchDetail> {
    return this.http
      .get<ApiResult<PartInventoryBatchDetail>>(`${this.apiUrl}/batch/${batchId}`)
      .pipe(map((r) => r.result!));
  }

  receiveStock(dto: PartReceiveStock): Observable<PartBatchReceiptResult> {
    return this.http
      .post<ApiResult<PartBatchReceiptResult>>(`${this.apiUrl}/receivestock`, dto)
      .pipe(map((r) => r.result!));
  }

  batchReceipt(dto: PartBatchReceipt): Observable<PartBatchReceiptResult> {
    return this.http
      .post<ApiResult<PartBatchReceiptResult>>(`${this.apiUrl}/batchreceipt`, dto)
      .pipe(map((r) => r.result!));
  }

  transfer(dto: PartTransfer): Observable<PartInventory> {
    return this.http.post<ApiResult<PartInventory>>(`${this.apiUrl}/transfer`, dto).pipe(map((r) => r.result!));
  }

  adjust(dto: PartAdjustment): Observable<PartInventory> {
    return this.http.post<ApiResult<PartInventory>>(`${this.apiUrl}/adjust`, dto).pipe(map((r) => r.result!));
  }

  issue(dto: PartIssue): Observable<PartInventory> {
    return this.http.post<ApiResult<PartInventory>>(`${this.apiUrl}/issue`, dto).pipe(map((r) => r.result!));
  }

  returnStock(dto: PartReturn): Observable<PartInventory> {
    return this.http.post<ApiResult<PartInventory>>(`${this.apiUrl}/return`, dto).pipe(map((r) => r.result!));
  }

  markFaulty(dto: PartInventoryStateChange): Observable<PartInventory> {
    return this.http.post<ApiResult<PartInventory>>(`${this.apiUrl}/markfaulty`, dto).pipe(map((r) => r.result!));
  }

  quarantine(dto: PartInventoryStateChange): Observable<PartInventory> {
    return this.http.post<ApiResult<PartInventory>>(`${this.apiUrl}/quarantine`, dto).pipe(map((r) => r.result!));
  }

  releaseFromQuarantine(dto: PartInventoryStateChange): Observable<PartInventory> {
    return this.http
      .post<ApiResult<PartInventory>>(`${this.apiUrl}/releasefromquarantine`, dto)
      .pipe(map((r) => r.result!));
  }

  returnToSupplier(dto: PartReturnToSupplier): Observable<PartInventory> {
    return this.http
      .post<ApiResult<PartInventory>>(`${this.apiUrl}/returntosupplier`, dto)
      .pipe(map((r) => r.result!));
  }

  scrap(dto: PartInventoryStateChange): Observable<PartInventory> {
    return this.http.post<ApiResult<PartInventory>>(`${this.apiUrl}/scrap`, dto).pipe(map((r) => r.result!));
  }
}
