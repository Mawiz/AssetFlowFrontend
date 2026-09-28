export interface AssetCategory {
  id: number;
  tenantId?: number | null;
  tenantName?: string | null;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export interface CreateAssetCategory {
  tenantId?: number | null;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export interface UpdateAssetCategory extends CreateAssetCategory {
  id: number;
}
