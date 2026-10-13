import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { WorkflowRuntimeService } from '../../services/workflow-runtime-service';
import { WorkflowInboxCategory, WorkflowTask } from '../../model/workflow-runtime';
import { readPagedList } from '../../utils/paged-list';
import { Router } from '@angular/router';

@Component({
  selector: 'app-workflow-inbox-component',
  standalone: true,
  templateUrl: './workflow-inbox-component.html',
  imports: [CommonModule, TableModule, ButtonModule, ToolbarModule, ToastModule, TabsModule, TagModule],
  providers: [MessageService]
})
export class WorkflowInboxComponent implements OnInit {
  WorkflowInboxCategory = WorkflowInboxCategory;
  rows = signal<WorkflowTask[]>([]);
  totalRecords = 0;
  category: WorkflowInboxCategory = WorkflowInboxCategory.PendingWithMe;
  filter = { pageNumber: 1, pageSize: 10, searchText: '', category: WorkflowInboxCategory.PendingWithMe };

  constructor(
    private service: WorkflowRuntimeService,
    private messages: MessageService,
    private router: Router
  ) {}

  ngOnInit() {
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
    this.router.navigate(['/modules/workflow-inbox/task', row.workflowTaskId]);
  }
}
