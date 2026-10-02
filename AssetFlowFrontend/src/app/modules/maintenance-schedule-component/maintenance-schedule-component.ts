import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DrawerModule } from 'primeng/drawer';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { MaintenanceScheduleService } from '../../services/maintenance-schedule-service';
import { MaintenanceTypeService } from '../../services/maintenance-type-service';
import { MaintenanceChecklistService } from '../../services/maintenance-checklist-service';
import { AssetService } from '../../services/asset-service';
import { MaintenanceSchedule } from '../../model/maintenance';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';
import { MetadataService } from '@/services/metadata-service';
import { ListFilterDto } from '../../model/list-filter';
import { readPagedList } from '../../utils/paged-list';
import { Asset } from '../../model/asset';

@Component({
  selector: 'app-maintenance-schedule-component',
  standalone: true,
  templateUrl: './maintenance-schedule-component.html',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    ToastModule,
    InputTextModule,
    TextareaModule,
    DrawerModule,
    SelectModule,
    InputNumberModule,
    DatePickerModule,
    CheckboxModule,
    HasPermissionDirective
  ],
  providers: [MessageService]
})
export class MaintenanceScheduleComponent implements OnInit {
  Permissions = Permissions;
  rows = signal<MaintenanceSchedule[]>([]);
  totalRecords = 0;
  filter: ListFilterDto = { pageNumber: 1, pageSize: 10, searchText: '' };
  drawerVisible = false;
  editModel: any = { intervalValue: 1, generationHorizonDays: 90, isActive: true, recurrenceType: 3, startDate: new Date() };
  recurrenceTypes: { label: string; value: number }[] = [];
  weekDays = [
    { label: 'Sunday', value: 0 },
    { label: 'Monday', value: 1 },
    { label: 'Tuesday', value: 2 },
    { label: 'Wednesday', value: 3 },
    { label: 'Thursday', value: 4 },
    { label: 'Friday', value: 5 },
    { label: 'Saturday', value: 6 }
  ];
  assets: { label: string; value: number }[] = [];
  types: { label: string; value: number }[] = [];
  checklists: { label: string; value: number }[] = [];

  constructor(
    private service: MaintenanceScheduleService,
    private assetService: AssetService,
    private typeService: MaintenanceTypeService,
    private checklistService: MaintenanceChecklistService,
    private metadata: MetadataService,
    private messages: MessageService
  ) {}

  ngOnInit() {
    this.metadata.getEnums().subscribe((res: any) => {
      const data = res?.result ?? res;
      this.recurrenceTypes = (data?.MaintenanceRecurrenceType ?? []).map((x: any) => ({ label: x.text, value: x.value }));
    });
    this.assetService.filter({ pageNumber: 1, pageSize: 500, isActive: true }).subscribe((a) => {
      const { rows } = readPagedList<Asset>(a);
      this.assets = rows.map((x) => ({ label: `${x.assetCode} — ${x.name}`, value: x.id }));
    });
    this.typeService.getAll().subscribe((t) => (this.types = t.map((x) => ({ label: x.name, value: x.id }))));
    this.checklistService.getAll().subscribe((c) => (this.checklists = c.map((x) => ({ label: x.name, value: x.id }))));
    this.load();
  }

  get isWeekly() {
    return this.editModel.recurrenceType === 2;
  }
  get isMeterHours() {
    return this.editModel.recurrenceType === 8;
  }
  get isMeterCycles() {
    return this.editModel.recurrenceType === 9;
  }

  load() {
    this.service.filter({ ...this.filter }).subscribe({
      next: (page) => {
        const { rows, total } = readPagedList<MaintenanceSchedule>(page);
        this.rows.set(rows);
        this.totalRecords = total;
      }
    });
  }

  openNew() {
    this.editModel = { intervalValue: 1, generationHorizonDays: 90, isActive: true, recurrenceType: 3, startDate: new Date() };
    this.drawerVisible = true;
  }

  openEdit(row: MaintenanceSchedule) {
    this.service.getById(row.id).subscribe((s) => {
      this.editModel = { ...s, startDate: s.startDate ? new Date(s.startDate) : new Date(), endDate: s.endDate ? new Date(s.endDate) : null };
      this.drawerVisible = true;
    });
  }

  save() {
    const payload = { ...this.editModel };
    const obs = payload.id ? this.service.update(payload) : this.service.create(payload);
    obs.subscribe({
      next: () => {
        this.drawerVisible = false;
        this.load();
        this.messages.add({ severity: 'success', summary: 'Saved' });
      },
      error: (e) => this.messages.add({ severity: 'error', summary: 'Error', detail: e?.error?.errors?.[0] || 'Save failed' })
    });
  }

  toggleActive(row: MaintenanceSchedule) {
    this.service.setActive(row.id, !row.isActive).subscribe(() => this.load());
  }

  onPage(e: { first?: number; rows?: number }) {
    this.filter.pageNumber = Math.floor((e.first ?? 0) / (e.rows ?? 10)) + 1;
    this.filter.pageSize = e.rows ?? 10;
    this.load();
  }
}
