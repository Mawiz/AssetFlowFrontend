export type PeriodPreset =
  | 'Today'
  | 'ThisWeek'
  | 'ThisMonth'
  | 'LastMonth'
  | 'ThisQuarter'
  | 'ThisYear'
  | 'Custom';

export interface ReportingFilter {
  periodPreset?: PeriodPreset | string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  tenantId?: number | null;
  assetId?: number | null;
  assetCategoryId?: number | null;
  assetTypeId?: number | null;
  locationId?: number | null;
  pageSize?: number;
  pageNumber?: number;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface AssetSummary {
  totalAssets: number;
  operational: number;
  underMaintenance: number;
  breakdown: number;
  retired: number;
  critical: number;
  statusDistribution: ChartPoint[];
  criticalityDistribution: ChartPoint[];
  byCategory: ChartPoint[];
  byLocation: ChartPoint[];
}

export interface MaintenanceSummary {
  openIssues: number;
  openWorkOrders: number;
  todaysMaintenance: number;
  overdueMaintenance: number;
  completedToday: number;
  waitingForParts: number;
  pmCompliancePercent?: number | null;
  workOrderStatusDistribution: ChartPoint[];
  pmStatusDistribution: ChartPoint[];
  maintenanceCostTrend: ChartPoint[];
}

export interface PerformanceSummary {
  mtbfHours?: number | null;
  mttrHours?: number | null;
  totalDowntimeMinutes: number;
  pmCompliancePercent?: number | null;
  firstTimeFixRatePercent?: number | null;
  avgResponseTimeMinutes?: number | null;
}

export interface SparePartSummary {
  totalParts: number;
  lowStockParts: number;
  partsConsumedInPeriod: number;
  partsReplacedInPeriod: number;
}

export interface TopFailingAsset {
  assetId: number;
  assetCode: string;
  assetName: string;
  categoryName: string;
  locationName: string;
  breakdownCount: number;
  openIssues: number;
  closedIssues: number;
  totalDowntimeMinutes: number;
  maintenanceCost: number;
  lastFailureDate?: string | null;
}

export interface DashboardSummary {
  asset: AssetSummary;
  maintenance: MaintenanceSummary;
  performance: PerformanceSummary;
  spareParts: SparePartSummary;
  breakdownTrend: ChartPoint[];
  topFailingAssets: TopFailingAsset[];
  periodStart?: string | null;
  periodEnd?: string | null;
}

export interface AssetReliabilityRow {
  assetId: number;
  assetCode: string;
  assetName: string;
  categoryName: string;
  breakdowns: number;
  mtbfHours?: number | null;
  mttrHours?: number | null;
  downtimeMinutes: number;
  maintenanceCost: number;
  partsReplaced: number;
  lastBreakdown?: string | null;
  lastMaintenance?: string | null;
}

export interface EngineerPerformanceRow {
  userId: number;
  engineerName: string;
  assignedJobs: number;
  completedJobs: number;
  pendingJobs: number;
  overdueJobs: number;
  completionRatePercent: number;
  avgResponseTimeMinutes?: number | null;
  avgRepairTimeMinutes?: number | null;
  reopenedJobs: number;
  pmCompleted: number;
  pmOverdue: number;
  partsUsed: number;
}

export interface AssetCostReportRow {
  assetId: number;
  assetCode: string;
  assetName: string;
  categoryName: string;
  workOrderCount: number;
  laborCost: number;
  partsCost: number;
  externalServiceCost: number;
  otherCost: number;
  totalMaintenanceCost: number;
}

export interface AssetReportBundle {
  summary: AssetSummary;
  byType: ChartPoint[];
  reliability: AssetReliabilityRow[];
  topFailing: TopFailingAsset[];
  highestCost: AssetCostReportRow[];
}

export interface PmReportSummary {
  totalScheduled: number;
  completed: number;
  upcoming: number;
  due: number;
  overdue: number;
  cancelled: number;
  compliancePercent?: number | null;
  completionTrend: ChartPoint[];
  complianceByMonth: ChartPoint[];
}

export interface MaintenanceReportBundle {
  summary: MaintenanceSummary;
  preventiveMaintenance: PmReportSummary;
  totalMaintenanceCost: number;
  activityTrend: ChartPoint[];
}

export interface BreakdownReportBundle {
  totalBreakdowns: number;
  trend: ChartPoint[];
  byCategory: ChartPoint[];
  byLocation: ChartPoint[];
  byIssueCategory: ChartPoint[];
  byPriority: ChartPoint[];
  topFailingAssets: TopFailingAsset[];
  repeatedFailures: { assetId: number; assetCode: string; assetName: string; breakdownCount: number }[];
  totalDowntimeMinutes: number;
}

export interface PartStockReportRow {
  partId: number;
  partNumber: string;
  partName: string;
  categoryName: string;
  totalQuantity: number;
  locations: string;
  manufacturer: string;
  isLowStock: boolean;
}

export interface PartTransactionSummary {
  quantityReceived: number;
  quantityIssued: number;
  quantityReturned: number;
  quantityAdjusted: number;
  quantityTransferred: number;
  quantityFaulty: number;
  quantityReturnedToSupplier: number;
  quantityScrapped: number;
}

export interface TopReplacedPart {
  partId: number;
  partNumber: string;
  partName: string;
  manufacturer: string;
  replacementCount: number;
  lastReplacementDate?: string | null;
}

export interface SparePartsReportBundle {
  summary: SparePartSummary;
  stock: PartStockReportRow[];
  transactions: PartTransactionSummary;
  mostReplaced: TopReplacedPart[];
  partLife: unknown[];
  bySupplier: ChartPoint[];
  byManufacturer: ChartPoint[];
}

export interface PerformanceReportBundle {
  summary: PerformanceSummary;
  engineers: EngineerPerformanceRow[];
}

export interface CostReportBundle {
  totalLabor: number;
  totalParts: number;
  totalExternal: number;
  totalOther: number;
  grandTotal: number;
  byMonth: ChartPoint[];
  byAsset: AssetCostReportRow[];
}

export interface KpiMetric {
  key: string;
  label: string;
  value?: number | null;
  previousValue?: number | null;
  changePercent?: number | null;
  unit: string;
  drillRoute?: string | null;
  drillQuery?: string | null;
  higherIsBetter: boolean;
}

export interface AnalyticsInsight {
  text: string;
  severity: string;
  drillRoute?: string | null;
  drillQuery?: string | null;
}

export interface AssetAttention {
  assetId: number;
  assetCode: string;
  assetName: string;
  reasons: string[];
  breakdownCount: number;
  overduePmCount: number;
  downtimeMinutes: number;
  maintenanceCost: number;
}

export interface TimeSeriesMulti {
  labels: string[];
  series: { name: string; values: number[] }[];
}

export interface StackedCostMonth {
  label: string;
  labor: number;
  parts: number;
  external: number;
  other: number;
  total: number;
}

export interface ScatterPoint {
  assetId: number;
  label: string;
  x: number;
  y: number;
  tooltip: string;
}

export interface ManagementAnalytics {
  summary: DashboardSummary;
  heroKpis: KpiMetric[];
  insights: AnalyticsInsight[];
  attentionAssets: AssetAttention[];
  maintenanceActivity: TimeSeriesMulti;
  workOrderPipeline: ChartPoint[];
  costTrendStacked: StackedCostMonth[];
  downtimeTrend: ChartPoint[];
  topDowntimeAssets: TopFailingAsset[];
  topReplacedParts: TopReplacedPart[];
  stockByLocation: ChartPoint[];
  teamPerformance: EngineerPerformanceRow[];
  lastUpdatedUtc: string;
}

export interface AssetAnalyticsDashboard {
  summary: AssetSummary;
  kpis: KpiMetric[];
  byType: ChartPoint[];
  byLocation: { locationName: string; assetCount: number; breakdownCount: number; downtimeMinutes: number }[];
  ageDistribution: { label: string; count: number }[];
  reliability: AssetReliabilityRow[];
  mtbfMttrScatter: ScatterPoint[];
}

export interface MaintenanceAnalyticsDashboard {
  summary: MaintenanceSummary;
  preventiveMaintenance: PmReportSummary;
  overduePm: unknown[];
  pmComplianceBreakdown: ChartPoint[];
  pmTrend: TimeSeriesMulti;
  workOrdersByPriority: ChartPoint[];
  pmByCategory: ChartPoint[];
}

export interface ReliabilityAnalyticsDashboard {
  breakdown: BreakdownReportBundle;
  performance: PerformanceSummary;
  mtbfMttrScatter: ScatterPoint[];
  costVsBreakdownScatter: ScatterPoint[];
  repeatedFailures: TopFailingAsset[];
}

export interface WorkOrderAnalyticsDashboard {
  statusPipeline: ChartPoint[];
  aging: { label: string; count: number }[];
  byPriority: ChartPoint[];
  completionTrend: TimeSeriesMulti;
  kpis: KpiMetric[];
}

export interface SparePartsAnalyticsDashboard {
  report: SparePartsReportBundle;
  totalStockQuantity: number;
  faultyStockQuantity: number;
  consumptionTrend: ChartPoint[];
  inventoryHealth: ChartPoint[];
}

export interface CostAnalyticsDashboard {
  report: CostReportBundle;
  kpis: KpiMetric[];
  costVsBreakdownScatter: ScatterPoint[];
}

export interface AssetDetailAnalytics {
  assetId: number;
  assetCode: string;
  assetName: string;
  status: number;
  criticality: number;
  kpis: KpiMetric[];
  breakdownTrend: ChartPoint[];
  costTrend: StackedCostMonth[];
  mtbfHours?: number | null;
  mttrHours?: number | null;
  lastMaintenance?: string | null;
  nextMaintenanceDue?: string | null;
}
