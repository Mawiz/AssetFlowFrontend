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
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ListFilterDto } from '../../model/list-filter';
import { LocationTypeService } from '../../services/location-type-service';
import {
  LocationType,
  CreateLocationType,
  UpdateLocationType
} from '../../model/location-type';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';
import { AuthService } from '@/services/auth-service';
import { MetadataService } from '@/services/metadata-service';
import { TenantDto } from '../../model/tenant';

@Component({
  selector: 'app-location-type-component',
  standalone: true,
  templateUrl: './location-type-component.html',
  styleUrls: ['./location-type-component.scss'],
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
    InputNumberModule,
    CheckboxModule,
    HasPermissionDirective
  ],
  providers: [MessageService, ConfirmationService]
})
export class LocationTypeComponent implements OnInit {
  readonly Permissions = Permissions;
  @ViewChild('dt') dt!: Table;

  locationTypes = signal<LocationType[]>([]);
  parentTypeOptions: LocationType[] = [];
  selectedLocationTypes!: LocationType[] | null;

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
    private service: LocationTypeService,
    private authService: AuthService,
    private metadataService: MetadataService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.systemAdmin = this.authService.systemAdminPermissions();
    this.initForm();
    this.loadLocationTypes();
    if (this.systemAdmin) {
      this.loadTenants();
    } else {
      this.loadParentTypeOptions(this.getFixedTenantId());
    }
  }

  initForm() {
    this.form = this.fb.group({
      tenantId: [
        this.systemAdmin ? null : this.getFixedTenantId(),
        this.systemAdmin ? Validators.required : []
      ],
      name: ['', Validators.required],
      parentLocationTypeId: [null as number | null],
      description: [''],
      sortOrder: [0],
      isActive: [true]
    });

    if (this.systemAdmin) {
      this.form.get('tenantId')?.valueChanges.subscribe((tenantId) => {
        this.loadParentTypeOptions(tenantId);
        this.form.patchValue({ parentLocationTypeId: null }, { emitEvent: false });
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

  loadParentTypeOptions(tenantId?: number | null) {
    const id = this.systemAdmin
      ? this.normalizeTenantId(tenantId)
      : this.getFixedTenantId();
    this.service.getAllActive(id).subscribe({
      next: (list) => {
        this.parentTypeOptions = list.filter((t) => t.isActive);
      }
    });
  }

  onTenantFilterChange() {
    this.filter.pageNumber = 1;
    this.loadLocationTypes();
  }

  parentTypeOptionsForForm(): LocationType[] {
    if (!this.isEditing || !this.selectedId) {
      return this.parentTypeOptions;
    }
    return this.parentTypeOptions.filter((t) => t.id !== this.selectedId);
  }

  onSort(event: any) {
    this.filter.orderByProp = event.field;
    this.filter.sortDirection = event.order === 1 ? 1 : 2;
    this.loadLocationTypes();
  }

  loadLocationTypes(resetPage = false) {
    if (resetPage) {
      this.filter.pageNumber = 1;
    }

    this.service.getAll(this.filter).subscribe({
      next: (res) => {
        this.locationTypes.set(res || []);
        this.totalRecords = (res || []).length;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load location types'
        });
      }
    });
  }

  onSearch() {
    this.filter.pageNumber = 1;
    this.loadLocationTypes();
  }

  onPage(event: any) {
    this.filter.pageNumber = event.page + 1;
    this.filter.pageSize = event.rows;
    this.loadLocationTypes();
  }

  applyFilters() {
    this.filter.pageNumber = 1;
    this.loadLocationTypes();
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
    this.loadLocationTypes();
    this.filterDialogVisible = false;
  }

  exportCSV() {
    this.dt?.exportCSV();
  }

  openNew() {
    this.form.reset({
      tenantId: this.systemAdmin ? null : this.getFixedTenantId(),
      parentLocationTypeId: null,
      sortOrder: 0,
      isActive: true
    });
    this.isEditing = false;
    this.selectedId = null;
    this.submitted = false;
    if (this.systemAdmin) {
      this.parentTypeOptions = [];
    }
    this.drawerVisible = true;
  }

  editItem(item: LocationType) {
    this.isEditing = true;
    this.selectedId = item.id;
    this.drawerVisible = true;
    this.submitted = false;
    const tenantId = this.normalizeTenantId(item.tenantId);
    if (this.systemAdmin) {
      this.loadParentTypeOptions(tenantId);
    }
    this.form.patchValue({
      tenantId,
      name: item.name,
      parentLocationTypeId: item.parentLocationTypeId ?? null,
      description: item.description,
      sortOrder: item.sortOrder,
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
        : this.getFixedTenantId(),
      parentLocationTypeId: raw.parentLocationTypeId ?? null
    };

    if (this.isEditing && this.selectedId) {
      const dto: UpdateLocationType = { id: this.selectedId, ...payload };
      this.service.update(dto).subscribe({
        next: () => {
          this.loadLocationTypes();
          this.loadParentTypeOptions();
          this.drawerVisible = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Updated',
            detail: 'Location type updated successfully'
          });
        },
        error: (err) => this.showApiError(err, 'Failed to update location type')
      });
    } else {
      const dto: CreateLocationType = payload;
      this.service.create(dto).subscribe({
        next: () => {
          this.loadLocationTypes();
          this.loadParentTypeOptions();
          this.drawerVisible = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Created',
            detail: 'Location type created successfully'
          });
        },
        error: (err) => this.showApiError(err, 'Failed to create location type')
      });
    }
  }

  deleteItem(item: LocationType) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${item.name}"?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.service.delete(item.id).subscribe({
          next: () => {
            this.loadLocationTypes();
            this.loadParentTypeOptions();
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'Location type deleted successfully'
            });
          },
          error: (err) => this.showApiError(err, 'Failed to delete location type')
        });
      }
    });
  }

  deleteSelected() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected location types?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (!this.selectedLocationTypes?.length) return;
        this.selectedLocationTypes.forEach((item) => {
          this.service.delete(item.id).subscribe(() => this.loadLocationTypes());
        });
        this.selectedLocationTypes = null;
        this.loadParentTypeOptions();
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Selected location types deleted'
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
