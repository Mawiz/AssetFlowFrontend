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
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService } from 'primeng/api';
import { PreventiveMaintenanceService } from '../../services/preventive-maintenance-service';
import { PreventiveMaintenanceOccurrence, PreventiveMaintenanceFilter } from '../../model/maintenance';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';
import { MetadataService } from '@/services/metadata-service';
import { AuthService } from '@/services/auth-service';
import { readPagedList } from '../../utils/paged-list';
import { TenantDto } from '../../model/tenant';

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
    IconFieldModule,
    InputIconModule,
    HasPermissionDirective
  ],
  providers: [MessageService]
})
export class PreventiveMaintenanceComponent implements OnInit {
  Permissions = Permissions;
  rows = signal<PreventiveMaintenanceOccurrence[]>([]);
  totalRecords = 0;
  filter: PreventiveMaintenanceFilter = { pageNumber: 1, pageSize: 15, searchText: '', tenantId: null };
  systemAdmin = false;
  tenantFilterOptions: { label: string; value: number | null }[] = [{ label: 'All tenants', value: null }];
  statusOptions: { label: string; value: number | null }[] = [{ label: 'All', value: null }];
  statusMap = new Map<number, string>();
  executeVisible = false;
  activeOccurrence: PreventiveMaintenanceOccurrence | null = null;
  completeRemarks = '';
  executeItems: ExecuteChecklistRow[] = [];

  constructor(
    private service: PreventiveMaintenanceService,
    private metadata: MetadataService,
    private authService: AuthService,
    private messages: MessageService
  ) {}

  ngOnInit() {
    this.systemAdmin = this.authService.systemAdminPermissions();
    if (this.systemAdmin) {
      this.loadTenants();
    }
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

  onSearch() {
    this.filter.pageNumber = 1;
    this.load();
  }

  onFilterChange() {
    this.filter.pageNumber = 1;
    this.load();
  }

  clearQuickFilters() {
    this.filter.overdueOnly = false;
    this.filter.upcomingOnly = false;
    this.filter.status = null;
    this.filter.pageNumber = 1;
    this.load();
  }

  setOverdueFilter() {
    this.filter.overdueOnly = true;
    this.filter.upcomingOnly = false;
    this.filter.pageNumber = 1;
    this.load();
  }

  setUpcomingFilter() {
    this.filter.upcomingOnly = true;
    this.filter.overdueOnly = false;
    this.filter.pageNumber = 1;
    this.load();
  }

  loadTenants() {
    this.metadata.getMetadataValues({ secretKeys: ['Tenant'] }).subscribe({
      next: (res) => {
        const tenants = res.result?.metaResult[0]?.data || [];
        this.tenantFilterOptions = [
          { label: 'All tenants', value: null },
          ...tenants.map((t: TenantDto) => ({
            label: (t as { displayName?: string }).displayName || t.companyName || String(t.id),
            value: t.id
          }))
        ];
      }
    });
  }

  onTenantFilterChange() {
    this.filter.pageNumber = 1;
    this.load();
  }

  generate() {
    const dto =
      this.systemAdmin && this.filter.tenantId != null ? { tenantId: this.filter.tenantId } : {};
    this.service.generate(dto).subscribe({
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
    if (v === 6) return 'secondary';
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
        numericValue: null,
        remarks: ''
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
      responseValue: i.responseValue?.trim() || null,
      numericValue: i.numericValue,
      remarks: i.remarks?.trim() || null
    }));
    const completionRemarks = this.completeRemarks?.trim();
    this.service.complete({
      occurrenceId: this.activeOccurrence.id,
      remarks: completionRemarks || null,
      checklistResponses
    }).subscribe({
      next: () => {
        this.executeVisible = false;
        this.load();
        this.messages.add({ severity: 'success', summary: 'Completed' });
      },
      error: (e) => this.messages.add({ severity: 'error', summary: 'Error', detail: e?.error?.errors?.[0] || 'Complete failed' })
    });
  }

  onPage(event: { page?: number; rows?: number; first?: number }) {
    this.filter.pageNumber = event.page != null ? event.page + 1 : Math.floor((event.first ?? 0) / (event.rows ?? 15)) + 1;
    this.filter.pageSize = event.rows ?? 15;
    this.load();
  }
}
