import { ListFilterDto } from './list-filter';

export interface AssetType {
  id: number;
  tenantId?: number | null;
  tenantName?: string | null;
  assetCategoryId: number;
  assetCategoryName?: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export interface CreateAssetType {
  tenantId?: number | null;
  assetCategoryId: number;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export interface UpdateAssetType extends CreateAssetType {
  id: number;
}

export interface AssetTypeFilterDto extends ListFilterDto {
  assetCategoryId?: number | null;
}
