import { ListFilterDto } from './list-filter';

export interface WorkflowModuleItemMapping {
  moduleItemMappingId: number;
  moduleId: number;
  moduleNameEn?: string | null;
  referenceItemType: string;
  tenantId?: number | null;
  tenantName?: string | null;
  isActive: boolean;
}

export interface WorkflowMaster {
  workflowMasterId: string;
  moduleId: number;
  moduleNameEn?: string | null;
  referenceItemId: number;
  referenceItemType: string;
  submitBy: number;
  submitByDisplayName?: string | null;
  currentStageId?: number | null;
  currentStageName?: string | null;
  isCompleted: boolean;
  tenantId?: number | null;
  activeWorkflowTaskId?: string | null;
  pendingAssigneeDisplayName?: string | null;
  lastOperationDisplay?: string | null;
}

export interface WorkflowTask {
  workflowTaskId: string;
  workflowMasterId: string;
  moduleStageId: number;
  stageNameEn?: string | null;
  stageActionId?: number | null;
  actionId?: number | null;
  actionDisplayName?: string | null;
  assigneeTypeId?: number | null;
  assignmentValue?: number | null;
  assigneeDisplayName?: string | null;
  isCompleted: boolean;
  assignedAt: string;
  completedAt?: string | null;
  performedByUserId?: number | null;
  performedByDisplayName?: string | null;
  performedByRoleId?: number | null;
  performedByRoleDisplayName?: string | null;
  notes?: string | null;
  solution?: string | null;
  dueDate?: string | null;
  dueInHours?: number | null;
  referenceItemId: number;
  referenceItemType: string;
  moduleNameEn?: string | null;
}

export interface WorkflowStageActionOption {
  stageActionId: number;
  actionId: number;
  stageActionDisplayName: string;
  isNotesRequired: boolean;
  nextSageId?: number | null;
  actionPopUpRenderingComponents?: string | null;
  popupComponentIds?: number[];
}

export interface WorkflowTaskDetail extends WorkflowTask {
  master?: WorkflowMaster | null;
  availableActions: WorkflowStageActionOption[];
  history: WorkflowTask[];
  issue?: IssueWorkflowIssue | null;
  maintenance?: MaintenanceWorkflowItem | null;
}

export interface MaintenanceWorkflowItem {
  id: number;
  tenantId?: number | null;
  scheduleName: string;
  assetId: number;
  assetCode: string;
  assetName: string;
  locationName: string;
  maintenanceTypeName: string;
  scheduledDate?: string | null;
  dueDate: string;
  status: number;
  remarks: string;
}

export enum WorkflowInboxCategory {
  Created = 1,
  PendingWithMe = 2,
  View = 3,
  PerformedByMe = 4
}

export type WorkflowModuleItemMappingFilter = ListFilterDto & { tenantId?: number | null; isActive?: boolean | null };
export type WorkflowInboxFilter = ListFilterDto & { category: WorkflowInboxCategory };

export interface IssueWorkflowIssue {
  id: number;
  issueNumber: string;
  tenantId?: number | null;
  assetId: number;
  assetCode: string;
  assetName: string;
  locationDisplayPath: string;
  issueCategoryName: string;
  priority: number;
  status: number;
  description: string;
  immediateAction: string;
  reportedAt: string;
  reportedByUserName: string;
  assetStatusAtReport: number;
}

export interface IssueWorkflowIntegration {
  issue: IssueWorkflowIssue;
  master?: WorkflowMaster | null;
  activeWorkflowTaskId?: string | null;
  activeTask?: WorkflowTask | null;
  history: WorkflowTask[];
  availableActions: WorkflowStageActionOption[];
}

export const WORKFLOW_REFERENCE_ITEM_TYPES = [
  { label: 'Issue', value: 'Issue' },
  { label: 'Maintenance', value: 'Maintenance' }
];
