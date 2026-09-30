import { ListFilterDto } from './list-filter';

export interface PartTransaction {
  id: number;
  tenantId?: number | null;
  tenantName?: string | null;
  partId: number;
  partNumber?: string;
  partName?: string;
  partInventoryId?: number | null;
  partInventoryBatchId?: number | null;
  batchReference?: string;
  serialNumbers?: string[];
  transactionType: number;
  quantity: number;
  fromLocationId?: number | null;
  fromLocationName?: string;
  toLocationId?: number | null;
  toLocationName?: string;
  transactionDate: string;
  performedByUserId?: number | null;
  performedByUserName?: string;
  issuedToUserId?: number | null;
  issuedToUserName?: string;
  returnedFromUserId?: number | null;
  returnedFromUserName?: string;
  reason?: string;
  remarks?: string;
  supplierId?: number | null;
  supplierName?: string;
  isActive: boolean;
}

export interface CreatePartTransaction {
  tenantId?: number | null;
  partId: number;
  transactionType: number;
  quantity: number;
  fromLocationId?: number | null;
  toLocationId?: number | null;
  transactionDate?: Date | string;
  reason?: string;
  remarks?: string;
}

export interface PartTransactionFilterDto extends ListFilterDto {
  partId?: number | null;
  partInventoryId?: number | null;
  transactionType?: number | null;
}
