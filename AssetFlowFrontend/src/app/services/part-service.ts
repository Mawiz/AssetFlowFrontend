import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments';
import { CreatePart, Part, PartFilterDto, UpdatePart } from '../model/part';

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
export class PartService {
  private apiUrl = `${environment.apiUrl}/part`;

  constructor(private http: HttpClient) {}

  filter(filter?: PartFilterDto): Observable<Part[]> {
    return this.http
      .post<ApiResult<Part[]>>(`${this.apiUrl}/filter`, filter ?? {})
      .pipe(map((res) => res.result));
  }

  getById(id: number): Observable<Part> {
    return this.http
      .get<ApiResult<Part>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.result));
  }

  create(dto: CreatePart): Observable<Part> {
    return this.http
      .post<ApiResult<Part>>(this.apiUrl, dto)
      .pipe(map((res) => res.result));
  }

  update(dto: UpdatePart): Observable<Part> {
    return this.http
      .put<ApiResult<Part>>(this.apiUrl, dto)
      .pipe(map((res) => res.result));
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<ApiResult<any>>(`${this.apiUrl}/${id}`)
      .pipe(map(() => undefined));
  }
}
