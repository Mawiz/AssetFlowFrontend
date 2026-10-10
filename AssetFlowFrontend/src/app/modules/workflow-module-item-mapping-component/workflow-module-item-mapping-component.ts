import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { DrawerModule } from 'primeng/drawer';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { WorkflowModuleItemMappingService } from '../../services/workflow-module-item-mapping-service';
import { WorkflowConfigurationService } from '../../services/workflow-configuration-service';
import { WORKFLOW_REFERENCE_ITEM_TYPES, WorkflowModuleItemMapping } from '../../model/workflow-runtime';
import { WorkflowModule } from '../../model/workflow-configuration';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';
import { readPagedList } from '../../utils/paged-list';
import { AuthService } from '@/services/auth-service';
import { MetadataService } from '@/services/metadata-service';
import { TenantDto } from '../../model/tenant';

@Component({
  selector: 'app-workflow-module-item-mapping-component',
  standalone: true,
  templateUrl: './workflow-module-item-mapping-component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    ToastModule,
    DrawerModule,
    CheckboxModule,
    SelectModule,
    HasPermissionDirective
  ],
  providers: [MessageService]
})
export class WorkflowModuleItemMappingComponent implements OnInit {
  Permissions = Permissions;
  rows = signal<WorkflowModuleItemMapping[]>([]);
  totalRecords = 0;
  filter = { pageNumber: 1, pageSize: 10, searchText: '', tenantId: null as number | null };
  drawerVisible = false;
  isEditing = false;
  form!: FormGroup;
  systemAdmin = false;
  tenantFilterOptions: { label: string; value: number | null }[] = [{ label: 'All tenants', value: null }];
  modules: WorkflowModule[] = [];
  itemTypes = WORKFLOW_REFERENCE_ITEM_TYPES;

  constructor(
    private service: WorkflowModuleItemMappingService,
    private moduleService: WorkflowConfigurationService,
    private messages: MessageService,
    private fb: FormBuilder,
    private authService: AuthService,
    private metadataService: MetadataService
  ) {}

  ngOnInit() {
    this.systemAdmin = this.authService.systemAdminPermissions();
    this.form = this.fb.group({
      moduleItemMappingId: [null],
      tenantId: [this.systemAdmin ? null : this.getFixedTenantId(), this.systemAdmin ? Validators.required : []],
      moduleId: [null, Validators.required],
      referenceItemType: [null, Validators.required],
      isActive: [true]
    });
    if (this.systemAdmin) this.loadTenants();
    this.loadModules();
    this.load();
  }

  getFixedTenantId(): number | null {
    const t = this.authService.getTenantId();
    return t == null || t === 0 ? null : t;
  }

  loadTenants() {
    this.metadataService.getMetadataValues({ secretKeys: ['Tenant'] }).subscribe({
      next: (data) => {
        const tenants = (data?.['Tenant'] as TenantDto[]) || [];
        this.tenantFilterOptions = [
          { label: 'All tenants', value: null },
          ...tenants.map((t) => ({ label: t.companyName, value: t.id }))
        ];
      }
    });
  }

  loadModules() {
    const tenantId = this.systemAdmin ? this.filter.tenantId : this.getFixedTenantId();
    this.moduleService.filterModules({ pageNumber: 1, pageSize: 500, searchText: '', tenantId }).subscribe({
      next: (r) => {
        const { rows } = readPagedList<WorkflowModule>(r);
        this.modules = rows;
      }
    });
  }

  load() {
    this.service.filter({ ...this.filter }).subscribe({
      next: (r) => {
        const { rows, total } = readPagedList<WorkflowModuleItemMapping>(r);
        this.rows.set(rows);
        this.totalRecords = total;
      },
      error: () => this.messages.add({ severity: 'error', summary: 'Error', detail: 'Failed to load mappings' })
    });
  }

  onTenantFilterChange() {
    this.loadModules();
    this.load();
  }

  openNew() {
    this.isEditing = false;
    this.form.reset({
      tenantId: this.systemAdmin ? null : this.getFixedTenantId(),
      isActive: true
    });
    this.drawerVisible = true;
  }

  edit(row: WorkflowModuleItemMapping) {
    this.isEditing = true;
    this.form.patchValue(row);
    this.drawerVisible = true;
  }

  save() {
    if (this.form.invalid) return;
    const v = { ...this.form.value };
    if (!this.systemAdmin) v.tenantId = this.getFixedTenantId();
    const req = this.isEditing
      ? this.service.update(v as WorkflowModuleItemMapping)
      : this.service.create(v);
    req.subscribe({
      next: () => {
        this.messages.add({ severity: 'success', summary: 'Saved', detail: 'Mapping saved' });
        this.drawerVisible = false;
        this.load();
      },
      error: (e) => this.messages.add({ severity: 'error', summary: 'Error', detail: e?.error?.errors?.[0] || 'Save failed' })
    });
  }

  remove(row: WorkflowModuleItemMapping) {
    if (!confirm('Delete this mapping?')) return;
    this.service.delete(row.moduleItemMappingId).subscribe({
      next: () => this.load(),
      error: (e) => this.messages.add({ severity: 'error', summary: 'Error', detail: e?.error?.errors?.[0] || 'Delete failed' })
    });
  }
}
