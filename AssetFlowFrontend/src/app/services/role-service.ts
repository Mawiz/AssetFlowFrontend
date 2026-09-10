import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments';
import {
  ApiResponse,
  CreateRoleDto,
  UpdateRoleDto,
  RoleDto,
  RoleWithResourcesDto,
  ResourceDto
} from '../model/role';
import { ListFilterDto } from '../model/list-filter';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly apiUrl = `${environment.apiUrl}/applicationRole`;
  private readonly resourceUrl = `${environment.apiUrl}/resource`;

  constructor(private http: HttpClient) {}

  /** Get all roles (global or tenant-specific) via POST payload */
  getAll(filter?: ListFilterDto): Observable<RoleDto[]> {
    // eslint-disable-next-line no-console
    return this.http
      .post<ApiResponse<RoleDto[]>>(`${this.apiUrl}/filter`, filter)
      .pipe(map(res => res.result));
  }

  /** Get roles filtered by tenant */
  getRolesByTenant(tenantId?: number): Observable<RoleWithResourcesDto[]> {
    const url = tenantId
      ? `${this.apiUrl}/tenant/${tenantId}`
      : `${this.apiUrl}/tenant`;
    return this.http
      .get<ApiResponse<RoleWithResourcesDto[]>>(url)
      .pipe(map(res => res.result));
  }

  /** Get single role details */
  getById(id: number): Observable<RoleWithResourcesDto> {
    return this.http
      .get<ApiResponse<RoleWithResourcesDto>>(`${this.apiUrl}/${id}`)
      .pipe(map(res => res.result));
  }

  /** Get all available resources */
  getResources(): Observable<ResourceDto[]> {
    return this.http
      .get<ApiResponse<ResourceDto[]>>(this.resourceUrl)
      .pipe(map(res => res.result));
  }

  /** Create a new role */
  create(dto: CreateRoleDto): Observable<RoleDto> {
    return this.http
      .post<ApiResponse<RoleDto>>(this.apiUrl, dto)
      .pipe(map(res => res.result));
  }

  /** Update existing role */
  update(dto: UpdateRoleDto): Observable<RoleDto> {
    return this.http
      .put<ApiResponse<RoleDto>>(this.apiUrl, dto)
      .pipe(map(res => res.result));
  }

  /** Delete a role */
  delete(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<any>>(`${this.apiUrl}/${id}`)
      .pipe(map(() => {}));
  }

  /** Toggle active/inactive role status */
  toggleStatus(id: number): Observable<boolean> {
    return this.http
      .patch<ApiResponse<boolean>>(`${this.apiUrl}/${id}/toggle-status`, {})
      .pipe(map(res => res.result));
  }
}
