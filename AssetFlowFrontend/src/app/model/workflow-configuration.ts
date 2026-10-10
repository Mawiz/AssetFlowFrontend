import { ListFilterDto } from './list-filter';

export interface WorkflowModule {
  moduleId: number;
  moduleNameEn: string;
  moduleNameAr?: string | null;
  displayOrder: number;
  isReOpen: boolean;
  tenantId?: number | null;
  tenantName?: string | null;
  isActive: boolean;
}

export interface WorkflowModuleStage {
  stageId: number;
  moduleId: number;
  stageNameEn: string;
  stageNameAr?: string | null;
  sequenceNo: number;
  dueInHours: number;
  versionNo: number;
  emailTemplateId: number;
  isFinalApprover: boolean;
  acknowledgementTemplateId?: number | null;
  isClosingStage: boolean;
  isInitialStage: boolean;
  isLogOpen: boolean;
  isTATExtension: boolean;
  assigneeTypeId?: number | null;
  assignmentValue?: number | null;
  assigneeDisplayName?: string | null;
  isActive: boolean;
}

export interface WorkflowActionDef {
  actionId: number;
  beforeActionEn: string;
  beforeActionAr: string;
  afterActionEn: string;
  afterActionAr: string;
  baseCssClass: string;
  isNotesRequired: boolean;
  isActive: boolean;
}

export interface WorkflowStageAction {
  stageActionId: number;
  stageId: number;
  actionId: number;
  actionLabel?: string | null;
  stageActionDisplayName: string;
  stageActionDisplayNameAr?: string | null;
  emailTemplateId: number;
  displayOrderNo: number;
  cssClass?: string | null;
  nextSageId?: number | null;
  nextStageName?: string | null;
  assigneeTypeId?: number | null;
  assignmentValue?: number | null;
  assigneeDisplayName?: string | null;
  acknowledgementTemplateId?: number | null;
  actionPopUpRenderingComponents?: string | null;
  templateId?: string | null;
  smsTemplateId?: string | null;
  isActive: boolean;
}

export interface WorkflowStageActionViewer {
  stageActionViewerId: number;
  stageId: number;
  viewerTypeId: number;
  viewerValue: number;
  viewerDisplayName?: string | null;
  isActive: boolean;
}

export type WorkflowModuleFilter = ListFilterDto;
