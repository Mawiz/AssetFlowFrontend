import { ListFilterDto } from './list-filter';

export interface PartSerialNumber {
  id: number;
  tenantId?: number | null;
  tenantName?: string | null;
  partId: number;
  partNumber?: string;
  partName?: string;
  serialNumber: string;
  status: number;
  receivedDate?: string | null;
  locationId?: number | null;
  locationName?: string;
  warrantyStartDate?: string | null;
  warrantyEndDate?: string | null;
  isActive: boolean;
}

export interface UpdatePartSerialNumber {
  id: number;
  tenantId?: number | null;
  partId: number;
  serialNumber: string;
  status: number;
  receivedDate?: Date | string | null;
  locationId?: number | null;
  warrantyStartDate?: Date | string | null;
  warrantyEndDate?: Date | string | null;
  isActive: boolean;
}

export interface PartSerialNumberFilterDto extends ListFilterDto {
  partId?: number | null;
}
