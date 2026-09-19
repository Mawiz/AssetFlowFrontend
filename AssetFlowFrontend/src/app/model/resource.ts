export interface CreateResourceDto {
  resourceName: string;
  subResources: SubResourceDto[];
}

export interface UpdateResourceDto extends CreateResourceDto {
  id: number;
}

export interface ResourceDto {
  id: number;
  resourceName: string;
  subResources: SubResourceDto[];
}

export interface ApiResponse<T> {
  success: boolean;
  result: T;
  message: string;
  statusCode: number;
  exception?: any;
  errors?: any[];
}

export interface SubResourceDto {
  id: number;
  resourceName: string;
}
