import { ListFilterDto } from './list-filter';

export interface PartInventory {
  id: number;
  tenantId?: number | null;
  tenantName?: string | null;
  partId: number;
  partNumber?: string;
  partName?: string;
  locationId: number;
  locationName?: string;
  partSerialNumberId?: number | null;
  serialNumber?: string;
  supplierSerialReference?: string;
  supplierName?: string;
  quantityAvailable: number;
  quantityReserved: number;
  status: number;
  isActive: boolean;
  isLowStock?: boolean;
}

export interface PartInventoryFilterDto extends ListFilterDto {
  partId?: number | null;
  locationId?: number | null;
  lowStockOnly?: boolean | null;
}

export interface PartBatchReceipt {
  tenantId?: number | null;
  partId: number;
  locationId: number;
  supplierId: number;
  quantity: number;
  receiptMode: number;
  supplierSerialReferences?: string[];
  receivedDate?: Date | string | null;
  warrantyStartDate?: Date | string | null;
  warrantyEndDate?: Date | string | null;
  remarks?: string;
}

export interface PartBatchReceiptResult {
  items: PartInventory[];
  generatedSerialNumbers: string[];
}

export interface PartTransfer {
  tenantId?: number | null;
  partInventoryId: number;
  toLocationId: number;
  quantity: number;
  remarks?: string;
}

export interface PartAdjustment {
  tenantId?: number | null;
  partInventoryId: number;
  quantityChange: number;
  remarks?: string;
}
