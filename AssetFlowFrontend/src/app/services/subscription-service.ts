import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CreateSubscriptionType, SubscriptionType, UpdateSubscriptionType } from '../model/subscription';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments';
import { ListFilterDto } from '../model/list-filter';

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
export class SubscriptionService {
      private apiUrl = `${environment.apiUrl}/subscription`;

  constructor(private http: HttpClient) {}

  getAll(filter?: ListFilterDto): Observable<SubscriptionType[]> {
    return this.http.post<ApiResult<SubscriptionType[]>>(`${this.apiUrl}/filter`, filter)
      .pipe(map(res => res.result));
  }

  getById(id: number): Observable<SubscriptionType> {
    return this.http.get<ApiResult<SubscriptionType>>(`${this.apiUrl}/${id}`)
      .pipe(map(res => res.result));
  }

  create(dto: CreateSubscriptionType): Observable<SubscriptionType> {
    return this.http.post<ApiResult<SubscriptionType>>(this.apiUrl, dto)
      .pipe(map(res => res.result));
  }

  update(dto: UpdateSubscriptionType): Observable<SubscriptionType> {
    return this.http.put<ApiResult<SubscriptionType>>(this.apiUrl, dto)
      .pipe(map(res => res.result));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResult<any>>(`${this.apiUrl}/${id}`)
      .pipe(map(res => {})); // no data returned for delete
  }

  toggleStatus(id: number): Observable<boolean> {
    return this.http.patch<ApiResult<boolean>>(`${this.apiUrl}/${id}/toggle-status`, {})
      .pipe(map(res => res.result));
  }
}
