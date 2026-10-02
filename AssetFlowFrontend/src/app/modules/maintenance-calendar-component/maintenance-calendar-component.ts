import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { PreventiveMaintenanceService } from '../../services/preventive-maintenance-service';
import { CalendarOccurrence } from '../../model/maintenance';
import { MetadataService } from '@/services/metadata-service';
import { RouterModule } from '@angular/router';

type PmTagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

@Component({
  selector: 'app-maintenance-calendar-component',
  standalone: true,
  templateUrl: './maintenance-calendar-component.html',
  imports: [CommonModule, TableModule, TagModule, ToolbarModule, ButtonModule, RouterModule]
})
export class MaintenanceCalendarComponent implements OnInit {
  rows = signal<CalendarOccurrence[]>([]);
  statusMap = new Map<number, string>();

  constructor(private service: PreventiveMaintenanceService, private metadata: MetadataService) {}

  ngOnInit() {
    this.metadata.getEnums().subscribe((res: unknown) => {
      const data = (res as { result?: unknown })?.result ?? res;
      const list = (data as Record<string, { text: string; value: number }[]>)?.['PreventiveMaintenanceOccurrenceStatus'] ?? [];
      list.forEach((x) => this.statusMap.set(x.value, x.text));
    });
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 90);
    this.service.calendar({ pageNumber: 1, pageSize: 500, dueFrom: from.toISOString(), dueTo: to.toISOString() }).subscribe((r) => this.rows.set(r));
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
