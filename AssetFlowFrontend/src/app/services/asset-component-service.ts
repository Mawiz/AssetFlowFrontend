import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments';
import {
  AssetComponentFilterDto,
  AssetComponentItem,
  CreateAssetComponentItem,
  UpdateAssetComponentItem
} from '../model/asset-component-item';

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
export class AssetComponentService {
  private apiUrl = `${environment.apiUrl}/assetcomponent`;

  constructor(private http: HttpClient) {}

  filter(filter: AssetComponentFilterDto): Observable<AssetComponentItem[]> {
    return this.http
      .post<ApiResult<AssetComponentItem[]>>(`${this.apiUrl}/filter`, filter)
      .pipe(map((res) => res.result));
  }

  getById(id: number): Observable<AssetComponentItem> {
    return this.http
      .get<ApiResult<AssetComponentItem>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.result));
  }

  create(dto: CreateAssetComponentItem): Observable<AssetComponentItem> {
    return this.http
      .post<ApiResult<AssetComponentItem>>(this.apiUrl, dto)
      .pipe(map((res) => res.result));
  }

  update(dto: UpdateAssetComponentItem): Observable<AssetComponentItem> {
    return this.http
      .put<ApiResult<AssetComponentItem>>(this.apiUrl, dto)
      .pipe(map((res) => res.result));
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<ApiResult<any>>(`${this.apiUrl}/${id}`)
      .pipe(map(() => undefined));
  }
}
