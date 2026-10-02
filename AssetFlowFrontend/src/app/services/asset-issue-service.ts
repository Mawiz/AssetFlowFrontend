import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments';
import { map, Observable } from 'rxjs';
import {
  AssetIssue,
  AssetIssueFilter,
  ChangeAssetIssueStatus,
  CreateAssetIssue,
  IssueAttachment,
  UpdateAssetIssue
} from '../model/issue';

interface ApiResult<T> {
  result: T;
  errors?: string[];
}

@Injectable({ providedIn: 'root' })
export class AssetIssueService {
  private apiUrl = `${environment.apiUrl}/assetissue`;

  constructor(private http: HttpClient) {}

  filter(filter: AssetIssueFilter) {
    return this.http.post<ApiResult<any>>(`${this.apiUrl}/filter`, filter).pipe(map((r) => r.result));
  }

  getById(id: number): Observable<AssetIssue> {
    return this.http.get<ApiResult<AssetIssue>>(`${this.apiUrl}/${id}`).pipe(map((r) => r.result));
  }

  create(dto: CreateAssetIssue) {
    return this.http.post<ApiResult<AssetIssue>>(this.apiUrl, dto).pipe(map((r) => r.result));
  }

  update(dto: UpdateAssetIssue) {
    return this.http.put<ApiResult<AssetIssue>>(this.apiUrl, dto).pipe(map((r) => r.result));
  }

  changeStatus(dto: ChangeAssetIssueStatus) {
    return this.http.post<ApiResult<AssetIssue>>(`${this.apiUrl}/changestatus`, dto).pipe(map((r) => r.result));
  }

  delete(id: number) {
    return this.http.delete<ApiResult<boolean>>(`${this.apiUrl}/${id}`).pipe(map((r) => r.result));
  }

  uploadAttachment(issueId: number, file: File) {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http
      .post<ApiResult<IssueAttachment>>(`${this.apiUrl}/${issueId}/attachments`, form)
      .pipe(map((r) => r.result));
  }

  deleteAttachment(attachmentId: number) {
    return this.http
      .delete<ApiResult<boolean>>(`${this.apiUrl}/attachments/${attachmentId}`)
      .pipe(map((r) => r.result));
  }

  attachmentDownloadUrl(attachmentId: number): string {
    return `${environment.apiUrl}/assetissue/attachments/${attachmentId}/download`;
  }
}
