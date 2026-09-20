export interface LocationType {
  id: number;
  name: string;
  code: string;
  parentLocationTypeId?: number | null;
  parentLocationTypeName?: string | null;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CreateLocationType {
  name: string;
  code: string;
  parentLocationTypeId?: number | null;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface UpdateLocationType extends CreateLocationType {
  id: number;
}
