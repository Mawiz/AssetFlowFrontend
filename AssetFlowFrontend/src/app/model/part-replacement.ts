export interface PartReplacement {
  id: number;
  tenantId?: number | null;
  workOrderId: number;
  workOrderNumber?: string;
  assetId: number;
  assetCode?: string;
  assetName?: string;
  oldAssetComponentId?: number | null;
  oldComponentName?: string;
  oldPartNumber?: string;
  oldSerialNumber?: string;
  newPartId: number;
  newPartNumber?: string;
  newPartName?: string;
  newSerialNumber?: string;
  newAssetComponentId?: number | null;
  quantity: number;
  installedByUserName?: string;
  installedAt: string | Date;
  removedByUserName?: string;
  removedAt?: string | Date | null;
  removalReason?: string;
  failureReason?: string;
  fromLocationName?: string;
  installationLocation?: string;
  remarks?: string;
}

export interface ValidatePartReplacement {
  workOrderId: number;
  oldAssetComponentId: number;
  newPartId?: number | null;
  newPartSerialNumberId?: number | null;
  newSerialNumber?: string;
  newPartInventoryBatchId?: number | null;
  quantity?: number;
}

export interface PartReplacementValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  newPart?: { id: number; partNumber: string; partName: string; isSerialized: boolean };
  serial?: {
    id: number;
    serialNumber: string;
    status: number;
    statusName: string;
    locationName?: string;
    receivedDate?: string;
    warrantyStartDate?: string;
    warrantyEndDate?: string;
  };
  availableQuantity?: number;
  isCompatible?: boolean;
  oldComponentName?: string;
  oldPartNumber?: string;
  oldSerialNumber?: string;
  previousInstallations?: {
    assetCode: string;
    installedAt: string;
    removedAt?: string | null;
    workOrderNumber?: string;
  }[];
}

export interface ConfirmPartReplacement extends ValidatePartReplacement {
  removalReason?: string;
  failureReason?: string;
  installationLocation?: string;
  remarks?: string;
  markOldSerialFaulty?: boolean;
}
