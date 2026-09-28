import { Component, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Asset, AssetFilterDto } from '../../model/asset';
import { AssetService } from '../../services/asset-service';
import { AssetCategoryService } from '../../services/asset-category-service';
import { AssetTypeService } from '../../services/asset-type-service';
import { LocationService } from '../../services/location-service';
import { MetadataService } from '../../services/metadata-service';
import { AssetCategory } from '../../model/asset-category';
import { AssetType } from '../../model/asset-type';
import { Location } from '../../model/location';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';
import { AuthService } from '@/services/auth-service';
import { TenantDto } from '../../model/tenant';

@Component({
  selector: 'app-assets-component',
  standalone: true,
  templateUrl: './assets-component.html',
  styleUrls: ['./assets-component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    ToastModule,
    ConfirmDialogModule,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    TagModule,
    SelectModule,
    DialogModule,
    HasPermissionDirective
  ],
  providers: [MessageService, ConfirmationService]
})
export class AssetsComponent implements OnInit {
  readonly Permissions = Permissions;
  @ViewChild('dt') dt!: Table;

  assets = signal<Asset[]>([]);
  totalRecords = 0;
  systemAdmin = false;
  tenants: TenantDto[] = [];
  tenantFilterOptions: { label: string; value: number | null }[] = [
    { label: 'All tenants', value: null }
  ];
  categories: AssetCategory[] = [];
  types: AssetType[] = [];
  typesForFilter: AssetType[] = [];
  locations: Location[] = [];
  statusOptions: { label: string; value: number | null }[] = [{ label: 'All', value: null }];
  criticalityOptions: { label: string; value: number | null }[] = [{ label: 'All', value: null }];
  users: { id: number; displayName: string }[] = [];
  filterDialogVisible = false;
  statusLabelMap = new Map<number, string>();
  criticalityLabelMap = new Map<number, string>();

  filter: AssetFilterDto = {
    pageNumber: 1,
    pageSize: 10,
    searchText: '',
    isActive: null,
    tenantId: null,
    assetCategoryId: null,
    assetTypeId: null,
    locationId: null,
    status: null,
    criticality: null,
    responsibleUserId: null
  };

  constructor(
    private service: AssetService,
    private categoryService: AssetCategoryService,
    private typeService: AssetTypeService,
    private locationService: LocationService,
    private metadataService: MetadataService,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.systemAdmin = this.authService.systemAdminPermissions();
    this.loadEnums();
    if (this.systemAdmin) {
      this.loadTenants();
    }
    this.loadCategories();
    this.loadLocations();
    this.loadUsers();
    this.loadAssets();
  }

  loadEnums() {
    this.metadataService.getEnums().subscribe({
      next: (res) => {
        const data = res?.result ?? res;
        const statuses = data?.AssetStatus ?? [];
        const crit = data?.AssetCriticality ?? [];
        this.statusOptions = [
          { label: 'All', value: null },
          ...statuses.map((x: any) => {
            this.statusLabelMap.set(x.value, x.text);
            return { label: x.text, value: x.value };
          })
        ];
        this.criticalityOptions = [
          { label: 'All', value: null },
          ...crit.map((x: any) => {
            this.criticalityLabelMap.set(x.value, x.text);
            return { label: x.text, value: x.value };
          })
        ];
      }
    });
  }

  loadTenants() {
    this.metadataService.getMetadataValues({ secretKeys: ['Tenant'] }).subscribe({
      next: (res) => {
        const list = res?.result?.metaResult?.[0]?.data ?? [];
        this.tenants = list;
        this.tenantFilterOptions = [
          { label: 'All tenants', value: null },
          ...list.map((t: any) => ({ label: t.displayName ?? t.name, value: t.id }))
        ];
      }
    });
  }

  loadCategories() {
    const tenantId = this.systemAdmin ? this.filter.tenantId : this.authService.getTenantId();
    this.categoryService.getAllActive(tenantId).subscribe({
      next: (data) => (this.categories = data.filter((c) => c.isActive))
    });
  }

  loadTypesForFilter(categoryId: number | null | undefined) {
    if (!categoryId) {
      this.typesForFilter = [];
      return;
    }
    this.typeService.getAll({ pageNumber: 1, pageSize: 500, assetCategoryId: categoryId, isActive: true }).subscribe({
      next: (data) => (this.typesForFilter = data)
    });
  }

  loadLocations() {
    this.locationService.getAll({ pageNumber: 1, pageSize: 500, isActive: true, tenantId: this.filter.tenantId }).subscribe({
      next: (data) => (this.locations = data.filter((l) => l.isActive))
    });
  }

  loadUsers() {
    const tenantId = this.systemAdmin ? this.filter.tenantId : this.authService.getTenantId();
    this.metadataService.getMetadataValues({ secretKeys: ['ApplicationUser'], tenantId }).subscribe({
      next: (res) => {
        const list = res?.result?.metaResult?.[0]?.data ?? [];
        this.users = list.map((u: any) => ({ id: u.id, displayName: u.displayName ?? u.name }));
      }
    });
  }

  loadAssets() {
    this.service.filter(this.filter).subscribe({
      next: (data) => {
        this.assets.set(data);
        this.totalRecords = data.length < this.filter.pageSize
          ? (this.filter.pageNumber - 1) * this.filter.pageSize + data.length
          : this.filter.pageNumber * this.filter.pageSize + 1;
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load assets' })
    });
  }

  onPage(event: any) {
    this.filter.pageNumber = event.first / event.rows + 1;
    this.filter.pageSize = event.rows;
    this.loadAssets();
  }

  onSort(event: any) {
    this.filter.orderByProp = event.field;
    this.filter.sortDirection = event.order === 1 ? 1 : 2;
    this.loadAssets();
  }

  onSearch() {
    this.filter.pageNumber = 1;
    this.loadAssets();
  }

  onTenantFilterChange() {
    this.filter.assetCategoryId = null;
    this.filter.assetTypeId = null;
    this.loadCategories();
    this.loadLocations();
    this.loadUsers();
    this.onSearch();
  }

  onCategoryFilterChange() {
    this.filter.assetTypeId = null;
    this.loadTypesForFilter(this.filter.assetCategoryId);
    this.onSearch();
  }

  clearFilters() {
    this.filter = {
      ...this.filter,
      searchText: '',
      isActive: null,
      tenantId: null,
      assetCategoryId: null,
      assetTypeId: null,
      locationId: null,
      status: null,
      criticality: null,
      responsibleUserId: null,
      pageNumber: 1
    };
    this.loadAssets();
  }

  openNew() {
    this.router.navigate(['/modules/assets/new']);
  }

  openAsset(asset: Asset) {
    this.router.navigate(['/modules/assets', asset.id]);
  }

  deleteItem(asset: Asset) {
    this.confirmationService.confirm({
      message: `Deactivate asset "${asset.name}"?`,
      accept: () => {
        this.service.delete(asset.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Asset deactivated' });
            this.loadAssets();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' })
        });
      }
    });
  }

  statusLabel(value: number) {
    return this.statusLabelMap.get(value) ?? String(value);
  }

  criticalityLabel(value: number) {
    return this.criticalityLabelMap.get(value) ?? String(value);
  }
}
