import { ListFilterDto } from './list-filter';

export interface Location {
  id: number;
  tenantId?: number | null;
  tenantName?: string | null;
  locationTypeId: number;
  locationTypeName?: string;
  parentLocationId?: number | null;
  parentLocationName?: string | null;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface CreateLocation {
  tenantId?: number | null;
  locationTypeId: number;
  parentLocationId?: number | null;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface UpdateLocation extends CreateLocation {
  id: number;
}

export interface LocationFilterDto extends ListFilterDto {
  locationTypeId?: number | null;
}
