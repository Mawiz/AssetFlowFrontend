import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DrawerModule } from 'primeng/drawer';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { PreventiveMaintenanceService } from '../../services/preventive-maintenance-service';
import { PreventiveMaintenanceOccurrence, PreventiveMaintenanceFilter } from '../../model/maintenance';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';
import { MetadataService } from '@/services/metadata-service';
import { readPagedList } from '../../utils/paged-list';

type PmTagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

interface ExecuteChecklistRow {
  id: number;
  itemText: string;
  responseType: number;
  isRequired: boolean;
  options?: string[];
  responseValue?: string;
  numericValue?: number | null;
  remarks?: string;
}

@Component({
  selector: 'app-preventive-maintenance-component',
  standalone: true,
  templateUrl: './preventive-maintenance-component.html',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    ToastModule,
    SelectModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    DrawerModule,
    TagModule,
    HasPermissionDirective
  ],
  providers: [MessageService]
})
export class PreventiveMaintenanceComponent implements OnInit {
  Permissions = Permissions;
  rows = signal<PreventiveMaintenanceOccurrence[]>([]);
  totalRecords = 0;
  filter: PreventiveMaintenanceFilter = { pageNumber: 1, pageSize: 15, searchText: '' };
  statusOptions: { label: string; value: number | null }[] = [{ label: 'All', value: null }];
  statusMap = new Map<number, string>();
  executeVisible = false;
  activeOccurrence: PreventiveMaintenanceOccurrence | null = null;
  completeRemarks = '';
  executeItems: ExecuteChecklistRow[] = [];

  constructor(private service: PreventiveMaintenanceService, private metadata: MetadataService, private messages: MessageService) {}

  ngOnInit() {
    this.metadata.getEnums().subscribe((res: any) => {
      const data = res?.result ?? res;
      (data?.PreventiveMaintenanceOccurrenceStatus ?? []).forEach((x: any) => {
        this.statusMap.set(x.value, x.text);
        this.statusOptions.push({ label: x.text, value: x.value });
      });
    });
    this.load();
  }

  load() {
    this.service.filter(this.filter).subscribe({
      next: (page) => {
        const { rows, total } = readPagedList<PreventiveMaintenanceOccurrence>(page);
        this.rows.set(rows);
        this.totalRecords = total;
      }
    });
  }

  generate() {
    this.service.generate({}).subscribe({
      next: (r) => {
        this.messages.add({ severity: 'info', summary: 'Generation', detail: `Created ${r?.createdCount ?? 0} occurrence(s)` });
        this.load();
      }
    });
  }

  statusLabel(v: number) {
    return this.statusMap.get(v) ?? String(v);
  }

  severity(v: number): PmTagSeverity {
    if (v === 5) return 'danger';
    if (v === 2) return 'warn';
    if (v === 4) return 'success';
    return 'info';
  }

  openExecute(row: PreventiveMaintenanceOccurrence) {
    this.service.getById(row.id).subscribe((o) => {
      this.activeOccurrence = o;
      this.completeRemarks = '';
      this.executeItems = (o.checklistItems ?? []).map((i) => ({
        id: i.id,
        itemText: i.itemText,
        responseType: i.responseType,
        isRequired: i.isRequired,
        options: i.options,
        responseValue: '',
        numericValue: null
      }));
      this.executeVisible = true;
    });
  }

  selectionOptions(item: ExecuteChecklistRow) {
    return (item.options ?? []).map((o) => ({ label: o, value: o }));
  }

  startPm() {
    if (!this.activeOccurrence) return;
    this.service.start(this.activeOccurrence.id).subscribe({
      next: (o) => {
        this.activeOccurrence = o;
        this.load();
      }
    });
  }

  submitComplete() {
    if (!this.activeOccurrence) return;
    const checklistResponses = this.executeItems.map((i) => ({
      occurrenceChecklistItemId: i.id,
      responseValue: i.responseValue,
      numericValue: i.numericValue,
      remarks: i.remarks
    }));
    this.service.complete({ occurrenceId: this.activeOccurrence.id, remarks: this.completeRemarks, checklistResponses }).subscribe({
      next: () => {
        this.executeVisible = false;
        this.load();
        this.messages.add({ severity: 'success', summary: 'Completed' });
      },
      error: (e) => this.messages.add({ severity: 'error', summary: 'Error', detail: e?.error?.errors?.[0] || 'Complete failed' })
    });
  }

  onPage(e: { first?: number; rows?: number }) {
    this.filter.pageNumber = Math.floor((e.first ?? 0) / (e.rows ?? 15)) + 1;
    this.filter.pageSize = e.rows ?? 15;
    this.load();
  }
}
