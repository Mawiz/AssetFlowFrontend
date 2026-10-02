import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DrawerModule } from 'primeng/drawer';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService } from 'primeng/api';
import { MaintenanceChecklistService } from '../../services/maintenance-checklist-service';
import { MaintenanceTypeService } from '../../services/maintenance-type-service';
import { MaintenanceChecklist, MaintenanceChecklistItem, MaintenanceChecklistItemOption } from '../../model/maintenance';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';
import { MetadataService } from '@/services/metadata-service';
import { AuthService } from '@/services/auth-service';
import { ListFilterDto } from '../../model/list-filter';
import { readPagedList } from '../../utils/paged-list';
import { TenantDto } from '../../model/tenant';

@Component({
  selector: 'app-maintenance-checklist-component',
  standalone: true,
  templateUrl: './maintenance-checklist-component.html',
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
    CheckboxModule,
    InputNumberModule,
    TagModule,
    CardModule,
    IconFieldModule,
    InputIconModule,
    HasPermissionDirective
  ],
  providers: [MessageService]
})
export class MaintenanceChecklistComponent implements OnInit {
  Permissions = Permissions;
  readonly selectionResponseType = 5;
  rows = signal<MaintenanceChecklist[]>([]);
  totalRecords = 0;
  filter: ListFilterDto = { pageNumber: 1, pageSize: 10, searchText: '', tenantId: null };
  drawerVisible = false;
  isEditing = false;
  submitted = false;
  form!: FormGroup;
  systemAdmin = false;
  tenantsForForm: { id: number; displayName: string }[] = [];
  tenantFilterOptions: { label: string; value: number | null }[] = [{ label: 'All tenants', value: null }];
  maintenanceTypes: { label: string; value: number }[] = [];
  responseTypes: { label: string; value: number }[] = [];

