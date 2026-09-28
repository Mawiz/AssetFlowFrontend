import { EntityMetaDataItem } from './entity-metadata';

export interface AssetComponentItem {
  id: number;
  tenantId?: number | null;
  assetId: number;
  assetCode?: string;
  assetName?: string;
  componentCode: string;
  componentName: string;
  partNumber?: string;
  serialNumber?: string;
  manufacturer?: string;
  installationDate?: string | Date | null;
  expectedLifeValue?: number | null;
  expectedLifeUnit?: number | null;
  currentStatus: number;
  supplierName?: string;
  warrantyStartDate?: string | Date | null;
  warrantyEndDate?: string | Date | null;
  installationLocation?: string;
  currentRunningHours?: number | null;
  notes?: string;
  isActive: boolean;
  metadata?: EntityMetaDataItem[];
}

export interface CreateAssetComponentItem {
  tenantId?: number | null;
  assetId: number;
  componentCode: string;
  componentName: string;
  partNumber?: string;
  serialNumber?: string;
  manufacturer?: string;
  installationDate?: string | Date | null;
  expectedLifeValue?: number | null;
  expectedLifeUnit?: number | null;
  currentStatus: number;
  supplierName?: string;
  warrantyStartDate?: string | Date | null;
  warrantyEndDate?: string | Date | null;
  installationLocation?: string;
  currentRunningHours?: number | null;
  notes?: string;
  isActive: boolean;
  metadata?: EntityMetaDataItem[];
}

export interface UpdateAssetComponentItem extends CreateAssetComponentItem {
  id: number;
}

export interface AssetComponentFilterDto {
  pageNumber: number;
  pageSize: number;
  searchText?: string;
  orderByProp?: string;
  sortDirection?: number;
  isActive?: boolean | null;
  assetId: number;
  tenantId?: number | null;
}
