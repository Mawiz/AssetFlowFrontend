import { ListFilterDto } from './list-filter';

export interface PartTransaction {
  id: number;
  tenantId?: number | null;
  tenantName?: string | null;
  partId: number;
  partNumber?: string;
  partName?: string;
  partSerialNumberId?: number | null;
  serialNumber?: string;
  transactionType: number;
  quantity: number;
  fromLocationId?: number | null;
  fromLocationName?: string;
  toLocationId?: number | null;
  toLocationName?: string;
  transactionDate: string;
  performedByUserId?: number | null;
  performedByUserName?: string;
  remarks?: string;
  supplierId?: number | null;
  supplierName?: string;
  isActive: boolean;
}

export interface CreatePartTransaction {
  tenantId?: number | null;
  partId: number;
  partSerialNumberId?: number | null;
  transactionType: number;
  quantity: number;
  fromLocationId?: number | null;
  toLocationId?: number | null;
  transactionDate?: Date | string;
  remarks?: string;
}

export interface PartTransactionFilterDto extends ListFilterDto {
  partId?: number | null;
  transactionType?: number | null;
}
