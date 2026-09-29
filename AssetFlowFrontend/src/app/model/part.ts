import { ListFilterDto } from './list-filter';

export interface Part {
  id: number;
  tenantId?: number | null;
  tenantName?: string | null;
  partNumber: string;
  partName: string;
  partCategoryId: number;
  partCategoryName?: string;
  description?: string;
  manufacturer?: string;
  supplierName?: string;
  unitOfMeasure?: string;
  expectedLifeValue?: number | null;
  expectedLifeUnit?: number | null;
  minStockLevel: number;
  maxStockLevel?: number | null;
  isSerialized: boolean;
  isActive: boolean;
  currentStock?: number;
  isLowStock?: boolean;
}

export interface CreatePart {
  tenantId?: number | null;
  partNumber: string;
  partName: string;
  partCategoryId: number;
  description?: string;
  manufacturer?: string;
  supplierName?: string;
  unitOfMeasure?: string;
  expectedLifeValue?: number | null;
  expectedLifeUnit?: number | null;
  minStockLevel: number;
  maxStockLevel?: number | null;
  isSerialized: boolean;
  isActive: boolean;
}

export interface UpdatePart extends CreatePart {
  id: number;
}

export interface PartFilterDto extends ListFilterDto {
  partCategoryId?: number | null;
  isSerialized?: boolean | null;
  lowStockOnly?: boolean | null;
}
