import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { PreventiveMaintenanceService } from '../../services/preventive-maintenance-service';
import { CalendarOccurrence } from '../../model/maintenance';
import { MetadataService } from '@/services/metadata-service';
import { AuthService } from '@/services/auth-service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { PreventiveMaintenanceFilter } from '../../model/maintenance';
import { TenantDto } from '../../model/tenant';

type PmTagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

@Component({
  selector: 'app-maintenance-calendar-component',
  standalone: true,
  templateUrl: './maintenance-calendar-component.html',
  imports: [CommonModule, FormsModule, TableModule, TagModule, ToolbarModule, ButtonModule, SelectModule, RouterModule]
})
export class MaintenanceCalendarComponent implements OnInit {
  rows = signal<CalendarOccurrence[]>([]);
  statusMap = new Map<number, string>();
  systemAdmin = false;
  filter: PreventiveMaintenanceFilter = { pageNumber: 1, pageSize: 500, tenantId: null };
  tenantFilterOptions: { label: string; value: number | null }[] = [{ label: 'All tenants', value: null }];

  constructor(
    private service: PreventiveMaintenanceService,
    private metadata: MetadataService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.systemAdmin = this.authService.systemAdminPermissions();
    if (this.systemAdmin) {
      this.loadTenants();
    }
    this.metadata.getEnums().subscribe((res: unknown) => {
      const data = (res as { result?: unknown })?.result ?? res;
      const list = (data as Record<string, { text: string; value: number }[]>)?.['PreventiveMaintenanceOccurrenceStatus'] ?? [];
      list.forEach((x) => this.statusMap.set(x.value, x.text));
    });
    this.loadCalendar();
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

  loadCalendar() {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 90);
    this.service
      .calendar({ ...this.filter, dueFrom: from.toISOString(), dueTo: to.toISOString() })
      .subscribe((r) => this.rows.set(r));
  }

  onTenantFilterChange() {
    this.loadCalendar();
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
}
