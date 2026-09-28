import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments';
import { ListFilterDto } from '../model/list-filter';
import {
  AssetCategory,
  CreateAssetCategory,
  UpdateAssetCategory
} from '../model/asset-category';

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
export class AssetCategoryService {
  private apiUrl = `${environment.apiUrl}/assetcategory`;

  constructor(private http: HttpClient) {}

  getAll(filter?: ListFilterDto): Observable<AssetCategory[]> {
    return this.http
      .post<ApiResult<AssetCategory[]>>(`${this.apiUrl}/filter`, filter ?? {})
      .pipe(map((res) => res.result));
  }

  getAllActive(tenantId?: number | null): Observable<AssetCategory[]> {
    const params =
      tenantId != null && tenantId !== 0
        ? { tenantId: String(tenantId) }
        : undefined;
    return this.http
      .get<ApiResult<AssetCategory[]>>(this.apiUrl, { params })
      .pipe(map((res) => res.result));
  }

  create(dto: CreateAssetCategory): Observable<AssetCategory> {
    return this.http
      .post<ApiResult<AssetCategory>>(this.apiUrl, dto)
      .pipe(map((res) => res.result));
  }

  update(dto: UpdateAssetCategory): Observable<AssetCategory> {
    return this.http
      .put<ApiResult<AssetCategory>>(this.apiUrl, dto)
      .pipe(map((res) => res.result));
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<ApiResult<any>>(`${this.apiUrl}/${id}`)
      .pipe(map(() => undefined));
  }
}
