export interface MetaDataByTypeItem {
  id: number;
  name: string;
  displayName: string;
  hasChildren: boolean;
  parentId?: number | null;
  locationTypeId?: number | null;
  tenantId?: number | null;
}

export interface MetaDataByTypeRequest {
  type: string;
  parentId?: number | null;
  tenantId?: number | null;
  locationTypeId?: number | null;
}
