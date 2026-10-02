import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments';
import { map, Observable } from 'rxjs';
import {
  WorkOrder,
  WorkOrderActionRemarks,
  WorkOrderApprove,
  WorkOrderAssign,
  WorkOrderComplete,
  WorkOrderDiagnosisUpsert,
  WorkOrderFilter
} from '../model/work-order';

interface ApiResult<T> {
  result: T;
}

@Injectable({ providedIn: 'root' })
export class WorkOrderService {
  private apiUrl = `${environment.apiUrl}/workorder`;

  constructor(private http: HttpClient) {}

  filter(filter: WorkOrderFilter) {
    return this.http.post<ApiResult<any>>(`${this.apiUrl}/filter`, filter).pipe(map((r) => r.result));
  }

  getById(id: number): Observable<WorkOrder> {
    return this.http.get<ApiResult<WorkOrder>>(`${this.apiUrl}/${id}`).pipe(map((r) => r.result));
  }

  createFromIssue(dto: { tenantId?: number | null; assetIssueId: number; title?: string; description?: string }) {
    return this.http.post<ApiResult<WorkOrder>>(`${this.apiUrl}/createfromissue`, dto).pipe(map((r) => r.result));
  }

  createFromOccurrence(dto: { tenantId?: number | null; preventiveMaintenanceOccurrenceId: number; title?: string; description?: string }) {
    return this.http.post<ApiResult<WorkOrder>>(`${this.apiUrl}/createfromoccurrence`, dto).pipe(map((r) => r.result));
  }

  assign(dto: WorkOrderAssign) {
    return this.http.post<ApiResult<WorkOrder>>(`${this.apiUrl}/assign`, dto).pipe(map((r) => r.result));
  }

  reassign(dto: WorkOrderAssign) {
    return this.http.post<ApiResult<WorkOrder>>(`${this.apiUrl}/reassign`, dto).pipe(map((r) => r.result));
  }

  accept(dto: WorkOrderActionRemarks) {
    return this.http.post<ApiResult<WorkOrder>>(`${this.apiUrl}/accept`, dto).pipe(map((r) => r.result));
  }

  engineerArrived(dto: WorkOrderActionRemarks) {
    return this.http.post<ApiResult<WorkOrder>>(`${this.apiUrl}/engineerarrived`, dto).pipe(map((r) => r.result));
  }

  start(dto: WorkOrderActionRemarks) {
    return this.http.post<ApiResult<WorkOrder>>(`${this.apiUrl}/start`, dto).pipe(map((r) => r.result));
  }

  pause(dto: WorkOrderActionRemarks) {
    return this.http.post<ApiResult<WorkOrder>>(`${this.apiUrl}/pause`, dto).pipe(map((r) => r.result));
  }

  waitingForParts(dto: WorkOrderActionRemarks) {
    return this.http.post<ApiResult<WorkOrder>>(`${this.apiUrl}/waitingforparts`, dto).pipe(map((r) => r.result));
  }

  resume(dto: WorkOrderActionRemarks) {
    return this.http.post<ApiResult<WorkOrder>>(`${this.apiUrl}/resume`, dto).pipe(map((r) => r.result));
  }

  upsertDiagnosis(dto: WorkOrderDiagnosisUpsert) {
    return this.http.post<ApiResult<WorkOrder>>(`${this.apiUrl}/diagnosis`, dto).pipe(map((r) => r.result));
  }

  complete(dto: WorkOrderComplete) {
    return this.http.post<ApiResult<WorkOrder>>(`${this.apiUrl}/complete`, dto).pipe(map((r) => r.result));
  }

  approve(dto: WorkOrderApprove) {
    return this.http.post<ApiResult<WorkOrder>>(`${this.apiUrl}/approve`, dto).pipe(map((r) => r.result));
  }

  reject(dto: { id: number; rejectionReason?: string }) {
    return this.http.post<ApiResult<WorkOrder>>(`${this.apiUrl}/reject`, dto).pipe(map((r) => r.result));
  }

  reopen(dto: WorkOrderActionRemarks) {
    return this.http.post<ApiResult<WorkOrder>>(`${this.apiUrl}/reopen`, dto).pipe(map((r) => r.result));
  }

  cancel(dto: { id: number; cancellationReason?: string }) {
    return this.http.post<ApiResult<WorkOrder>>(`${this.apiUrl}/cancel`, dto).pipe(map((r) => r.result));
  }

  uploadAttachment(workOrderId: number, file: File) {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http.post(`${this.apiUrl}/${workOrderId}/attachments`, form);
  }
}
