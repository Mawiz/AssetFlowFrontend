import { Component, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { TagModule } from 'primeng/tag';
import { DrawerModule } from 'primeng/drawer';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ListFilterDto } from '../../model/list-filter';
import { SupplierService } from '../../services/supplier-service';
import { CreateSupplier, Supplier, UpdateSupplier } from '../../model/supplier';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';
import { AuthService } from '@/services/auth-service';
import { MetadataService } from '@/services/metadata-service';
import { TenantDto } from '../../model/tenant';

@Component({
  selector: 'app-supplier-component',
  standalone: true,
  templateUrl: './supplier-component.html',
  styleUrls: ['./supplier-component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    RippleModule,
    ToastModule,
    ConfirmDialogModule,
    DrawerModule,
    InputTextModule,
    TextareaModule,
    InputIconModule,
    IconFieldModule,
    TagModule,
    DialogModule,
    DatePickerModule,
    SelectModule,
    CheckboxModule,
    HasPermissionDirective
  ],
  providers: [MessageService, ConfirmationService]
})
export class SupplierComponent implements OnInit {
  readonly Permissions = Permissions;
  @ViewChild('dt') dt!: Table;

  suppliers = signal<Supplier[]>([]);
  selectedSuppliers!: Supplier[] | null;

  filter: ListFilterDto = {
    pageNumber: 1,
    pageSize: 10,
    searchText: '',
    isActive: null,
    startDate: null,
    endDate: null,
    tenantId: null
  };

  systemAdmin = false;
  tenantsForForm: { id: number; displayName: string }[] = [];
  tenantFilterOptions: { label: string; value: number | null }[] = [{ label: 'All tenants', value: null }];
  totalRecords = 0;
  form!: FormGroup;
  drawerVisible = false;
  submitted = false;
  isEditing = false;
  selectedId: number | null = null;
  filterDialogVisible = false;
  statusOptions = [
    { label: 'All', value: null },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  constructor(
    private fb: FormBuilder,
    private service: SupplierService,
    private authService: AuthService,
    private metadataService: MetadataService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.systemAdmin = this.authService.systemAdminPermissions();
    this.initForm();
    this.loadSuppliers();
    if (this.systemAdmin) this.loadTenants();
  }

  initForm() {
    this.form = this.fb.group({
      tenantId: [this.systemAdmin ? null : this.getFixedTenantId(), this.systemAdmin ? Validators.required : []],
      name: ['', Validators.required],
      code: ['', Validators.required],
      description: [''],
      contactName: [''],
      contactPhone: [''],
      contactEmail: [''],
      address: [''],
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
        const list = res.result?.metaResult[0]?.data || [];
        this.tenantsForForm = list.map((t: TenantDto) => ({
          id: t.id,
          displayName: (t as { displayName?: string }).displayName || t.companyName || String(t.id)
        }));
        this.tenantFilterOptions = [
          { label: 'All tenants', value: null },
          ...list.map((t: TenantDto) => ({
            label: (t as { displayName?: string }).displayName || t.companyName || String(t.id),
            value: t.id
          }))
        ];
      }
    });
  }

  loadSuppliers(resetPage = false) {
    if (resetPage) this.filter.pageNumber = 1;
    this.service.getAll(this.filter).subscribe({
      next: (res) => {
        this.suppliers.set(res || []);
        this.totalRecords = (res || []).length;
      },
      error: () =>
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load suppliers' })
    });
  }

  onSearch() {
    this.filter.pageNumber = 1;
    this.loadSuppliers();
  }

  onPage(event: any) {
    this.filter.pageNumber = event.page + 1;
    this.filter.pageSize = event.rows;
    this.loadSuppliers();
  }

  onSort(event: any) {
    this.filter.orderByProp = event.field;
    this.filter.sortDirection = event.order === 1 ? 1 : 2;
    this.loadSuppliers();
  }

  onTenantFilterChange() {
    this.filter.pageNumber = 1;
    this.loadSuppliers();
  }

  applyFilters() {
    this.filter.pageNumber = 1;
    this.loadSuppliers();
    this.filterDialogVisible = false;
  }

  clearFilters() {
    this.filter = {
      pageNumber: 1,
      pageSize: 10,
      searchText: '',
      isActive: null,
      startDate: null,
      endDate: null,
      tenantId: null
    };
    this.loadSuppliers();
    this.filterDialogVisible = false;
  }

  openNew() {
    this.form.reset({
      tenantId: this.systemAdmin ? null : this.getFixedTenantId(),
      isActive: true
    });
    this.isEditing = false;
    this.selectedId = null;
    this.submitted = false;
    this.drawerVisible = true;
  }

  editItem(item: Supplier) {
    this.isEditing = true;
    this.selectedId = item.id;
    this.drawerVisible = true;
    this.submitted = false;
    this.form.patchValue({
      tenantId: this.normalizeTenantId(item.tenantId),
      name: item.name,
      code: item.code,
      description: item.description,
      contactName: item.contactName,
      contactPhone: item.contactPhone,
      contactEmail: item.contactEmail,
      address: item.address,
      isActive: item.isActive
    });
  }

  hideDrawer() {
    this.drawerVisible = false;
    this.submitted = false;
  }

  save() {
    this.submitted = true;
    if (this.form.invalid) return;
    const raw = this.form.value;
    const payload = {
      ...raw,
      tenantId: this.systemAdmin ? this.normalizeTenantId(raw.tenantId) : this.getFixedTenantId()
    };
    if (this.isEditing && this.selectedId) {
      this.service.update({ id: this.selectedId, ...payload } as UpdateSupplier).subscribe({
        next: () => {
          this.loadSuppliers();
          this.drawerVisible = false;
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Supplier updated' });
        },
        error: (err) => this.showApiError(err, 'Failed to update supplier')
      });
    } else {
      this.service.create(payload as CreateSupplier).subscribe({
        next: () => {
          this.loadSuppliers();
          this.drawerVisible = false;
          this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Supplier created' });
        },
        error: (err) => this.showApiError(err, 'Failed to create supplier')
      });
    }
  }

  deleteItem(item: Supplier) {
    this.confirmationService.confirm({
      message: `Delete supplier "${item.name}"?`,
      accept: () => {
        this.service.delete(item.id).subscribe({
          next: () => {
            this.loadSuppliers();
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Supplier deleted' });
          },
          error: (err) => this.showApiError(err, 'Failed to delete supplier')
        });
      }
    });
  }

  private showApiError(err: any, fallback: string) {
    const detail = err?.error?.errors?.[0] || err?.error?.message || fallback;
    this.messageService.add({ severity: 'error', summary: 'Error', detail });
  }
}
