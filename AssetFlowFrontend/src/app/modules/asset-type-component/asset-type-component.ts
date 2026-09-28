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
import { AssetTypeFilterDto } from '../../model/asset-type';
import { AssetTypeService } from '../../services/asset-type-service';
import { AssetCategoryService } from '../../services/asset-category-service';
import {
  AssetType,
  CreateAssetType,
  UpdateAssetType
} from '../../model/asset-type';
import { AssetCategory } from '../../model/asset-category';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';
import { AuthService } from '@/services/auth-service';
import { MetadataService } from '@/services/metadata-service';
import { TenantDto } from '../../model/tenant';

@Component({
  selector: 'app-asset-type-component',
  standalone: true,
  templateUrl: './asset-type-component.html',
  styleUrls: ['./asset-type-component.scss'],
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
export class AssetTypeComponent implements OnInit {
  readonly Permissions = Permissions;
  @ViewChild('dt') dt!: Table;

  assetTypes = signal<AssetType[]>([]);
  categories: AssetCategory[] = [];
  categoriesForFilter: AssetCategory[] = [];
  selectedAssetTypes!: AssetType[] | null;

  filter: AssetTypeFilterDto = {
    pageNumber: 1,
    pageSize: 10,
    searchText: '',
    isActive: null,
    startDate: null,
    endDate: null,
    tenantId: null,
    assetCategoryId: null
  };

  systemAdmin = false;
  tenants: TenantDto[] = [];
  tenantsForForm: { id: number; displayName: string }[] = [];
  tenantFilterOptions: { label: string; value: number | null }[] = [
    { label: 'All tenants', value: null }
  ];
  categoryFilterOptions: { label: string; value: number | null }[] = [
    { label: 'All categories', value: null }
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
    private service: AssetTypeService,
    private categoryService: AssetCategoryService,
    private authService: AuthService,
    private metadataService: MetadataService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.systemAdmin = this.authService.systemAdminPermissions();
    this.initForm();
    if (this.systemAdmin) {
      this.loadTenants();
    }
    this.loadCategoriesForFilter();
    this.loadCategoriesForForm(this.getFormTenantId());
    this.loadAssetTypes();

    if (this.systemAdmin) {
      this.form.get('tenantId')?.valueChanges.subscribe((tenantId) => {
        this.loadCategoriesForForm(this.normalizeTenantId(tenantId));
        this.form.patchValue({ assetCategoryId: null }, { emitEvent: false });
      });
    }
  }

  initForm() {
    this.form = this.fb.group({
      tenantId: [
        this.systemAdmin ? null : this.getFixedTenantId(),
        this.systemAdmin ? Validators.required : []
      ],
      assetCategoryId: [null as number | null, Validators.required],
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

  private getFormTenantId(): number | null {
    if (this.systemAdmin) {
      return this.normalizeTenantId(this.form?.get('tenantId')?.value);
    }
    return this.getFixedTenantId();
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

  loadCategoriesForFilter() {
    const tenantId = this.systemAdmin
      ? this.normalizeTenantId(this.filter.tenantId)
      : this.getFixedTenantId();
    this.categoryService.getAllActive(tenantId).subscribe({
      next: (list) => {
        this.categoriesForFilter = list;
        this.categoryFilterOptions = [
          { label: 'All categories', value: null },
          ...list.map((c) => ({ label: c.name, value: c.id }))
        ];
        if (
          this.filter.assetCategoryId != null &&
          !list.some((c) => c.id === this.filter.assetCategoryId)
        ) {
          this.filter.assetCategoryId = null;
        }
      }
    });
  }

  loadCategoriesForForm(tenantId: number | null) {
    this.categoryService.getAllActive(tenantId).subscribe({
      next: (list) => {
        this.categories = list;
      }
    });
  }

  onTenantFilterChange() {
    this.filter.pageNumber = 1;
    this.loadCategoriesForFilter();
    this.loadAssetTypes();
  }

  onCategoryFilterChange() {
    this.filter.pageNumber = 1;
    this.loadAssetTypes();
  }

  onSort(event: any) {
    this.filter.orderByProp = event.field;
    this.filter.sortDirection = event.order === 1 ? 1 : 2;
    this.loadAssetTypes();
  }

  loadAssetTypes(resetPage = false) {
    if (resetPage) {
      this.filter.pageNumber = 1;
    }
    this.service.getAll(this.filter).subscribe({
      next: (res) => {
        this.assetTypes.set(res || []);
        this.totalRecords = (res || []).length;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load asset types'
        });
      }
    });
  }

  onSearch() {
    this.filter.pageNumber = 1;
    this.loadAssetTypes();
  }

  onPage(event: any) {
    this.filter.pageNumber = event.page + 1;
    this.filter.pageSize = event.rows;
    this.loadAssetTypes();
  }

  applyFilters() {
    this.filter.pageNumber = 1;
    this.loadAssetTypes();
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
      tenantId: null,
      assetCategoryId: null
    };
    this.loadCategoriesForFilter();
    this.loadAssetTypes();
    this.filterDialogVisible = false;
  }

  exportCSV() {
    this.dt?.exportCSV();
  }

  openNew() {
    this.form.reset({
      tenantId: this.systemAdmin ? null : this.getFixedTenantId(),
      assetCategoryId: null,
      isActive: true
    });
    if (this.systemAdmin) {
      this.categories = [];
    }
    this.isEditing = false;
    this.selectedId = null;
    this.submitted = false;
    this.drawerVisible = true;
  }

  editItem(item: AssetType) {
    this.isEditing = true;
    this.selectedId = item.id;
    this.drawerVisible = true;
    this.submitted = false;
    const tenantId = this.normalizeTenantId(item.tenantId);
    if (this.systemAdmin) {
      this.loadCategoriesForForm(tenantId);
    }
    this.form.patchValue(
      {
        tenantId,
        assetCategoryId: item.assetCategoryId,
        name: item.name,
        code: item.code,
        description: item.description,
        isActive: item.isActive
      },
      { emitEvent: false }
    );
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
      const dto: UpdateAssetType = { id: this.selectedId, ...payload };
      this.service.update(dto).subscribe({
        next: () => {
          this.loadAssetTypes();
          this.drawerVisible = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Updated',
            detail: 'Asset type updated successfully'
          });
        },
        error: (err) => this.showApiError(err, 'Failed to update asset type')
      });
    } else {
      const dto: CreateAssetType = payload;
      this.service.create(dto).subscribe({
        next: () => {
          this.loadAssetTypes();
          this.drawerVisible = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Created',
            detail: 'Asset type created successfully'
          });
        },
        error: (err) => this.showApiError(err, 'Failed to create asset type')
      });
    }
  }

  deleteItem(item: AssetType) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${item.name}"?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.service.delete(item.id).subscribe({
          next: () => {
            this.loadAssetTypes();
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'Asset type deleted successfully'
            });
          },
          error: (err) => this.showApiError(err, 'Failed to delete asset type')
        });
      }
    });
  }

  deleteSelected() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected asset types?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (!this.selectedAssetTypes?.length) return;
        this.selectedAssetTypes.forEach((item) => {
          this.service.delete(item.id).subscribe(() => this.loadAssetTypes());
        });
        this.selectedAssetTypes = null;
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Selected asset types deleted'
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
