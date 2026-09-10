// src/app/model/user.ts

export interface CreateUserDto {
  fullName: string;
  firstLetter: string;
  userName: string;
  email: string;
  password: string;
  roleId: number;
  tenantId?: number | null;
}

export interface UpdateUserDto {
  id: number;
  fullName: string;
  firstLetter: string;
  userName: string;
  email: string;
  roleId: number;
  tenantId?: number | null;
}

export interface UserDto {
  id: number;
  firstLetter: string;
  fullName: string;
  email: string;
  userName: string;
  roleId: number;
  roleName?: string;
  tenantId?: number | null;
  tenantName?: string;
  isActive: boolean;
  modifiedOn: string;
}

export interface UserFilterDto {
  pageSize: number;
  pageNumber: number;
  searchText?: string;
  searchKeyword?: string;
  orderByProp?: string;
  sortDirection?: number;
  isActive?: boolean;
  latestByDate?: string;
  roles?: number[];
}
