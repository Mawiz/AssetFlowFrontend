import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreateTenantDto, UpdateTenantDto } from '../model/tenant';
import { Observable } from 'rxjs';
import { environment } from '../../environments';
import { ListFilterDto } from '../model/list-filter';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private apiUrl = `${environment.apiUrl}/tenant`;
  private metaUrl = '/metadata/GetMetaDataValues';

  constructor(private http: HttpClient) {}

  create(dto: CreateTenantDto): Observable<any> {
    return this.http.post(this.apiUrl, dto);
  }

  update(dto: UpdateTenantDto): Observable<any> {
    return this.http.put(this.apiUrl, dto);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getAll(filter?: ListFilterDto): Observable<any> {
      return this.http.post(`${this.apiUrl}/filter`, filter);
  }

  toggleStatus(id: number): Observable<any> {
    // Backend expects PATCH {id}/toggle-status
    return this.http.patch(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // metadata endpoint for languages
  getLanguages(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}${this.metaUrl}`, payload);
  }
}
