import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { DrawerModule } from 'primeng/drawer';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService } from 'primeng/api';
import { WorkflowConfigurationService } from '../../services/workflow-configuration-service';
import { WorkflowActionDef } from '../../model/workflow-configuration';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';
import { readPagedList } from '../../utils/paged-list';

@Component({
  selector: 'app-workflow-action-component',
  standalone: true,
  templateUrl: './workflow-action-component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    ToastModule,
    InputTextModule,
    DrawerModule,
    CheckboxModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    HasPermissionDirective
  ],
  providers: [MessageService]
})
export class WorkflowActionComponent implements OnInit {
  Permissions = Permissions;
  rows = signal<WorkflowActionDef[]>([]);
  totalRecords = 0;
  filter = { pageNumber: 1, pageSize: 15, searchText: '' };
  drawerVisible = false;
  isEditing = false;
  submitted = false;
  form!: FormGroup;

  constructor(
    private service: WorkflowConfigurationService,
    private messages: MessageService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      actionId: [null],
      beforeActionEn: ['', Validators.required],
      beforeActionAr: [''],
      afterActionEn: ['', Validators.required],
      afterActionAr: [''],
      baseCssClass: [''],
      isNotesRequired: [false],
      isActive: [true]
    });
    this.load();
  }

  load() {
    this.service.filterActions(this.filter).subscribe({
      next: (page) => {
        const { rows, total } = readPagedList<WorkflowActionDef>(page);
        this.rows.set(rows);
        this.totalRecords = total;
      },
      error: () => this.messages.add({ severity: 'error', summary: 'Error', detail: 'Load failed' })
    });
  }

  onSearch() {
    this.filter.pageNumber = 1;
    this.load();
  }

  onPage(event: { page?: number; rows?: number; first?: number }) {
    this.filter.pageNumber = event.page != null ? event.page + 1 : Math.floor((event.first ?? 0) / (event.rows ?? 15)) + 1;
    this.filter.pageSize = event.rows ?? 15;
    this.load();
  }

  openNew() {
    this.isEditing = false;
    this.submitted = false;
    this.form.reset({ isNotesRequired: false, isActive: true });
    this.drawerVisible = true;
  }

  editItem(item: WorkflowActionDef) {
    this.isEditing = true;
    this.submitted = false;
    this.form.patchValue(item);
    this.drawerVisible = true;
  }

  save() {
    this.submitted = true;
    if (this.form.invalid) return;
    const v = this.form.value;
    const req = this.isEditing
      ? this.service.updateAction(v)
      : this.service.createAction(v);
    req.subscribe({
      next: () => {
        this.messages.add({ severity: 'success', summary: 'Saved', detail: 'Workflow action saved' });
        this.drawerVisible = false;
        this.load();
      },
      error: (e) =>
        this.messages.add({
          severity: 'error',
          summary: 'Error',
          detail: e?.error?.errors?.[0] || 'Save failed'
        })
    });
  }

  deleteItem(item: WorkflowActionDef) {
    if (!confirm('Delete this action definition?')) return;
    this.service.deleteAction(item.actionId).subscribe({
      next: () => {
        this.messages.add({ severity: 'success', summary: 'Deleted', detail: 'Action removed' });
        this.load();
      },
      error: (e) =>
        this.messages.add({ severity: 'error', summary: 'Error', detail: e?.error?.errors?.[0] || 'Delete failed' })
    });
  }
}
