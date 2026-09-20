import { ListFilterDto } from './list-filter';

export interface Location {
  id: number;
  locationTypeId: number;
  locationTypeName?: string;
  parentLocationId?: number | null;
  parentLocationName?: string | null;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export interface CreateLocation {
  locationTypeId: number;
  parentLocationId?: number | null;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export interface UpdateLocation extends CreateLocation {
  id: number;
}

export interface LocationFilterDto extends ListFilterDto {
  locationTypeId?: number | null;
}
