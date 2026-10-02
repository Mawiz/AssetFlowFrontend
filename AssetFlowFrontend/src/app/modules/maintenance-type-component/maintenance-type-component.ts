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
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService } from 'primeng/api';
import { MaintenanceTypeService } from '../../services/maintenance-type-service';
import { MaintenanceType } from '../../model/maintenance';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';
import { ListFilterDto } from '../../model/list-filter';
import { readPagedList } from '../../utils/paged-list';
import { AuthService } from '@/services/auth-service';
import { MetadataService } from '@/services/metadata-service';
import { TenantDto } from '../../model/tenant';

@Component({
  selector: 'app-maintenance-type-component',
  standalone: true,
  templateUrl: './maintenance-type-component.html',
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
    InputNumberModule,
    CheckboxModule,
    TagModule,
    SelectModule,
    IconFieldModule,
    InputIconModule,
    HasPermissionDirective
  ],
  providers: [MessageService]
})
export class MaintenanceTypeComponent implements OnInit {
  Permissions = Permissions;
  rows = signal<MaintenanceType[]>([]);
  totalRecords = 0;
  filter: ListFilterDto = { pageNumber: 1, pageSize: 10, searchText: '', tenantId: null };
  drawerVisible = false;
  isEditing = false;
  submitted = false;
  form!: FormGroup;
  systemAdmin = false;
  tenantsForForm: { id: number; displayName: string }[] = [];
  tenantFilterOptions: { label: string; value: number | null }[] = [{ label: 'All tenants', value: null }];

  constructor(
    private service: MaintenanceTypeService,
    private messages: MessageService,
    private fb: FormBuilder,
    private authService: AuthService,
    private metadataService: MetadataService
  ) {}

  ngOnInit() {
    this.systemAdmin = this.authService.systemAdminPermissions();
    this.initForm();
    if (this.systemAdmin) {
      this.loadTenants();
    }
    this.load();
  }

  initForm() {
    this.form = this.fb.group({
      id: [null],
      tenantId: [this.systemAdmin ? null : this.getFixedTenantId(), this.systemAdmin ? Validators.required : []],
      name: ['', Validators.required],
      code: ['', Validators.required],
      description: [''],
      sortOrder: [0],
      isActive: [true]
    });
  }

  private getFixedTenantId(): number | null {
    const t = this.authService.getTenantId();
    return t == null || t === 0 ? null : t;
  }

  private normalizeTenantId(tenantId: number | null | undefined): number | null {
    return tenantId == null || tenantId === 0 ? null : tenantId;
  }

  loadTenants() {
    this.metadataService.getMetadataValues({ secretKeys: ['Tenant'] }).subscribe({
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

  onTenantFilterChange() {
    this.filter.pageNumber = 1;
    this.load();
  }

  load() {
    this.service.filter(this.filter).subscribe({
      next: (page) => {
        const { rows, total } = readPagedList<MaintenanceType>(page);
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

  openNew() {
    this.isEditing = false;
    this.submitted = false;
    this.form.reset({
      tenantId: this.systemAdmin ? null : this.getFixedTenantId(),
      sortOrder: 0,
      isActive: true
    });
    this.drawerVisible = true;
  }

  editItem(row: MaintenanceType) {
    this.isEditing = true;
    this.submitted = false;
    this.form.patchValue({
      ...row,
      tenantId: this.normalizeTenantId(row.tenantId)
    });
    this.drawerVisible = true;
  }

  hideDrawer() {
    this.drawerVisible = false;
    this.submitted = false;
  }

  save() {
    this.submitted = true;
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
        this.messages.add({ severity: 'success', summary: 'Saved', detail: 'Maintenance type saved successfully' });
      },
      error: (e) =>
        this.messages.add({ severity: 'error', summary: 'Error', detail: e?.error?.errors?.[0] || 'Save failed' })
    });
  }

  onPage(event: { page?: number; rows?: number; first?: number }) {
    this.filter.pageNumber = event.page != null ? event.page + 1 : Math.floor((event.first ?? 0) / (event.rows ?? 10)) + 1;
    this.filter.pageSize = event.rows ?? 10;
    this.load();
  }
}
