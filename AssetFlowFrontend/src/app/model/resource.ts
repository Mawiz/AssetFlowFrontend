/** 🔹 DTO used to create a new resource (feature) */
export interface CreateResourceDto {
  resourceName: string;
  verb?: string; // optional API or description
  isBackEnd?: boolean;
  subResources: SubResourceDto[]; // nested sub-resources
}

/** 🔹 DTO used to update an existing resource */
export interface UpdateResourceDto extends CreateResourceDto {
  id: number;
}

/** 🔹 Core Resource structure returned by the API */
export interface ResourceDto {
  id: number;
  resourceName: string;
  verb?: string;
  isBackEnd?: boolean;
  subResources: SubResourceDto[];
}

/** 🔹 Response wrapper used by all API calls */
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
  verb?: string;
  isBackEnd?: boolean;
}

