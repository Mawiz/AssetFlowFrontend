import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
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
    TimelineModule,
    HasPermissionDirective
  ],
  providers: [MessageService]
})
export class WorkflowTaskComponent implements OnInit {
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workflowService: WorkflowRuntimeService,
    private metadataService: MetadataService,
    private messages: MessageService,
    private fb: FormBuilder
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
  }

  loadTask(taskId: string) {
    this.loading = true;
    this.loadError = null;
    this.detail = null;
    this.workflowService.getTaskDetail(taskId).subscribe({
      next: (d) => {
        this.detail = d;
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
