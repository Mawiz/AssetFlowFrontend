import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { PreventiveMaintenanceService } from '../../services/preventive-maintenance-service';
import { CalendarOccurrence } from '../../model/maintenance';
import { MetadataService } from '@/services/metadata-service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-maintenance-calendar-component',
  standalone: true,
  templateUrl: './maintenance-calendar-component.html',
  imports: [CommonModule, TableModule, TagModule, RouterModule]
})
export class MaintenanceCalendarComponent implements OnInit {
  rows = signal<CalendarOccurrence[]>([]);
  statusMap = new Map<number, string>();

  constructor(private service: PreventiveMaintenanceService, private metadata: MetadataService) {}

  ngOnInit() {
    this.metadata.getEnums().subscribe((res: any) => {
      (res?.result?.PreventiveMaintenanceOccurrenceStatus ?? res?.PreventiveMaintenanceOccurrenceStatus ?? []).forEach((x: any) =>
        this.statusMap.set(x.value, x.text)
      );
    });
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 90);
    this.service.calendar({ pageNumber: 1, pageSize: 500, dueFrom: from.toISOString(), dueTo: to.toISOString() }).subscribe((r) => this.rows.set(r));
  }

  statusLabel(v: number) {
    return this.statusMap.get(v) ?? String(v);
  }
}
