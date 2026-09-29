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
import { PartCategoryService } from '../../services/part-category-service';
import {
  PartCategory,
  CreatePartCategory,
  UpdatePartCategory
} from '../../model/part-category';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';
import { AuthService } from '@/services/auth-service';
import { MetadataService } from '@/services/metadata-service';
import { TenantDto } from '../../model/tenant';

@Component({
  selector: 'app-part-category-component',
  standalone: true,
  templateUrl: './part-category-component.html',
  styleUrls: ['./part-category-component.scss'],
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
export class PartCategoryComponent implements OnInit {
  readonly Permissions = Permissions;
  @ViewChild('dt') dt!: Table;

  partCategories = signal<PartCategory[]>([]);
  selectedPartCategories!: PartCategory[] | null;

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
  tenants: TenantDto[] = [];
  tenantsForForm: { id: number; displayName: string }[] = [];
  tenantFilterOptions: { label: string; value: number | null }[] = [
    { label: 'All tenants', value: null }
  ];

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
    private service: PartCategoryService,
    private authService: AuthService,
    private metadataService: MetadataService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.systemAdmin = this.authService.systemAdminPermissions();
    this.initForm();
    this.loadPartCategories();
    if (this.systemAdmin) {
      this.loadTenants();
    }
  }

  initForm() {
    this.form = this.fb.group({
      tenantId: [
        this.systemAdmin ? null : this.getFixedTenantId(),
        this.systemAdmin ? Validators.required : []
      ],
      name: ['', Validators.required],
      code: ['', Validators.required],
      description: [''],
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
        this.tenants = res.result?.metaResult[0]?.data || [];
        this.tenantsForForm = this.tenants.map((t: TenantDto) => ({
          id: t.id,
          displayName:
            (t as { displayName?: string }).displayName ||
            t.companyName ||
            String(t.id)
        }));
        this.tenantFilterOptions = [
          { label: 'All tenants', value: null },
          ...this.tenants.map((t) => ({
            label:
              (t as { displayName?: string }).displayName ||
              t.companyName ||
              String(t.id),
            value: t.id
          }))
        ];
      }
    });
  }

  onTenantFilterChange() {
    this.filter.pageNumber = 1;
    this.loadPartCategories();
  }

  onSort(event: any) {
    this.filter.orderByProp = event.field;
    this.filter.sortDirection = event.order === 1 ? 1 : 2;
    this.loadPartCategories();
  }

  loadPartCategories(resetPage = false) {
    if (resetPage) {
      this.filter.pageNumber = 1;
    }
    this.service.getAll(this.filter).subscribe({
      next: (res) => {
        this.partCategories.set(res || []);
        this.totalRecords = (res || []).length;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load part categories'
        });
      }
    });
  }

  onSearch() {
    this.filter.pageNumber = 1;
    this.loadPartCategories();
  }

  onPage(event: any) {
    this.filter.pageNumber = event.page + 1;
    this.filter.pageSize = event.rows;
    this.loadPartCategories();
  }

  applyFilters() {
    this.filter.pageNumber = 1;
    this.loadPartCategories();
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
    this.loadPartCategories();
    this.filterDialogVisible = false;
  }

  exportCSV() {
    this.dt?.exportCSV();
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

  editItem(item: PartCategory) {
    this.isEditing = true;
    this.selectedId = item.id;
    this.drawerVisible = true;
    this.submitted = false;
    this.form.patchValue({
      tenantId: this.normalizeTenantId(item.tenantId),
      name: item.name,
      code: item.code,
      description: item.description,
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
      tenantId: this.systemAdmin
        ? this.normalizeTenantId(raw.tenantId)
        : this.getFixedTenantId()
    };

    if (this.isEditing && this.selectedId) {
      const dto: UpdatePartCategory = { id: this.selectedId, ...payload };
      this.service.update(dto).subscribe({
        next: () => {
          this.loadPartCategories();
          this.drawerVisible = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Updated',
            detail: 'Part category updated successfully'
          });
        },
        error: (err) => this.showApiError(err, 'Failed to update part category')
      });
    } else {
      const dto: CreatePartCategory = payload;
      this.service.create(dto).subscribe({
        next: () => {
          this.loadPartCategories();
          this.drawerVisible = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Created',
            detail: 'Part category created successfully'
          });
        },
        error: (err) => this.showApiError(err, 'Failed to create part category')
      });
    }
  }

  deleteItem(item: PartCategory) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${item.name}"?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.service.delete(item.id).subscribe({
          next: () => {
            this.loadPartCategories();
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'Part category deleted successfully'
            });
          },
          error: (err) => this.showApiError(err, 'Failed to delete part category')
        });
      }
    });
  }

  deleteSelected() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected part categories?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (!this.selectedPartCategories?.length) return;
        this.selectedPartCategories.forEach((item) => {
          this.service.delete(item.id).subscribe(() => this.loadPartCategories());
        });
        this.selectedPartCategories = null;
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Selected part categories deleted'
        });
      }
    });
  }

  private showApiError(err: any, fallback: string) {
    const detail =
      err?.error?.errors?.[0] ||
      err?.error?.message ||
      fallback;
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail
    });
  }
}
