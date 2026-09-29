import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments';
import {
  CreatePartTransaction,
  PartTransaction,
  PartTransactionFilterDto
} from '../model/part-transaction';

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
export class PartTransactionService {
  private apiUrl = `${environment.apiUrl}/parttransaction`;

  constructor(private http: HttpClient) {}

  filter(filter?: PartTransactionFilterDto): Observable<PartTransaction[]> {
    return this.http
      .post<ApiResult<PartTransaction[]>>(`${this.apiUrl}/filter`, filter ?? {})
      .pipe(map((res) => res.result));
  }

  create(dto: CreatePartTransaction): Observable<PartTransaction> {
    return this.http
      .post<ApiResult<PartTransaction>>(this.apiUrl, dto)
      .pipe(map((res) => res.result));
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<ApiResult<any>>(`${this.apiUrl}/${id}`)
      .pipe(map(() => undefined));
  }
}
