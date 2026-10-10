import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { WorkflowRuntimeService } from '../../services/workflow-runtime-service';
import { WorkflowInboxCategory, WorkflowStageActionOption, WorkflowTask, WorkflowTaskDetail } from '../../model/workflow-runtime';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';
import { readPagedList } from '../../utils/paged-list';

@Component({
  selector: 'app-workflow-inbox-component',
  standalone: true,
  templateUrl: './workflow-inbox-component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    ToastModule,
    DialogModule,
    TabsModule,
    TextareaModule,
    TagModule,
    HasPermissionDirective
  ],
  providers: [MessageService]
})
export class WorkflowInboxComponent implements OnInit {
  Permissions = Permissions;
  WorkflowInboxCategory = WorkflowInboxCategory;
  rows = signal<WorkflowTask[]>([]);
  totalRecords = 0;
  category: WorkflowInboxCategory = WorkflowInboxCategory.PendingWithMe;
  filter = { pageNumber: 1, pageSize: 10, searchText: '', category: WorkflowInboxCategory.PendingWithMe };

  detailVisible = false;
  detail: WorkflowTaskDetail | null = null;
  actionForm!: FormGroup;
  selectedAction: WorkflowStageActionOption | null = null;

  constructor(
    private service: WorkflowRuntimeService,
    private messages: MessageService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.actionForm = this.fb.group({ notes: [''] });
    this.load();
  }

  onTabChange(value: string | number) {
    this.category = Number(value) as WorkflowInboxCategory;
    this.filter.category = this.category;
    this.filter.pageNumber = 1;
    this.load();
  }

  load() {
    this.filter.category = this.category;
    this.service.filterInbox(this.filter).subscribe({
      next: (r) => {
        const { rows, total } = readPagedList<WorkflowTask>(r);
        this.rows.set(rows);
        this.totalRecords = total;
      },
      error: () => this.messages.add({ severity: 'error', summary: 'Error', detail: 'Failed to load inbox' })
    });
  }

  openTask(row: WorkflowTask) {
    this.service.getTaskDetail(row.workflowTaskId).subscribe({
      next: (d) => {
        this.detail = d;
        this.selectedAction = null;
        this.actionForm.reset({ notes: '' });
        this.detailVisible = true;
      },
      error: () => this.messages.add({ severity: 'error', summary: 'Error', detail: 'Failed to load task' })
    });
  }

  pickAction(action: WorkflowStageActionOption) {
    this.selectedAction = action;
    if (!action.isNotesRequired) this.actionForm.get('notes')?.clearValidators();
    else this.actionForm.get('notes')?.setValidators([Validators.required]);
    this.actionForm.get('notes')?.updateValueAndValidity();
  }

  performAction() {
    if (!this.detail || !this.selectedAction) return;
    if (this.actionForm.invalid) return;
    this.service
      .performAction({
        workflowTaskId: this.detail.workflowTaskId,
        stageActionId: this.selectedAction.stageActionId,
        notes: this.actionForm.value.notes
      })
      .subscribe({
        next: () => {
          this.messages.add({ severity: 'success', summary: 'Done', detail: 'Action performed' });
          this.detailVisible = false;
          this.load();
        },
        error: (e) => this.messages.add({ severity: 'error', summary: 'Error', detail: e?.error?.errors?.[0] || 'Action failed' })
      });
  }
}
