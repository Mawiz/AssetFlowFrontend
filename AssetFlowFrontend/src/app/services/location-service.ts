import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments';
import {
  CreateLocation,
  Location,
  LocationFilterDto,
  UpdateLocation
} from '../model/location';

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
export class LocationService {
  private apiUrl = `${environment.apiUrl}/location`;

  constructor(private http: HttpClient) {}

  getAll(filter?: LocationFilterDto): Observable<Location[]> {
    return this.http
      .post<ApiResult<Location[]>>(`${this.apiUrl}/filter`, filter ?? {})
      .pipe(map((res) => res.result));
  }

  getByLocationType(locationTypeId: number): Observable<Location[]> {
    return this.http
      .get<ApiResult<Location[]>>(`${this.apiUrl}/by-location-type/${locationTypeId}`)
      .pipe(map((res) => res.result));
  }

  getById(id: number): Observable<Location> {
    return this.http
      .get<ApiResult<Location>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.result));
  }

  create(dto: CreateLocation): Observable<Location> {
    return this.http
      .post<ApiResult<Location>>(this.apiUrl, dto)
      .pipe(map((res) => res.result));
  }

  update(dto: UpdateLocation): Observable<Location> {
    return this.http
      .put<ApiResult<Location>>(this.apiUrl, dto)
      .pipe(map((res) => res.result));
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<ApiResult<any>>(`${this.apiUrl}/${id}`)
      .pipe(map(() => undefined));
  }
}
