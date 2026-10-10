import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments';
import { map } from 'rxjs/operators';
import {
  IssueWorkflowIntegration,
  WorkflowInboxFilter,
  WorkflowMaster,
  WorkflowStageActionOption,
  WorkflowTask,
  WorkflowTaskDetail
} from '../model/workflow-runtime';

interface ApiResult<T> {
  result: T;
}

@Injectable({ providedIn: 'root' })
export class WorkflowRuntimeService {
  private url = `${environment.apiUrl}/workflowruntime`;

  constructor(private http: HttpClient) {}

  filterInbox(filter: WorkflowInboxFilter) {
    return this.http.post<ApiResult<any>>(`${this.url}/inbox/Filter`, filter).pipe(map((r) => r.result));
  }

  getTaskDetail(workflowTaskId: string) {
    return this.http.get<ApiResult<WorkflowTaskDetail>>(`${this.url}/task/${workflowTaskId}`).pipe(map((r) => r.result));
  }

  getAvailableActions(workflowTaskId: string) {
    return this.http
      .get<ApiResult<WorkflowStageActionOption[]>>(`${this.url}/task/${workflowTaskId}/actions`)
      .pipe(map((r) => r.result));
  }

  performAction(payload: { workflowTaskId: string; stageActionId: number; notes?: string | null }) {
    return this.http.post<ApiResult<WorkflowMaster>>(`${this.url}/perform`, payload).pipe(map((r) => r.result));
  }

  getHistory(workflowMasterId: string) {
    return this.http.get<ApiResult<WorkflowTask[]>>(`${this.url}/history/${workflowMasterId}`).pipe(map((r) => r.result));
  }

  getIssueIntegration(issueId: number, workflowTaskId?: string | null) {
    const params: Record<string, string> = {};
    if (workflowTaskId) params['workflowTaskId'] = workflowTaskId;
    return this.http
      .get<ApiResult<IssueWorkflowIntegration>>(`${this.url}/issue/${issueId}`, { params })
      .pipe(map((r) => r.result));
  }

  getMasterByReference(referenceItemType: string, referenceItemId: number) {
    return this.http
      .get<ApiResult<WorkflowMaster>>(`${this.url}/master/by-reference`, {
        params: { referenceItemType, referenceItemId: String(referenceItemId) }
      })
      .pipe(map((r) => r.result));
  }
}
