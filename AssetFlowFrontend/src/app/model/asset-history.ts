import { ListFilterDto } from './list-filter';

export interface AssetHistoryFilter extends ListFilterDto {
  assetId: number;
  eventType?: number | null;
  workOrderId?: number | null;
  userId?: number | null;
}

export interface AssetHistorySummary {
  assetId: number;
  totalMaintenanceEvents: number;
  totalBreakdowns: number;
  totalWorkOrders: number;
  totalPartsReplaced: number;
  totalDowntimeMinutes: number;
  totalMaintenanceCost: number;
  partsCost: number;
  laborCost: number;
  externalServiceCost: number;
  otherCost: number;
}

export interface AssetHistoryEvent {
  eventAt: string | Date;
  eventType: number;
  eventTypeName: string;
  title: string;
  description?: string;
  referenceNumber?: string;
  userName?: string;
  workOrderId?: number | null;
  workOrderNumber?: string;
  issueId?: number | null;
  cost?: number | null;
  currency?: string;
}

export interface AssetHistoryPaged {
  items: AssetHistoryEvent[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface AssetCostSummary {
  totalMaintenanceCost: number;
  partsCost: number;
  laborCost: number;
  externalServiceCost: number;
  otherCost: number;
  recordCount: number;
}

export interface AssetCostHistoryRow {
  id: number;
  costDate: string | Date;
  workOrderId?: number | null;
  workOrderNumber?: string;
  costType: number;
  costTypeName?: string;
  description?: string;
  amount: number;
  currency: string;
  createdByUserName?: string;
}

export interface MaintenanceCostUpsert {
  id?: number | null;
  tenantId?: number | null;
  assetId: number;
  workOrderId?: number | null;
  costType: number;
  description?: string;
  amount: number;
  currency?: string;
  costDate: string | Date;
  notes?: string;
}
