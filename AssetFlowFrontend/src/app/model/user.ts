export interface CreateUserDto {
  fullName: string;
  firstLetter: string;
  userName: string;
  email: string;
  password: string;
  roleIds: number[];
  tenantId?: number | null;
}

export interface UpdateUserDto {
  id: number;
  fullName: string;
  firstLetter: string;
  userName: string;
  email: string;
  roleIds: number[];
  tenantId?: number | null;
}

export interface UserDto {
  id: number;
  firstLetter: string;
  fullName: string;
  email: string;
  userName: string;
  roleId?: number;
  roleIds?: number[];
  roleName?: string;
  roleNames?: string[];
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
