import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PartInventory, PartInventoryFilterDto } from '../../model/part-inventory';
import { PartInventoryService } from '../../services/part-inventory-service';
import { LocationService } from '../../services/location-service';
import { Location } from '../../model/location';
import { PartService } from '../../services/part-service';
import { Part } from '../../model/part';
import { AuthService } from '@/services/auth-service';
import { MetadataService } from '@/services/metadata-service';

@Component({
  selector: 'app-part-inventory-component',
  standalone: true,
  templateUrl: './part-inventory-component.html',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    SelectModule,
    TagModule,
    ToastModule
  ],
  providers: [MessageService]
})
export class PartInventoryComponent implements OnInit {
  rows = signal<PartInventory[]>([]);
  totalRecords = 0;
  systemAdmin = false;
  locations: Location[] = [];
  parts: Part[] = [];
  tenantFilterOptions: { label: string; value: number | null }[] = [{ label: 'All tenants', value: null }];
  filter: PartInventoryFilterDto = {
    pageNumber: 1,
    pageSize: 10,
    isActive: true,
    tenantId: null,
    partId: null,
    locationId: null,
    lowStockOnly: null
  };

  constructor(
    private inventoryService: PartInventoryService,
    private locationService: LocationService,
    private partService: PartService,
    private authService: AuthService,
    private metadataService: MetadataService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.systemAdmin = this.authService.systemAdminPermissions();
    if (this.systemAdmin) {
      this.metadataService.getMetadataValues({ secretKeys: ['Tenant'] }).subscribe({
        next: (res) => {
          const list = res?.result?.metaResult?.[0]?.data ?? [];
          this.tenantFilterOptions = [
            { label: 'All tenants', value: null },
            ...list.map((t: any) => ({ label: t.displayName ?? t.companyName, value: t.id }))
          ];
        }
      });
    }
    this.loadLocations();
    this.loadParts();
    this.load();
  }

  loadLocations() {
    this.locationService
      .getAll({ pageNumber: 1, pageSize: 500, isActive: true, tenantId: this.filter.tenantId })
      .subscribe({ next: (data) => (this.locations = data) });
  }

  loadParts() {
    this.partService.filter({ pageNumber: 1, pageSize: 500, isActive: true, tenantId: this.filter.tenantId }).subscribe({
      next: (data) => (this.parts = data)
    });
  }

  load() {
    this.inventoryService.filter(this.filter).subscribe({
      next: (data) => {
        this.rows.set(data);
        this.totalRecords =
          data.length < this.filter.pageSize
            ? (this.filter.pageNumber - 1) * this.filter.pageSize + data.length
            : this.filter.pageNumber * this.filter.pageSize + 1;
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load inventory' })
    });
  }

  onPage(event: any) {
    this.filter.pageNumber = event.first / event.rows + 1;
    this.filter.pageSize = event.rows;
    this.load();
  }

  onFilterChange() {
    this.filter.pageNumber = 1;
    this.loadLocations();
    this.loadParts();
    this.load();
  }

}
