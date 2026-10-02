import { ListFilterDto } from './list-filter';

export interface MaintenanceType {
  id: number;
  tenantId?: number | null;
  tenantName?: string;
  name: string;
  code: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface MaintenanceChecklistItemOption {
  id?: number;
  optionText: string;
  sortOrder: number;
  isActive?: boolean;
}

export interface MaintenanceChecklistItem {
  id?: number;
  itemText: string;
  description?: string;
  responseType: number;
  isRequired: boolean;
  sortOrder: number;
  isActive?: boolean;
  options?: MaintenanceChecklistItemOption[];
}

export interface MaintenanceChecklist {
  id: number;
  tenantId?: number | null;
  tenantName?: string;
  name: string;
  code: string;
  description?: string;
  maintenanceTypeId?: number | null;
  maintenanceTypeName?: string;
  version: number;
  isActive: boolean;
  items?: MaintenanceChecklistItem[];
}

export interface MaintenanceSchedule {
  id: number;
  tenantId?: number | null;
  tenantName?: string;
  assetId: number;
  assetCode?: string;
  assetName?: string;
  locationId?: number;
  locationName?: string;
  maintenanceTypeId: number;
  maintenanceTypeName?: string;
  maintenanceChecklistId?: number | null;
  checklistName?: string;
  name: string;
  description?: string;
  recurrenceType: number;
  intervalValue: number;
  dayOfWeek?: number | null;
  startDate: string;
  endDate?: string | null;
  nextDueDate?: string | null;
  nextDueOperatingHours?: number | null;
  nextDueCycles?: number | null;
  responsibleUserId?: number | null;
  generationHorizonDays: number;
  isActive: boolean;
  frequencyDisplay?: string;
}

export interface PreventiveMaintenanceOccurrence {
  id: number;
  tenantId?: number | null;
  tenantName?: string;
  maintenanceScheduleId: number;
  scheduleName?: string;
  assetId: number;
  assetCode?: string;
  assetName?: string;
  locationName?: string;
  maintenanceTypeId: number;
  maintenanceTypeName?: string;
  scheduledDate?: string | null;
  dueDate: string;
  dueOperatingHours?: number | null;
  dueCycles?: number | null;
  status: number;
  startedAt?: string | null;
  completedAt?: string | null;
  remarks?: string;
  checklistItems?: PreventiveMaintenanceOccurrenceChecklistItem[];
}

export interface PreventiveMaintenanceOccurrenceChecklistItem {
  id: number;
  itemText: string;
  description?: string;
  responseType: number;
  isRequired: boolean;
  sortOrder: number;
  options?: string[];
  response?: {
    responseValue?: string;
    numericValue?: number | null;
    remarks?: string;
  };
}

export interface SubmitChecklistResponseDto {
  occurrenceChecklistItemId: number;
  responseValue?: string | null;
  numericValue?: number | null;
  remarks?: string | null;
}

export interface CompletePreventiveMaintenanceDto {
  occurrenceId: number;
  remarks?: string | null;
  checklistResponses: SubmitChecklistResponseDto[];
}

export interface PreventiveMaintenanceFilter extends ListFilterDto {
  assetId?: number | null;
  maintenanceScheduleId?: number | null;
  maintenanceTypeId?: number | null;
  locationId?: number | null;
  status?: number | null;
  overdueOnly?: boolean | null;
  upcomingOnly?: boolean | null;
  completedOnly?: boolean | null;
  dueFrom?: string | null;
  dueTo?: string | null;
}

export interface CalendarOccurrence {
  id: number;
  title: string;
  start: string;
  end: string;
  status: number;
  assetId: number;
  assetCode: string;
}

export interface AssetPreventiveMaintenanceSummary {
  activeSchedules: MaintenanceSchedule[];
  nextOccurrence?: PreventiveMaintenanceOccurrence | null;
  recentOccurrences: PreventiveMaintenanceOccurrence[];
}
