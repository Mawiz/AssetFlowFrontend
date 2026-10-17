import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { WorkflowRuntimeService } from '../../services/workflow-runtime-service';
import { MetadataService } from '@/services/metadata-service';
import { MetaDataByTypeItem } from '../../model/entity-metadata';
import { WorkflowStageActionOption, WorkflowTaskDetail } from '../../model/workflow-runtime';
import { ActionPopUpRenderingComponents, parsePopupComponentIds } from '../../constants/workflow-popup-components';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';

interface UserSelectOption {
  id: number;
  displayName: string;
}

@Component({
  selector: 'app-workflow-task-component',
  standalone: true,
  templateUrl: './workflow-task-component.html',
  styles: [
    `
      .workflow-history-rail {
        width: 1.25rem;
      }

      .workflow-history-marker {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-sizing: border-box;
      }

      .workflow-history-marker--pending {
        width: 0.625rem;
        height: 0.625rem;
        border-radius: 50%;
        border: 2px solid var(--p-primary-color);
        background: var(--p-content-background);
      }

      .workflow-history-marker--done {
        width: 1.125rem;
        height: 1.125rem;
        border-radius: 50%;
        border: 2px solid var(--p-primary-color);
        background: var(--p-primary-color);
        color: var(--p-primary-contrast-color);
        font-size: 0.55rem;
        line-height: 1;
      }

      .workflow-history-marker--done .pi {
        font-size: 0.55rem;
      }

      .workflow-history-line {
        width: 2px;
        min-height: 1rem;
        margin-top: 0.25rem;
        background: var(--p-content-border-color);
      }

      .workflow-history-item:last-child .workflow-history-body {
        padding-bottom: 0;
      }
    `
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    ToastModule,
    DialogModule,
    TextareaModule,
    SelectModule,
    TagModule,
    HasPermissionDirective
  ],
  providers: [MessageService]
})
export class WorkflowTaskComponent implements OnInit, OnDestroy {
  Permissions = Permissions;
  ActionPopUpRenderingComponents = ActionPopUpRenderingComponents;

  detail: WorkflowTaskDetail | null = null;
  loading = false;
  loadError: string | null = null;
  submitting = false;

  actionDialogVisible = false;
  selectedAction: WorkflowStageActionOption | null = null;
  actionForm!: FormGroup;

  userOptions: UserSelectOption[] = [];
  userOptionsLoading = false;

