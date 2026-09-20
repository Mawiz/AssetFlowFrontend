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
import { LocationFilterDto } from '../../model/location';
import { LocationService } from '../../services/location-service';
import { LocationTypeService } from '../../services/location-type-service';
import {
  Location,
  CreateLocation,
  UpdateLocation
} from '../../model/location';
import { LocationType } from '../../model/location-type';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';
import { AuthService } from '@/services/auth-service';
import { MetadataService } from '@/services/metadata-service';
import { TenantDto } from '../../model/tenant';

@Component({
  selector: 'app-location-component',
  standalone: true,
  templateUrl: './location-component.html',
  styleUrls: ['./location-component.scss'],
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
export class LocationComponent implements OnInit {
  readonly Permissions = Permissions;
  @ViewChild('dt') dt!: Table;

  locations = signal<Location[]>([]);
  locationTypes: LocationType[] = [];
  locationTypesForFilter: LocationType[] = [];
  parentLocationOptions: Location[] = [];
  systemAdmin = false;
  tenants: TenantDto[] = [];
  tenantsForForm: { id: number; displayName: string }[] = [];
  tenantFilterOptions: { label: string; value: number | null }[] = [
    { label: 'All tenants', value: null }
  ];
  locationTypeFilterOptions: { label: string; value: number | null }[] = [
    { label: 'All location types', value: null }
  ];
  parentLocationRequired = false;
  parentLocationTypeName = '';

  selectedLocations!: Location[] | null;

  filter: LocationFilterDto = {
    pageNumber: 1,
    pageSize: 10,
    searchText: '',
    isActive: null,
    startDate: null,
    endDate: null,
    locationTypeId: null,
    tenantId: null
  };

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
    private service: LocationService,
    private locationTypeService: LocationTypeService,
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
    this.loadLocationTypesForFilter();
    this.loadLocationTypesForForm(this.getFormTenantId());
    this.loadLocations();

    this.form.get('locationTypeId')?.valueChanges.subscribe((typeId) => {
      this.onLocationTypeChanged(typeId);
    });

    if (this.systemAdmin) {
      this.form.get('tenantId')?.valueChanges.subscribe((tenantId) => {
        this.loadLocationTypesForForm(this.normalizeTenantId(tenantId));
        this.form.patchValue(
          { locationTypeId: null, parentLocationId: null },
          { emitEvent: false }
        );
        this.parentLocationRequired = false;
        this.parentLocationOptions = [];
      });
    }
  }

  initForm() {
    this.form = this.fb.group({
      tenantId: [
        this.systemAdmin ? null : this.getFixedTenantId(),
        this.systemAdmin ? Validators.required : []
      ],
      locationTypeId: [null as number | null, Validators.required],
      parentLocationId: [null as number | null],
      name: ['', Validators.required],
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

  loadLocationTypesForFilter() {
    const tenantId = this.systemAdmin
      ? this.normalizeTenantId(this.filter.tenantId)
      : this.getFixedTenantId();
    this.locationTypeService.getAllActive(tenantId).subscribe({
      next: (list) => {
        this.locationTypesForFilter = list.filter((t) => t.isActive);
        this.locationTypeFilterOptions = [
          { label: 'All location types', value: null },
          ...this.locationTypesForFilter.map((t) => ({
            label: t.name,
            value: t.id
          }))
        ];
        if (
          this.filter.locationTypeId != null &&
          !this.locationTypesForFilter.some((t) => t.id === this.filter.locationTypeId)
        ) {
          this.filter.locationTypeId = null;
        }
      }
    });
  }

  loadLocationTypesForForm(tenantId: number | null) {
    this.locationTypeService.getAllActive(tenantId).subscribe({
      next: (list) => {
        this.locationTypes = list.filter((t) => t.isActive);
      }
    });
  }

  onTenantFilterChange() {
    this.filter.pageNumber = 1;
    this.loadLocationTypesForFilter();
    this.loadLocations();
  }

  onLocationTypeFilterChange() {
    this.filter.pageNumber = 1;
    this.loadLocations();
  }

  onLocationTypeChanged(typeId: number | null, keepParent = false) {
    const parentControl = this.form.get('parentLocationId');
    if (!typeId) {
      this.parentLocationRequired = false;
      this.parentLocationTypeName = '';
      this.parentLocationOptions = [];
      parentControl?.clearValidators();
      parentControl?.setValue(null);
      parentControl?.updateValueAndValidity();
      return;
    }

    const selectedType = this.locationTypes.find((t) => t.id === typeId);
    if (!selectedType?.parentLocationTypeId) {
      this.parentLocationRequired = false;
      this.parentLocationTypeName = '';
      this.parentLocationOptions = [];
      parentControl?.clearValidators();
      if (!keepParent) {
        parentControl?.setValue(null);
      }
      parentControl?.updateValueAndValidity();
      return;
    }

    const parentType = this.locationTypes.find(
      (t) => t.id === selectedType.parentLocationTypeId
    );
    this.parentLocationRequired = true;
    this.parentLocationTypeName = parentType?.name ?? 'Parent Location';

    parentControl?.setValidators(Validators.required);
    parentControl?.updateValueAndValidity();

    this.service
      .getByLocationType(
        selectedType.parentLocationTypeId,
        this.getFormTenantId()
      )
      .subscribe({
      next: (list) => {
        let options = list;
        if (this.isEditing && this.selectedId) {
          options = options.filter((l) => l.id !== this.selectedId);
        }
        this.parentLocationOptions = options;
        if (
          !keepParent ||
          !options.some((l) => l.id === parentControl?.value)
        ) {
          parentControl?.setValue(null);
        }
      },
      error: () => {
        this.parentLocationOptions = [];
        parentControl?.setValue(null);
      }
    });
  }

  onSort(event: any) {
    this.filter.orderByProp = event.field;
    this.filter.sortDirection = event.order === 1 ? 1 : 2;
    this.loadLocations();
  }

  loadLocations(resetPage = false) {
    if (resetPage) {
      this.filter.pageNumber = 1;
    }

    this.service.getAll(this.filter).subscribe({
      next: (res) => {
        this.locations.set(res || []);
        this.totalRecords = (res || []).length;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load locations'
        });
      }
    });
  }

  onSearch() {
    this.filter.pageNumber = 1;
    this.loadLocations();
  }

  onPage(event: any) {
    this.filter.pageNumber = event.page + 1;
    this.filter.pageSize = event.rows;
    this.loadLocations();
  }

  applyFilters() {
    this.filter.pageNumber = 1;
    this.loadLocations();
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
      locationTypeId: null,
      tenantId: null
    };
    this.loadLocationTypesForFilter();
    this.loadLocations();
    this.filterDialogVisible = false;
  }

  exportCSV() {
    this.dt?.exportCSV();
  }

  openNew() {
    this.form.reset({
      tenantId: this.systemAdmin ? null : this.getFixedTenantId(),
      locationTypeId: null,
      parentLocationId: null,
      isActive: true
    });
    if (this.systemAdmin) {
      this.locationTypes = [];
    }
    this.isEditing = false;
    this.selectedId = null;
    this.submitted = false;
    this.parentLocationRequired = false;
    this.parentLocationOptions = [];
    this.drawerVisible = true;
  }

  editItem(item: Location) {
    this.isEditing = true;
    this.selectedId = item.id;
    this.drawerVisible = true;
    this.submitted = false;

    const tenantId = this.normalizeTenantId(item.tenantId);
    if (this.systemAdmin) {
      this.loadLocationTypesForForm(tenantId);
    }
    this.form.patchValue(
      {
        tenantId,
        locationTypeId: item.locationTypeId,
        parentLocationId: item.parentLocationId ?? null,
        name: item.name,
        description: item.description,
        isActive: item.isActive
      },
      { emitEvent: false }
    );

    this.onLocationTypeChanged(item.locationTypeId, true);
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
      parentLocationId: this.parentLocationRequired
        ? raw.parentLocationId
        : null
    };

    if (this.isEditing && this.selectedId) {
      const dto: UpdateLocation = { id: this.selectedId, ...payload };
      this.service.update(dto).subscribe({
        next: () => {
          this.loadLocations();
          this.drawerVisible = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Updated',
            detail: 'Location updated successfully'
          });
        },
        error: (err) => this.showApiError(err, 'Failed to update location')
      });
    } else {
      const dto: CreateLocation = payload;
      this.service.create(dto).subscribe({
        next: () => {
          this.loadLocations();
          this.drawerVisible = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Created',
            detail: 'Location created successfully'
          });
        },
        error: (err) => this.showApiError(err, 'Failed to create location')
      });
    }
  }

  deleteItem(item: Location) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${item.name}"?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.service.delete(item.id).subscribe({
          next: () => {
            this.loadLocations();
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'Location deleted successfully'
            });
          },
          error: (err) => this.showApiError(err, 'Failed to delete location')
        });
      }
    });
  }

  deleteSelected() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected locations?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (!this.selectedLocations?.length) return;
        this.selectedLocations.forEach((item) => {
          this.service.delete(item.id).subscribe(() => this.loadLocations());
        });
        this.selectedLocations = null;
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Selected locations deleted'
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
