import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments';
import { Asset, AssetFilterDto, CreateAsset, UpdateAsset } from '../model/asset';

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
export class AssetService {
  private apiUrl = `${environment.apiUrl}/asset`;

  constructor(private http: HttpClient) {}

  filter(filter: AssetFilterDto): Observable<Asset[]> {
    return this.http
      .post<ApiResult<Asset[]>>(`${this.apiUrl}/filter`, filter)
      .pipe(map((res) => res.result));
  }

  getById(id: number): Observable<Asset> {
    return this.http
      .get<ApiResult<Asset>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.result));
  }

  create(dto: CreateAsset): Observable<Asset> {
    return this.http
      .post<ApiResult<Asset>>(this.apiUrl, dto)
      .pipe(map((res) => res.result));
  }

  update(dto: UpdateAsset): Observable<Asset> {
    return this.http
      .put<ApiResult<Asset>>(this.apiUrl, dto)
      .pipe(map((res) => res.result));
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<ApiResult<any>>(`${this.apiUrl}/${id}`)
      .pipe(map(() => undefined));
  }
}