  /** Refreshes pending-duration labels while the task screen is open. */
  historyClockMs = Date.now();
  private historyClockTimer?: ReturnType<typeof setInterval>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workflowService: WorkflowRuntimeService,
    private metadataService: MetadataService,
    private messages: MessageService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.actionForm = this.fb.group({
      comment: [''],
      solution: [''],
      specificPersonUserId: [null as number | null]
    });
    this.route.paramMap.subscribe((params) => {
      const taskId = params.get('taskId');
      if (taskId) this.loadTask(taskId);
    });
    this.historyClockTimer = setInterval(() => {
      this.historyClockMs = Date.now();
      this.cdr.markForCheck();
    }, 60_000);
  }

  ngOnDestroy() {
    if (this.historyClockTimer) clearInterval(this.historyClockTimer);
  }

  loadTask(taskId: string) {
    this.loading = true;
    this.loadError = null;
    this.detail = null;
    this.workflowService.getTaskDetail(taskId).subscribe({
      next: (d) => {
        this.detail = d;
        this.historyClockMs = Date.now();
        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
        this.loadError = e?.error?.errors?.[0] || e?.error?.message || 'Failed to load task';
        this.messages.add({ severity: 'error', summary: 'Error', detail: this.loadError ?? 'Failed to load task' });
      }
    });
  }

  historyEvents() {
    return this.detail?.history ?? [];
  }

  historyAssignedByLabel(name?: string | null): string {
    return name?.trim() || '—';
  }

  historyPerformedByLabel(h: { performedByDisplayName?: string | null; performedByRoleDisplayName?: string | null }): string {
    const name = h.performedByDisplayName?.trim();
    if (!name) return '—';
    const role = h.performedByRoleDisplayName?.trim();
    return role ? `${name} (${role})` : name;
  }

  historyCompletedIn(h: { assignedAt: string; completedAt?: string | null }): string {
    if (!h.completedAt) return '—';
    return this.formatTaskDuration(h.assignedAt, h.completedAt);
  }

  historyPendingFrom(h: { assignedAt: string }): string {
    return this.formatTaskDuration(h.assignedAt, new Date(this.historyClockMs).toISOString());
  }

  private formatTaskDuration(fromIso: string, toIso: string): string {
    const start = new Date(fromIso).getTime();
    const end = new Date(toIso).getTime();
    if (Number.isNaN(start) || Number.isNaN(end)) return '—';
    let totalMinutes = Math.floor(Math.max(0, end - start) / 60_000);
    if (totalMinutes < 1) return 'Less than 1 minute';

    const days = Math.floor(totalMinutes / (60 * 24));
    totalMinutes %= 60 * 24;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days} day${days === 1 ? '' : 's'}`);
    if (hours > 0) parts.push(`${hours} hour${hours === 1 ? '' : 's'}`);
    if (minutes > 0 && days === 0) parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);
    return parts.join(' ') || 'Less than 1 minute';
  }

  backToInbox() {
    this.router.navigate(['/modules/workflow-inbox']);
  }

  popupIds(action: WorkflowStageActionOption): number[] {
    if (action.popupComponentIds?.length) return action.popupComponentIds;
    return parsePopupComponentIds(action.actionPopUpRenderingComponents);
  }

  hasPopup(action: WorkflowStageActionOption): boolean {
    return this.popupIds(action).length > 0;
  }

  needsActionDialog(action: WorkflowStageActionOption): boolean {
    return this.hasPopup(action) || action.isNotesRequired;
  }

  openAction(action: WorkflowStageActionOption) {
    this.selectedAction = action;
    this.userOptions = [];
    this.actionForm.reset({ comment: '', solution: '', specificPersonUserId: null });
    this.configureActionValidators(action);

    if (this.popupIds(action).includes(ActionPopUpRenderingComponents.SpecificPerson)) {
      this.loadUserOptionsFromMetadata();
    }

    if (!this.needsActionDialog(action)) {
      this.confirmPerformAction();
      return;
    }
    this.actionDialogVisible = true;
  }

  private configureActionValidators(action: WorkflowStageActionOption) {
    const ids = this.popupIds(action);
    const commentCtrl = this.actionForm.get('comment')!;
    const solutionCtrl = this.actionForm.get('solution')!;
    const personCtrl = this.actionForm.get('specificPersonUserId')!;

    commentCtrl.clearValidators();
    solutionCtrl.clearValidators();
    personCtrl.clearValidators();

    if (ids.includes(ActionPopUpRenderingComponents.Comment)) {
      commentCtrl.setValidators([Validators.required]);
    } else if (ids.length === 0 && action.isNotesRequired) {
      commentCtrl.setValidators([Validators.required]);
    }

    if (ids.includes(ActionPopUpRenderingComponents.SolutionText)) {
      solutionCtrl.setValidators([Validators.required]);
    }

    if (ids.includes(ActionPopUpRenderingComponents.SpecificPerson)) {
      personCtrl.setValidators([Validators.required]);
    }

    commentCtrl.updateValueAndValidity();
    solutionCtrl.updateValueAndValidity();
    personCtrl.updateValueAndValidity();
  }

  loadUserOptionsFromMetadata() {
    const tenantId = this.detail?.master?.tenantId ?? null;
    this.userOptionsLoading = true;
    this.metadataService.getByType({ type: 'ApplicationUser', tenantId }).subscribe({
      next: (res) => {
        const list = (res?.result ?? []) as MetaDataByTypeItem[];
        this.userOptions = list.map((u) => ({
          id: u.id,
          displayName: u.displayName || u.name || String(u.id)
        }));
        this.userOptionsLoading = false;
      },
      error: () => {
        this.userOptions = [];
        this.userOptionsLoading = false;
        this.messages.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users' });
      }
    });
  }

  confirmPerformAction() {
    if (!this.detail || !this.selectedAction || this.submitting) return;
    if (this.needsActionDialog(this.selectedAction) && this.actionForm.invalid) return;

    const ids = this.popupIds(this.selectedAction);
    const v = this.actionForm.value;
    let notes: string | null = null;
    if (ids.includes(ActionPopUpRenderingComponents.Comment)) notes = v.comment?.trim() || null;
    else if (ids.length === 0) notes = v.comment?.trim() || null;

    let solution: string | null = null;
    if (ids.includes(ActionPopUpRenderingComponents.SolutionText)) solution = v.solution?.trim() || null;

    let specificPersonUserId: number | null = null;
    if (ids.includes(ActionPopUpRenderingComponents.SpecificPerson)) specificPersonUserId = v.specificPersonUserId;

    this.submitting = true;
    this.workflowService
      .performAction({
        workflowTaskId: this.detail.workflowTaskId,
        stageActionId: this.selectedAction.stageActionId,
        notes,
        solution,
        specificPersonUserId
      })
      .subscribe({
        next: (master) => {
          this.submitting = false;
          this.actionDialogVisible = false;
          this.selectedAction = null;
          this.messages.add({ severity: 'success', summary: 'Done', detail: 'Action performed' });
          if (master?.activeWorkflowTaskId && !master.isCompleted) {
            this.router.navigate(['/modules/workflow-inbox/task', master.activeWorkflowTaskId]);
          } else {
            this.loadTask(this.detail!.workflowTaskId);
          }
        },
        error: (e) => {
          this.submitting = false;
          this.messages.add({
            severity: 'error',
            summary: 'Error',
            detail: e?.error?.errors?.[0] || e?.error?.message || 'Action failed'
          });
        }
      });
  }

  showCommentInDialog(): boolean {
    if (!this.selectedAction) return false;
    const ids = this.popupIds(this.selectedAction);
    return ids.includes(ActionPopUpRenderingComponents.Comment) || (ids.length === 0 && this.selectedAction.isNotesRequired);
  }

  showSolutionInDialog(): boolean {
    return !!this.selectedAction && this.popupIds(this.selectedAction).includes(ActionPopUpRenderingComponents.SolutionText);
  }

  showPersonInDialog(): boolean {
    return !!this.selectedAction && this.popupIds(this.selectedAction).includes(ActionPopUpRenderingComponents.SpecificPerson);
  }
}
