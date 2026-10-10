import { ListFilterDto } from './list-filter';

export interface WorkOrder {
  id: number;
  tenantId?: number | null;
  tenantName?: string;
  workOrderNumber: string;
  sourceType: number;
  assetIssueId?: number | null;
  issueNumber?: string;
  issueDescription?: string;
  preventiveMaintenanceOccurrenceId?: number | null;
  maintenanceScheduleName?: string;
  maintenanceTypeName?: string;
  pmScheduledDate?: string | Date | null;
  pmDueDate?: string | Date | null;
  assetId: number;
  assetCode?: string;
  assetName?: string;
  locationId: number;
  locationDisplayPath?: string;
  priority: number;
  status: number;
  title: string;
  description?: string;
  assignedByUserId?: number | null;
  assignedByUserName?: string;
  assignedToUserId?: number | null;
  assignedToUserName?: string;
  assignedAt?: string | Date | null;
  acceptedAt?: string | Date | null;
  engineerArrivedAt?: string | Date | null;
  startedAt?: string | Date | null;
  pausedAt?: string | Date | null;
  resumedAt?: string | Date | null;
  completedAt?: string | Date | null;
  completedByUserId?: number | null;
  completedByUserName?: string;
  assetRestoredAt?: string | Date | null;
  assetStatusAfterWork?: number | null;
  closedAt?: string | Date | null;
  dueDate?: string | Date | null;
  createdOn?: string | Date;
  workPerformed?: string;
  finalResult?: string;
  remarks?: string;
  rejectionReason?: string;
  cancellationReason?: string;
  approvalRemarks?: string;
  approvedByUserName?: string;
  approvedAt?: string | Date | null;
  issueReportedByUserName?: string;
  issueReportedAt?: string | Date | null;
  issueImmediateAction?: string;
  diagnosis?: WorkOrderDiagnosis;
  statusHistory?: WorkOrderStatusHistory[];
  assignmentHistory?: WorkOrderAssignmentHistory[];
  attachments?: WorkOrderAttachment[];
}

export interface WorkOrderDiagnosis {
  id: number;
  initialProblem?: string;
  diagnosis?: string;
  rootCause?: string;
  actionTaken?: string;
  finalResult?: string;
  diagnosedByUserName?: string;
  diagnosedAt?: string | Date;
  remarks?: string;
}

export interface WorkOrderStatusHistory {
  id: number;
  fromStatus: number;
  toStatus: number;
  changedByUserName?: string;
  changedAt: string | Date;
  remarks?: string;
}

export interface WorkOrderAssignmentHistory {
  id: number;
  assignedToUserName?: string;
  assignedByUserName?: string;
  assignedAt: string | Date;
  unassignedAt?: string | Date | null;
  remarks?: string;
}

export interface WorkOrderAttachment {
  id: number;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  downloadUrl: string;
}

export interface WorkOrderFilter extends ListFilterDto {
  sourceType?: number | null;
  assetId?: number | null;
  priority?: number | null;
  status?: number | null;
  assignedToUserId?: number | null;
  myAssignmentsOnly?: boolean | null;
}

export interface WorkOrderAssign {
  id: number;
  assignedToUserId: number;
  remarks?: string;
}

export interface WorkOrderActionRemarks {
  id: number;
  remarks?: string;
}

export interface WorkOrderDiagnosisUpsert {
  workOrderId: number;
  initialProblem?: string;
  diagnosis?: string;
  rootCause?: string;
  actionTaken?: string;
  finalResult?: string;
  remarks?: string;
}

export interface WorkOrderComplete {
  id: number;
  workPerformed?: string;
  finalResult?: string;
  remarks?: string;
  assetStatusAfterWork?: number | null;
}

export interface WorkOrderApprove {
  id: number;
  approvalRemarks?: string;
  restoreAssetOperational?: boolean;
}
