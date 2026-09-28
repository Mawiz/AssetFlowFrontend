import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments';
import {
  AssetType,
  AssetTypeFilterDto,
  CreateAssetType,
  UpdateAssetType
} from '../model/asset-type';

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
export class AssetTypeService {
  private apiUrl = `${environment.apiUrl}/assettype`;

  constructor(private http: HttpClient) {}

  getAll(filter?: AssetTypeFilterDto): Observable<AssetType[]> {
    return this.http
      .post<ApiResult<AssetType[]>>(`${this.apiUrl}/filter`, filter ?? {})
      .pipe(map((res) => res.result));
  }

  create(dto: CreateAssetType): Observable<AssetType> {
    return this.http
      .post<ApiResult<AssetType>>(this.apiUrl, dto)
      .pipe(map((res) => res.result));
  }

  update(dto: UpdateAssetType): Observable<AssetType> {
    return this.http
      .put<ApiResult<AssetType>>(this.apiUrl, dto)
      .pipe(map((res) => res.result));
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<ApiResult<any>>(`${this.apiUrl}/${id}`)
      .pipe(map(() => undefined));
  }
}
