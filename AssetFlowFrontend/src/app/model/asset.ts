import { EntityMetaDataItem } from './entity-metadata';

export interface Asset {
  id: number;
  tenantId?: number | null;
  tenantName?: string;
  assetCode: string;
  name: string;
  assetCategoryId: number;
  assetCategoryName?: string;
  assetTypeId: number;
  assetTypeName?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  installationDate?: string | Date | null;
  locationId: number;
  locationName?: string;
  responsibleUserId?: number | null;
  responsibleUserName?: string;
  otherLocationInformation?: string;
  status: number;
  criticality: number;
  warrantyStartDate?: string | Date | null;
  warrantyEndDate?: string | Date | null;
  purchaseDate?: string | Date | null;
  purchaseCost?: number | null;
  supplierName?: string;
  expectedLifeValue?: number | null;
  expectedLifeUnit?: number | null;
  notes?: string;
  isActive: boolean;
  metadata?: EntityMetaDataItem[];
}

export interface CreateAsset {
  tenantId?: number | null;
  assetCode: string;
  name: string;
  assetCategoryId: number;
  assetTypeId: number;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  installationDate?: string | Date | null;
  locationId: number;
  responsibleUserId?: number | null;
  otherLocationInformation?: string;
  status: number;
  criticality: number;
  warrantyStartDate?: string | Date | null;
  warrantyEndDate?: string | Date | null;
  purchaseDate?: string | Date | null;
  purchaseCost?: number | null;
  supplierName?: string;
  expectedLifeValue?: number | null;
  expectedLifeUnit?: number | null;
  notes?: string;
  isActive: boolean;
  metadata?: EntityMetaDataItem[];
}

export interface UpdateAsset extends CreateAsset {
  id: number;
}

export interface AssetFilterDto {
  pageNumber: number;
  pageSize: number;
  searchText?: string;
  orderByProp?: string;
  sortDirection?: number;
  isActive?: boolean | null;
  startDate?: Date | null;
  endDate?: Date | null;
  tenantId?: number | null;
  assetCategoryId?: number | null;
  assetTypeId?: number | null;
  locationId?: number | null;
  status?: number | null;
  criticality?: number | null;
  responsibleUserId?: number | null;
}