  constructor(
    private service: MaintenanceChecklistService,
    private typeService: MaintenanceTypeService,
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
      this.responseTypes = (enums?.['ChecklistResponseType'] ?? []).map((x) => ({ label: x.text, value: x.value }));
    });
    if (this.systemAdmin) {
      this.loadTenants();
    }
    this.loadMaintenanceTypes(this.getFormTenantId());
    this.load();
  }

  initForm() {
    this.form = this.fb.group({
      id: [null],
      tenantId: [this.systemAdmin ? null : this.getFixedTenantId(), this.systemAdmin ? Validators.required : []],
      name: ['', Validators.required],
      code: ['', Validators.required],
      description: [''],
      maintenanceTypeId: [null],
      isActive: [true],
      items: this.fb.array([])
    });
    if (this.systemAdmin) {
      this.form.get('tenantId')?.valueChanges.subscribe((tenantId) => {
        this.form.patchValue({ maintenanceTypeId: null }, { emitEvent: false });
        this.loadMaintenanceTypes(this.normalizeTenantId(tenantId));
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

  loadMaintenanceTypes(tenantId: number | null) {
    if (this.systemAdmin && tenantId == null) {
      this.maintenanceTypes = [];
      return;
    }
    this.typeService.getAll(tenantId ?? undefined).subscribe((t) => (this.maintenanceTypes = t.map((x) => ({ label: x.name, value: x.id }))));
  }

  onTenantFilterChange() {
    this.filter.pageNumber = 1;
    this.load();
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  itemOptions(itemIndex: number): FormArray {
    return this.items.at(itemIndex).get('options') as FormArray;
  }

  isSelectionType(itemIndex: number): boolean {
    return this.items.at(itemIndex).get('responseType')?.value === this.selectionResponseType;
  }

  createOptionGroup(opt?: MaintenanceChecklistItemOption) {
    return this.fb.group({
      id: [opt?.id ?? null],
      optionText: [opt?.optionText ?? '', Validators.required],
      sortOrder: [opt?.sortOrder ?? 1],
      isActive: [opt?.isActive ?? true]
    });
  }

  createItemGroup(item?: MaintenanceChecklistItem) {
    const options = this.fb.array(
      (item?.options?.length ? item.options : []).map((o) => this.createOptionGroup(o))
    );
    return this.fb.group({
      id: [item?.id ?? null],
      itemText: [item?.itemText ?? '', Validators.required],
      description: [item?.description ?? ''],
      responseType: [item?.responseType ?? 1, Validators.required],
      isRequired: [item?.isRequired ?? true],
      sortOrder: [item?.sortOrder ?? 1],
      isActive: [item?.isActive ?? true],
      options
    });
  }

  load() {
    this.service.filter(this.filter).subscribe({
      next: (page) => {
        const { rows, total } = readPagedList<MaintenanceChecklist>(page);
        this.rows.set(rows);
        this.totalRecords = total;
      }
    });
  }

  onSearch() {
    this.filter.pageNumber = 1;
    this.load();
  }

  clearItems() {
    while (this.items.length) {
      this.items.removeAt(0);
    }
  }

  openNew() {
    this.isEditing = false;
    this.submitted = false;
    this.form.reset({ tenantId: this.systemAdmin ? null : this.getFixedTenantId(), isActive: true });
    this.clearItems();
    this.addItem();
    this.loadMaintenanceTypes(this.getFormTenantId());
    this.drawerVisible = true;
  }

  openEdit(row: MaintenanceChecklist) {
    this.isEditing = true;
    this.submitted = false;
    this.service.getById(row.id).subscribe((c) => {
      this.form.patchValue({
        id: c.id,
        tenantId: this.normalizeTenantId(c.tenantId),
        name: c.name,
        code: c.code,
        description: c.description,
        maintenanceTypeId: c.maintenanceTypeId,
        isActive: c.isActive
      });
      this.loadMaintenanceTypes(this.normalizeTenantId(c.tenantId));
      this.clearItems();
      const list = c.items?.length ? c.items : [this.emptyItem(1)];
      list.forEach((it) => this.items.push(this.createItemGroup(it)));
      this.drawerVisible = true;
    });
  }

  emptyItem(sort: number): MaintenanceChecklistItem {
    return { itemText: '', responseType: 1, isRequired: true, sortOrder: sort, isActive: true, options: [] };
  }

  addItem() {
    this.items.push(this.createItemGroup(this.emptyItem(this.items.length + 1)));
  }

  removeItem(index: number) {
    if (this.items.length <= 1) return;
    this.items.removeAt(index);
  }

  addOption(itemIndex: number) {
    const opts = this.itemOptions(itemIndex);
    opts.push(this.createOptionGroup({ optionText: '', sortOrder: opts.length + 1, isActive: true }));
  }

  removeOption(itemIndex: number, optionIndex: number) {
    this.itemOptions(itemIndex).removeAt(optionIndex);
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
      tenantId: this.systemAdmin ? this.normalizeTenantId(raw.tenantId) : this.getFixedTenantId(),
      items: raw.items.map((it: MaintenanceChecklistItem & { options?: MaintenanceChecklistItemOption[] }) => ({
        ...it,
        options: it.responseType === this.selectionResponseType ? it.options : []
      }))
    };
    const obs = payload.id ? this.service.update(payload) : this.service.create(payload);
    obs.subscribe({
      next: () => {
        this.hideDrawer();
        this.load();
        this.messages.add({ severity: 'success', summary: 'Saved', detail: 'Checklist saved successfully' });
      },
      error: (e) => this.messages.add({ severity: 'error', summary: 'Error', detail: e?.error?.errors?.[0] || 'Save failed' })
    });
  }

  onPage(event: { page?: number; rows?: number; first?: number }) {
    this.filter.pageNumber = event.page != null ? event.page + 1 : Math.floor((event.first ?? 0) / (event.rows ?? 10)) + 1;
    this.filter.pageSize = event.rows ?? 10;
    this.load();
  }
}
