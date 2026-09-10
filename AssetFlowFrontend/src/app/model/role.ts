// src/app/model/role.ts

export interface CreateRoleDto {
  name: string;
  displayName: string;
  description?: string;
  tenantId?: number | null;
  resourceIds: number[];
}

export interface UpdateRoleDto {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  tenantId?: number | null;
  resourceIds: number[];
}

export interface RoleDto {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  tenantId?: number | null;
  tenantName?: string | null;
  resourceIds: number[];
}

export interface RoleWithResourcesDto {
  roleId: number;
  roleName: string;
  displayName: string;
  tenantId?: number | null;
  tenantName?: string | null;
  resources: ResourceDto[];
}

export interface ResourceDto {
  id: number;
  resourceName: string;
  description?: string;
  checked?: boolean;
  subResources: SubResourceDto[];
}

export interface SubResourceDto {
  id: number;
  resourceName: string;
  description?: string;
  checked?: boolean;
}

/** Standardized API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  result: T;
  statusCode: number;
  exception?: any;
  errors?: any[];
}
