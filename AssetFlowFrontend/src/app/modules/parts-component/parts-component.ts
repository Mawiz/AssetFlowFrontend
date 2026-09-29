import { Component, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Part, PartFilterDto } from '../../model/part';
import { PartService } from '../../services/part-service';
import { PartCategoryService } from '../../services/part-category-service';
import { PartCategory } from '../../model/part-category';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';
import { AuthService } from '@/services/auth-service';
import { MetadataService } from '@/services/metadata-service';

@Component({
  selector: 'app-parts-component',
  standalone: true,
  templateUrl: './parts-component.html',
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
    CheckboxModule,
    HasPermissionDirective
  ],
  providers: [MessageService, ConfirmationService]
})
export class PartsComponent implements OnInit {
  readonly Permissions = Permissions;
  @ViewChild('dt') dt!: Table;

  parts = signal<Part[]>([]);
  totalRecords = 0;
  systemAdmin = false;
  categories: PartCategory[] = [];
  tenantFilterOptions: { label: string; value: number | null }[] = [
    { label: 'All tenants', value: null }
  ];
  filterDialogVisible = false;
  serializedFilterOptions = [
    { label: 'All', value: null },
    { label: 'Serialized', value: true },
    { label: 'Non-serialized', value: false }
  ];
  statusOptions = [
    { label: 'All', value: null },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  filter: PartFilterDto = {
    pageNumber: 1,
    pageSize: 10,
    searchText: '',
    isActive: null,
    tenantId: null,
    partCategoryId: null,
    isSerialized: null,
    lowStockOnly: null
  };

  constructor(
    private service: PartService,
    private categoryService: PartCategoryService,
    private authService: AuthService,
    private metadataService: MetadataService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.systemAdmin = this.authService.systemAdminPermissions();
    this.route.queryParamMap.subscribe((params) => {
      this.filter.lowStockOnly = params.get('lowStock') === 'true' ? true : null;
      this.loadParts();
    });
    if (this.systemAdmin) {
      this.loadTenants();
    }
    this.loadCategories();
  }

  loadTenants() {
    this.metadataService.getMetadataValues({ secretKeys: ['Tenant'] }).subscribe({
      next: (res) => {
        const list = res?.result?.metaResult?.[0]?.data ?? [];
        this.tenantFilterOptions = [
          { label: 'All tenants', value: null },
          ...list.map((t: any) => ({ label: t.displayName ?? t.companyName ?? t.name, value: t.id }))
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

  loadParts() {
    this.service.filter(this.filter).subscribe({
      next: (data) => {
        this.parts.set(data);
        this.totalRecords =
          data.length < this.filter.pageSize
            ? (this.filter.pageNumber - 1) * this.filter.pageSize + data.length
            : this.filter.pageNumber * this.filter.pageSize + 1;
      },
      error: () =>
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load parts' })
    });
  }

  onPage(event: any) {
    this.filter.pageNumber = event.first / event.rows + 1;
    this.filter.pageSize = event.rows;
    this.loadParts();
  }

  onSort(event: any) {
    this.filter.orderByProp = event.field;
    this.filter.sortDirection = event.order === 1 ? 1 : 2;
    this.loadParts();
  }

  onSearch() {
    this.filter.pageNumber = 1;
    this.loadParts();
  }

  onTenantFilterChange() {
    this.loadCategories();
    this.onSearch();
  }

  applyFilters() {
    this.filterDialogVisible = false;
    this.onSearch();
  }

  clearFilters() {
    this.filter = {
      ...this.filter,
      searchText: '',
      isActive: null,
      tenantId: null,
      partCategoryId: null,
      isSerialized: null,
      lowStockOnly: null,
      pageNumber: 1
    };
    this.router.navigate([], { queryParams: { lowStock: null }, queryParamsHandling: 'merge' });
    this.loadParts();
    this.filterDialogVisible = false;
  }

  showLowStockOnly() {
    this.filter.lowStockOnly = true;
    this.router.navigate([], { queryParams: { lowStock: 'true' }, queryParamsHandling: 'merge' });
    this.onSearch();
  }

  openNew() {
    this.router.navigate(['/modules/parts/new']);
  }

  openPart(part: Part) {
    this.router.navigate(['/modules/parts', part.id]);
  }

  deleteItem(part: Part) {
    this.confirmationService.confirm({
      message: `Deactivate part "${part.partName}"?`,
      accept: () => {
        this.service.delete(part.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Part deactivated' });
            this.loadParts();
          },
          error: (err) => {
            const detail = err?.error?.errors?.[0] || err?.error?.message || 'Delete failed';
            this.messageService.add({ severity: 'error', summary: 'Error', detail });
          }
        });
      }
    });
  }

  stockStatus(part: Part): string {
    if (part.isLowStock) return 'Low stock';
    return (part.currentStock ?? 0) > 0 ? 'In stock' : 'Out of stock';
  }
}
