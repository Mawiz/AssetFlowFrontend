import { WorkOrder } from '../../model/work-order';
import { Permissions } from '@/constants/permissions';

/** Mirrors AssetFlow.Common.Enum.WorkOrderStatus */
export const WoStatus = {
  New: 1,
  Submitted: 2,
  PendingAssignment: 3,
  Assigned: 4,
  Accepted: 5,
  InProgress: 6,
  WaitingForParts: 7,
  WaitingForApproval: 8,
  Completed: 9,
  Rejected: 10,
  Reopened: 11,
  Cancelled: 12,
  Closed: 13
} as const;

export interface WorkOrderActionContext {
  userId: number | null;
  hasPermission: (permission: string) => boolean;
}

function isAssignee(wo: WorkOrder, userId: number | null): boolean {
  return userId != null && wo.assignedToUserId != null && wo.assignedToUserId === userId;
}

function isTerminal(status: number): boolean {
  return status === WoStatus.Cancelled || status === WoStatus.Closed;
}

export function canAssignWorkOrder(ctx: WorkOrderActionContext, wo: WorkOrder): boolean {
  return ctx.hasPermission(Permissions.WorkOrder.Assign) && wo.status === WoStatus.PendingAssignment;
}

export function canReassignWorkOrder(ctx: WorkOrderActionContext, wo: WorkOrder): boolean {
  return (
    ctx.hasPermission(Permissions.WorkOrder.Reassign) &&
    (wo.status === WoStatus.Assigned || wo.status === WoStatus.Accepted)
  );
}

export function showAssignmentSection(ctx: WorkOrderActionContext, wo: WorkOrder): boolean {
  return canAssignWorkOrder(ctx, wo) || canReassignWorkOrder(ctx, wo);
}

export function canAcceptWorkOrder(ctx: WorkOrderActionContext, wo: WorkOrder): boolean {
  return ctx.hasPermission(Permissions.WorkOrder.Accept) && isAssignee(wo, ctx.userId) && wo.status === WoStatus.Assigned;
}

export function canStartWorkOrder(ctx: WorkOrderActionContext, wo: WorkOrder): boolean {
  return (
    ctx.hasPermission(Permissions.WorkOrder.Start) &&
    isAssignee(wo, ctx.userId) &&
    (wo.status === WoStatus.Accepted || wo.status === WoStatus.Reopened)
  );
}

export function canPauseWorkOrder(ctx: WorkOrderActionContext, wo: WorkOrder): boolean {
  return ctx.hasPermission(Permissions.WorkOrder.Pause) && isAssignee(wo, ctx.userId) && wo.status === WoStatus.InProgress;
}

export function canWaitingForParts(ctx: WorkOrderActionContext, wo: WorkOrder): boolean {
  return ctx.hasPermission(Permissions.WorkOrder.Pause) && isAssignee(wo, ctx.userId) && wo.status === WoStatus.InProgress;
}

export function canResumeWorkOrder(ctx: WorkOrderActionContext, wo: WorkOrder): boolean {
  return (
    ctx.hasPermission(Permissions.WorkOrder.Resume) &&
    isAssignee(wo, ctx.userId) &&
    (wo.status === WoStatus.InProgress || wo.status === WoStatus.WaitingForParts)
  );
}

export function showEngineerActionBar(ctx: WorkOrderActionContext, wo: WorkOrder): boolean {
  return (
    canAcceptWorkOrder(ctx, wo) ||
    canStartWorkOrder(ctx, wo) ||
    canPauseWorkOrder(ctx, wo) ||
    canWaitingForParts(ctx, wo) ||
    canResumeWorkOrder(ctx, wo)
  );
}

export function canEditDiagnosis(ctx: WorkOrderActionContext, wo: WorkOrder): boolean {
  return ctx.hasPermission(Permissions.WorkOrder.Update) && isAssignee(wo, ctx.userId) && !isTerminal(wo.status);
}

export function canCompleteWorkOrder(ctx: WorkOrderActionContext, wo: WorkOrder): boolean {
  return (
    ctx.hasPermission(Permissions.WorkOrder.Complete) &&
    isAssignee(wo, ctx.userId) &&
    (wo.status === WoStatus.InProgress || wo.status === WoStatus.WaitingForParts)
  );
}

export function showCompletionReadOnly(ctx: WorkOrderActionContext, wo: WorkOrder): boolean {
  if (canCompleteWorkOrder(ctx, wo)) return false;
  return (
    !!wo.workPerformed ||
    !!wo.finalResult ||
    wo.status === WoStatus.WaitingForApproval ||
    wo.status === WoStatus.Closed
  );
}

export function canApproveWorkOrder(ctx: WorkOrderActionContext, wo: WorkOrder): boolean {
  if (wo.status !== WoStatus.WaitingForApproval || !ctx.hasPermission(Permissions.WorkOrder.Approve)) return false;
  if (wo.completedByUserId != null && ctx.userId != null && wo.completedByUserId === ctx.userId) return false;
  return true;
}

export function canRejectWorkOrder(ctx: WorkOrderActionContext, wo: WorkOrder): boolean {
  return wo.status === WoStatus.WaitingForApproval && ctx.hasPermission(Permissions.WorkOrder.Reject);
}

export function showManagerApprovalSection(ctx: WorkOrderActionContext, wo: WorkOrder): boolean {
  return wo.status === WoStatus.WaitingForApproval && (canApproveWorkOrder(ctx, wo) || canRejectWorkOrder(ctx, wo));
}

export function canReopenWorkOrder(ctx: WorkOrderActionContext, wo: WorkOrder): boolean {
  return wo.status === WoStatus.Rejected && ctx.hasPermission(Permissions.WorkOrder.Reopen);
}

export function canUploadWorkOrderAttachment(ctx: WorkOrderActionContext, wo: WorkOrder): boolean {
  return ctx.hasPermission(Permissions.WorkOrder.Update) && !isTerminal(wo.status) && isAssignee(wo, ctx.userId);
}

export function showDiagnosisReadOnly(wo: WorkOrder): boolean {
  const d = wo.diagnosis;
  return !!(d?.diagnosis || d?.rootCause || d?.actionTaken || d?.initialProblem || wo.issueDescription);
}
