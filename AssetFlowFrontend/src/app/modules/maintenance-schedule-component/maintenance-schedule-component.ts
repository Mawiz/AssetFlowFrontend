import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService } from 'primeng/api';
import { MaintenanceScheduleService } from '../../services/maintenance-schedule-service';
import { MaintenanceTypeService } from '../../services/maintenance-type-service';
import { MaintenanceChecklistService } from '../../services/maintenance-checklist-service';
import { AssetService } from '../../services/asset-service';
import { MaintenanceSchedule } from '../../model/maintenance';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';
import { MetadataService } from '@/services/metadata-service';
import { AuthService } from '@/services/auth-service';
import { ListFilterDto } from '../../model/list-filter';
import { readPagedList } from '../../utils/paged-list';
import { Asset } from '../../model/asset';
import { TenantDto } from '../../model/tenant';

@Component({
  selector: 'app-maintenance-schedule-component',
  standalone: true,
  templateUrl: './maintenance-schedule-component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    TagModule,
    IconFieldModule,
    InputIconModule,
    HasPermissionDirective
  ],
  providers: [MessageService]
})
export class MaintenanceScheduleComponent implements OnInit {
  Permissions = Permissions;
  rows = signal<MaintenanceSchedule[]>([]);
  totalRecords = 0;
  filter: ListFilterDto = { pageNumber: 1, pageSize: 10, searchText: '', tenantId: null };
  drawerVisible = false;
  isEditing = false;
  submitted = false;
  form!: FormGroup;
  systemAdmin = false;
  tenantsForForm: { id: number; displayName: string }[] = [];
  tenantFilterOptions: { label: string; value: number | null }[] = [{ label: 'All tenants', value: null }];
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
    private authService: AuthService,
    private messages: MessageService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.systemAdmin = this.authService.systemAdminPermissions();
    this.initForm();
    this.metadata.getEnums().subscribe((res: unknown) => {
      const data = (res as { result?: unknown })?.result ?? res;
      const enums = data as Record<string, { text: string; value: number }[]>;
      this.recurrenceTypes = (enums?.['MaintenanceRecurrenceType'] ?? []).map((x) => ({ label: x.text, value: x.value }));
    });
    if (this.systemAdmin) {
      this.loadTenants();
    }
    this.loadDependents(this.getFormTenantId());
    this.load();
  }

  initForm() {
    this.form = this.fb.group({
      id: [null],
      tenantId: [this.systemAdmin ? null : this.getFixedTenantId(), this.systemAdmin ? Validators.required : []],
      assetId: [null, Validators.required],
      name: ['', Validators.required],
      maintenanceTypeId: [null, Validators.required],
      maintenanceChecklistId: [null],
      recurrenceType: [3, Validators.required],
      intervalValue: [1, [Validators.required, Validators.min(1)]],
      dayOfWeek: [null],
      startDate: [new Date(), Validators.required],
      endDate: [null],
      nextDueOperatingHours: [null],
      nextDueCycles: [null],
      description: [''],
      isActive: [true],
      generationHorizonDays: [90]
    });
    if (this.systemAdmin) {
      this.form.get('tenantId')?.valueChanges.subscribe((tenantId) => {
        this.form.patchValue({ assetId: null, maintenanceTypeId: null, maintenanceChecklistId: null }, { emitEvent: false });
        this.loadDependents(this.normalizeTenantId(tenantId));
      });
    }
  }

  private getFixedTenantId(): number | null {
    const t = this.authService.getTenantId();
    return t == null || t === 0 ? null : t;
  }

  private normalizeTenantId(tenantId: number | null | undefined): number | null {
    return tenantId == null || tenantId === 0 ? null : tenantId;
  }

  getFormTenantId(): number | null {
    if (!this.systemAdmin) return this.getFixedTenantId();
    return this.normalizeTenantId(this.form?.get('tenantId')?.value);
  }

  loadTenants() {
    this.metadata.getMetadataValues({ secretKeys: ['Tenant'] }).subscribe({
      next: (res) => {
        const tenants = res.result?.metaResult[0]?.data || [];
        this.tenantsForForm = tenants.map((t: TenantDto) => ({
          id: t.id,
          displayName: (t as { displayName?: string }).displayName || t.companyName || String(t.id)
        }));
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

  loadDependents(tenantId: number | null) {
    if (this.systemAdmin && tenantId == null) {
      this.assets = [];
      this.types = [];
      this.checklists = [];
      return;
    }
    const tid = tenantId ?? undefined;
    this.assetService.filter({ pageNumber: 1, pageSize: 500, isActive: true, tenantId: tid ?? null }).subscribe((a) => {
      const { rows } = readPagedList<Asset>(a);
      this.assets = rows.map((x) => ({ label: `${x.assetCode} — ${x.name}`, value: x.id }));
    });
    this.typeService.getAll(tid).subscribe((t) => (this.types = t.map((x) => ({ label: x.name, value: x.id }))));
    this.checklistService.getAll(tid).subscribe((c) => (this.checklists = c.map((x) => ({ label: x.name, value: x.id }))));
  }

  onTenantFilterChange() {
    this.filter.pageNumber = 1;
    this.load();
  }

  get recurrenceType(): number {
    return this.form.get('recurrenceType')?.value;
  }

  get isWeekly(): boolean {
    return this.recurrenceType === 2;
  }

  get isMeterHours(): boolean {
    return this.recurrenceType === 8;
  }

  get isMeterCycles(): boolean {
    return this.recurrenceType === 9;
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

  onSearch() {
    this.filter.pageNumber = 1;
    this.load();
  }

  openNew() {
    this.isEditing = false;
    this.submitted = false;
    this.form.reset({
      tenantId: this.systemAdmin ? null : this.getFixedTenantId(),
      intervalValue: 1,
      generationHorizonDays: 90,
      isActive: true,
      recurrenceType: 3,
      startDate: new Date()
    });
    this.loadDependents(this.getFormTenantId());
    this.drawerVisible = true;
  }

  editItem(row: MaintenanceSchedule) {
    this.isEditing = true;
    this.submitted = false;
    this.service.getById(row.id).subscribe((s) => {
      const tenantId = this.normalizeTenantId(s.tenantId);
      this.loadDependents(tenantId);
      this.form.patchValue({
        ...s,
        tenantId,
        startDate: s.startDate ? new Date(s.startDate) : new Date(),
        endDate: s.endDate ? new Date(s.endDate) : null
      });
      this.drawerVisible = true;
    });
  }

  hideDrawer() {
    this.drawerVisible = false;
    this.submitted = false;
  }

  save() {
    this.submitted = true;
    if (this.isWeekly && this.form.get('dayOfWeek')?.value == null) {
      this.messages.add({ severity: 'warn', summary: 'Validation', detail: 'Weekday is required for weekly schedules.' });
      return;
    }
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const payload = {
      ...raw,
      tenantId: this.systemAdmin ? this.normalizeTenantId(raw.tenantId) : this.getFixedTenantId()
    };
    const obs = payload.id ? this.service.update(payload) : this.service.create(payload);
    obs.subscribe({
      next: () => {
        this.hideDrawer();
        this.load();
        this.messages.add({ severity: 'success', summary: 'Saved', detail: 'Maintenance schedule saved successfully' });
      },
      error: (e) => this.messages.add({ severity: 'error', summary: 'Error', detail: e?.error?.errors?.[0] || 'Save failed' })
    });
  }

  toggleActive(row: MaintenanceSchedule) {
    this.service.setActive(row.id, !row.isActive).subscribe(() => this.load());
  }

  onPage(event: { page?: number; rows?: number; first?: number }) {
    this.filter.pageNumber = event.page != null ? event.page + 1 : Math.floor((event.first ?? 0) / (event.rows ?? 10)) + 1;
    this.filter.pageSize = event.rows ?? 10;
    this.load();
  }
}
