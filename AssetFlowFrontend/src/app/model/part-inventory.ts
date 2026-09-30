import { ListFilterDto } from './list-filter';
import { PartSerialNumber } from './part-serial-number';

export interface PartInventory {
  id: number;
  tenantId?: number | null;
  partId: number;
  partNumber?: string;
  partName?: string;
  partIsSerialized?: boolean;
  locationId: number;
  locationName?: string;
  totalQuantity: number;
  availableQuantity: number;
  faultyQuantity: number;
  quarantineQuantity: number;
  issuedQuantity: number;
  earliestExpiryDate?: string | null;
  isLowStock?: boolean;
  isActive?: boolean;
}

export interface PartInventoryDetail extends PartInventory {
  batches: PartInventoryBatch[];
}

export interface PartInventoryBatch {
  id: number;
  partInventoryId: number;
  partId: number;
  batchReference?: string;
  supplierId?: number | null;
  supplierName?: string;
  receivedDate?: string | null;
  expiryDate?: string | null;
  expectedLifeValue?: number | null;
  expectedLifeUnit?: number | null;
  totalQuantity: number;
  availableQuantity: number;
  faultyQuantity: number;
  quarantineQuantity: number;
  issuedQuantity: number;
  notes?: string;
  isActive?: boolean;
}

export interface PartInventoryBatchDetail extends PartInventoryBatch {
  partNumber?: string;
  partName?: string;
  locationName?: string;
  serialNumbers?: PartSerialNumber[];
}

export interface PartInventoryFilterDto extends ListFilterDto {
  partId?: number | null;
  locationId?: number | null;
  lowStockOnly?: boolean | null;
}

export interface PartReceiveLine {
  supplierId: number;
  quantity: number;
  receivedDate?: Date | string | null;
  expiryDate?: Date | string | null;
  expectedLifeValue?: number | null;
  expectedLifeUnit?: number | null;
  warrantyStartDate?: Date | string | null;
  warrantyEndDate?: Date | string | null;
  notes?: string;
  receiptMode?: number;
  supplierSerialReferences?: string[];
}

export interface PartReceiveStock {
  partId: number;
  locationId: number;
  tenantId?: number | null;
  remarks?: string;
  lines: PartReceiveLine[];
}

export interface PartBatchReceipt {
  partId: number;
  locationId: number;
  supplierId: number;
  quantity: number;
  receiptMode?: number;
  supplierSerialReferences?: string[];
  receivedDate?: Date | string | null;
  expiryDate?: Date | string | null;
  expectedLifeValue?: number | null;
  expectedLifeUnit?: number | null;
  warrantyStartDate?: Date | string | null;
  warrantyEndDate?: Date | string | null;
  remarks?: string;
  tenantId?: number | null;
}

export interface PartBatchReceiptResult {
  receiptTransactionId: number;
  createdBatchIds: number[];
  generatedSerialNumbers: string[];
}

export interface PartTransfer {
  partInventoryBatchId: number;
  toLocationId: number;
  quantity: number;
  partSerialNumberIds?: number[];
  remarks?: string;
  tenantId?: number | null;
}

export interface PartAdjustment {
  partInventoryBatchId: number;
  quantityChange: number;
  reason?: string;
  remarks?: string;
  tenantId?: number | null;
}

export interface PartIssue {
  partInventoryBatchId: number;
  quantity: number;
  partSerialNumberIds?: number[];
  issuedToUserId?: number | null;
  reason?: string;
  remarks?: string;
  tenantId?: number | null;
}

export interface PartReturn {
  partInventoryBatchId: number;
  quantity: number;
  partSerialNumberIds?: number[];
  returnedFromUserId?: number | null;
  toLocationId: number;
  reason?: string;
  remarks?: string;
  tenantId?: number | null;
}

export interface PartInventoryStateChange {
  partInventoryBatchId: number;
  quantity: number;
  partSerialNumberIds?: number[];
  reason?: string;
  remarks?: string;
  tenantId?: number | null;
}

export interface PartReturnToSupplier extends PartInventoryStateChange {
  supplierId: number;
}
