export interface LocationType {
  id: number;
  tenantId?: number | null;
  tenantName?: string | null;
  name: string;
  parentLocationTypeId?: number | null;
  parentLocationTypeName?: string | null;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CreateLocationType {
  tenantId?: number | null;
  name: string;
  parentLocationTypeId?: number | null;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface UpdateLocationType extends CreateLocationType {
  id: number;
}
