import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiResponse, ResourceDto } from '../model/role';
import { environment } from '../../environments';
import { HttpClient } from '@angular/common/http';
import { CreateResourceDto, UpdateResourceDto } from '@/model/resource';

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
   private apiUrl = `${environment.apiUrl}/resource`;

  constructor(private http: HttpClient) {}

  // Get all resources (features)
  getAll(): Observable<ResourceDto[]> {
    return this.http.get<ApiResponse<ResourceDto[]>>(this.apiUrl)
      .pipe(map(res => res.result));
  }

  // Create feature + subresources
  create(dto: CreateResourceDto): Observable<ResourceDto> {
    debugger;
    dto.isBackEnd = dto.isBackEnd || false;
    return this.http.post<ApiResponse<ResourceDto>>(this.apiUrl, dto)
      .pipe(map(res => res.result));
  }

  // Update feature + subresources
  update(dto: UpdateResourceDto): Observable<ResourceDto> {
    return this.http.put<ApiResponse<ResourceDto>>(this.apiUrl, dto)
      .pipe(map(res => res.result));
  }
}