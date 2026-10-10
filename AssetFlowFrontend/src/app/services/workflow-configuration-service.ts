import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments';
import { map } from 'rxjs/operators';
import {
  WorkflowActionDef,
  WorkflowModule,
  WorkflowModuleFilter,
  WorkflowModuleStage,
  WorkflowStageAction,
  WorkflowStageActionViewer
} from '../model/workflow-configuration';

interface ApiResult<T> {
  result: T;
}

@Injectable({ providedIn: 'root' })
export class WorkflowConfigurationService {
  private moduleUrl = `${environment.apiUrl}/workflowmodule`;
  private stageUrl = `${environment.apiUrl}/workflowmodulestage`;
  private actionUrl = `${environment.apiUrl}/workflowaction`;
  private stageActionUrl = `${environment.apiUrl}/workflowstageaction`;
  private viewerUrl = `${environment.apiUrl}/workflowstageactionviewer`;

  constructor(private http: HttpClient) {}

  filterModules(filter: WorkflowModuleFilter) {
    return this.http.post<ApiResult<any>>(`${this.moduleUrl}/Filter`, filter).pipe(map((r) => r.result));
  }

  getModule(moduleId: number) {
    return this.http.get<ApiResult<WorkflowModule>>(`${this.moduleUrl}/${moduleId}`).pipe(map((r) => r.result));
  }

  createModule(dto: Partial<WorkflowModule>) {
    return this.http.post<ApiResult<WorkflowModule>>(this.moduleUrl, dto).pipe(map((r) => r.result));
  }

  updateModule(dto: Partial<WorkflowModule> & { moduleId: number }) {
    return this.http.put<ApiResult<WorkflowModule>>(this.moduleUrl, dto).pipe(map((r) => r.result));
  }

  deleteModule(moduleId: number) {
    return this.http.delete<ApiResult<boolean>>(`${this.moduleUrl}/${moduleId}`).pipe(map((r) => r.result));
  }

  getStages(moduleId: number) {
    return this.http
      .get<ApiResult<WorkflowModuleStage[]>>(`${this.stageUrl}?moduleId=${moduleId}`)
      .pipe(map((r) => r.result ?? []));
  }

  createStage(dto: Partial<WorkflowModuleStage>) {
    return this.http.post<ApiResult<WorkflowModuleStage>>(this.stageUrl, dto).pipe(map((r) => r.result));
  }

  updateStage(dto: Partial<WorkflowModuleStage> & { stageId: number }) {
    return this.http.put<ApiResult<WorkflowModuleStage>>(this.stageUrl, dto).pipe(map((r) => r.result));
  }

  deleteStage(stageId: number) {
    return this.http.delete<ApiResult<boolean>>(`${this.stageUrl}/${stageId}`).pipe(map((r) => r.result));
  }

  filterActions(filter: WorkflowModuleFilter) {
    return this.http.post<ApiResult<any>>(`${this.actionUrl}/Filter`, filter).pipe(map((r) => r.result));
  }

  getAllActions() {
    return this.http.get<ApiResult<WorkflowActionDef[]>>(this.actionUrl).pipe(map((r) => r.result ?? []));
  }

  createAction(dto: Partial<WorkflowActionDef>) {
    return this.http.post<ApiResult<WorkflowActionDef>>(this.actionUrl, dto).pipe(map((r) => r.result));
  }

  updateAction(dto: Partial<WorkflowActionDef> & { actionId: number }) {
    return this.http.put<ApiResult<WorkflowActionDef>>(this.actionUrl, dto).pipe(map((r) => r.result));
  }

  deleteAction(actionId: number) {
    return this.http.delete<ApiResult<boolean>>(`${this.actionUrl}/${actionId}`).pipe(map((r) => r.result));
  }

  getStageActions(stageId: number) {
    return this.http
      .get<ApiResult<WorkflowStageAction[]>>(`${this.stageActionUrl}?stageId=${stageId}`)
      .pipe(map((r) => r.result ?? []));
  }

  createStageAction(dto: Partial<WorkflowStageAction>) {
    return this.http.post<ApiResult<WorkflowStageAction>>(this.stageActionUrl, dto).pipe(map((r) => r.result));
  }

  updateStageAction(dto: Partial<WorkflowStageAction> & { stageActionId: number }) {
    return this.http.put<ApiResult<WorkflowStageAction>>(this.stageActionUrl, dto).pipe(map((r) => r.result));
  }

  deleteStageAction(stageActionId: number) {
    return this.http.delete<ApiResult<boolean>>(`${this.stageActionUrl}/${stageActionId}`).pipe(map((r) => r.result));
  }

  getViewers(stageId: number) {
    return this.http
      .get<ApiResult<WorkflowStageActionViewer[]>>(`${this.viewerUrl}?stageId=${stageId}`)
      .pipe(map((r) => r.result ?? []));
  }

  createViewer(dto: Partial<WorkflowStageActionViewer>) {
    return this.http.post<ApiResult<WorkflowStageActionViewer>>(this.viewerUrl, dto).pipe(map((r) => r.result));
  }

  updateViewer(dto: Partial<WorkflowStageActionViewer> & { stageActionViewerId: number }) {
    return this.http.put<ApiResult<WorkflowStageActionViewer>>(this.viewerUrl, dto).pipe(map((r) => r.result));
  }

  deleteViewer(stageActionViewerId: number) {
    return this.http.delete<ApiResult<boolean>>(`${this.viewerUrl}/${stageActionViewerId}`).pipe(map((r) => r.result));
  }
}
