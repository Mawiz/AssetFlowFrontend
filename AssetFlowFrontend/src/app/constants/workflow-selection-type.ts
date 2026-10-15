export enum WorkflowSelectionTypeId {
  NoAssignee = 1,
  LastRequestSubmitter = 2,
  RequestAssignTo = 3,
  CurrentRequester = 4,
  ExternalAssignmentInStage = 5
}

export const WORKFLOW_SELECTION_TYPE_OPTIONS = [
  { label: 'No assignee override (use next stage)', value: WorkflowSelectionTypeId.NoAssignee },
  { label: 'Last request submitter', value: WorkflowSelectionTypeId.LastRequestSubmitter },
  { label: 'Request assign to (specific person)', value: WorkflowSelectionTypeId.RequestAssignTo },
  { label: 'Current requester (performer)', value: WorkflowSelectionTypeId.CurrentRequester },
  { label: 'External assignment on next stage', value: WorkflowSelectionTypeId.ExternalAssignmentInStage }
];

export function selectionTypeLabel(id?: number | null): string {
  return WORKFLOW_SELECTION_TYPE_OPTIONS.find((o) => o.value === id)?.label ?? '—';
}
