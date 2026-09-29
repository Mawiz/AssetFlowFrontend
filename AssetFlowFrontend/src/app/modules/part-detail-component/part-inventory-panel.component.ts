import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PartInventory } from '../../model/part-inventory';
import { PartInventoryService } from '../../services/part-inventory-service';
import { LocationService } from '../../services/location-service';
import { Location } from '../../model/location';
import { Part } from '../../model/part';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';
import { AuthService } from '@/services/auth-service';
import { MetadataService } from '@/services/metadata-service';

@Component({
  selector: 'app-part-inventory-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    SelectModule,
    InputTextModule,
    InputNumberModule,
    ToastModule,
    HasPermissionDirective
  ],
  providers: [MessageService],
  template: `
    <div class="flex justify-end mb-3">
      <p-button *appHasPermission="Permissions.PartInventory.Create" label="Receive stock" icon="pi pi-plus" (onClick)="openReceipt()"></p-button>
    </div>
    <p-table [value]="rows" [paginator]="true" [rows]="10" dataKey="id">
      <ng-template #header>
        <tr>
          <th>Location</th>
          <th>Serial</th>
          <th>Available</th>
          <th>Reserved</th>
          <th>Status</th>
          <th style="width: 10rem"></th>
        </tr>
      </ng-template>
      <ng-template #body let-row>
        <tr>
          <td>{{ row.locationName }}</td>
          <td>{{ row.serialNumber || '—' }}</td>
          <td>{{ row.quantityAvailable }}</td>
          <td>{{ row.quantityReserved }}</td>
          <td>{{ statusLabel(row.status) }}</td>
          <td>
            <p-button *appHasPermission="Permissions.PartInventory.Update" icon="pi pi-arrow-right-arrow-left" [rounded]="true" [outlined]="true" class="mr-1" (onClick)="openTransfer(row)"></p-button>
            <p-button *appHasPermission="Permissions.PartInventory.Update" icon="pi pi-sliders-h" [rounded]="true" [outlined]="true" (onClick)="openAdjust(row)"></p-button>
          </td>
        </tr>
      </ng-template>
    </p-table>

    <p-dialog header="Receive stock" [(visible)]="receiptVisible" [modal]="true" [style]="{ width: '28rem' }">
      <div class="flex flex-col gap-3">
        <p-select [options]="locations" [(ngModel)]="receipt.locationId" optionLabel="name" optionValue="id" placeholder="Location *"></p-select>
        <p-inputNumber *ngIf="!part?.isSerialized" [(ngModel)]="receipt.quantity" [min]="0.01" placeholder="Quantity"></p-inputNumber>
        <input *ngIf="part?.isSerialized" pInputText [(ngModel)]="receipt.serialNumber" placeholder="Serial number *" />
        <input pInputText [(ngModel)]="receipt.remarks" placeholder="Remarks" />
      </div>
      <ng-template #footer>
        <p-button label="Cancel" text (onClick)="receiptVisible = false"></p-button>
        <p-button label="Save" (onClick)="submitReceipt()"></p-button>
      </ng-template>
    </p-dialog>

    <p-dialog header="Transfer" [(visible)]="transferVisible" [modal]="true" [style]="{ width: '28rem' }">
      <div class="flex flex-col gap-3">
        <p-select [options]="locations" [(ngModel)]="transfer.toLocationId" optionLabel="name" optionValue="id" placeholder="To location *"></p-select>
        <p-inputNumber [(ngModel)]="transfer.quantity" [min]="0.01" placeholder="Quantity"></p-inputNumber>
        <input pInputText [(ngModel)]="transfer.remarks" placeholder="Remarks" />
      </div>
      <ng-template #footer>
        <p-button label="Cancel" text (onClick)="transferVisible = false"></p-button>
        <p-button label="Transfer" (onClick)="submitTransfer()"></p-button>
      </ng-template>
    </p-dialog>

    <p-dialog header="Adjust quantity" [(visible)]="adjustVisible" [modal]="true" [style]="{ width: '28rem' }">
      <div class="flex flex-col gap-3">
        <p-inputNumber [(ngModel)]="adjust.quantityChange" placeholder="Quantity change (+/-)"></p-inputNumber>
        <input pInputText [(ngModel)]="adjust.remarks" placeholder="Reason" />
      </div>
      <ng-template #footer>
        <p-button label="Cancel" text (onClick)="adjustVisible = false"></p-button>
        <p-button label="Adjust" (onClick)="submitAdjust()"></p-button>
      </ng-template>
    </p-dialog>
    <p-toast></p-toast>
  `
})
export class PartInventoryPanelComponent implements OnChanges {
  readonly Permissions = Permissions;
  @Input() partId: number | null = null;
  @Input() part: Part | null = null;

  rows: PartInventory[] = [];
  locations: Location[] = [];
  statusLabelMap = new Map<number, string>();

  receiptVisible = false;
  transferVisible = false;
  adjustVisible = false;
  receipt = { locationId: null as number | null, quantity: 1, serialNumber: '', remarks: '' };
  transfer = { partInventoryId: 0, toLocationId: null as number | null, quantity: 1, remarks: '' };
  adjust = { partInventoryId: 0, quantityChange: 0, remarks: '' };

  constructor(
    private inventoryService: PartInventoryService,
    private locationService: LocationService,
    private metadataService: MetadataService,
    private authService: AuthService,
    private messageService: MessageService
  ) {
    this.metadataService.getEnums().subscribe({
      next: (res) => {
        const data = res?.result ?? res;
        (data?.PartInventoryStatus ?? []).forEach((x: any) => this.statusLabelMap.set(x.value, x.text));
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['partId'] && this.partId) {
      this.load();
      this.loadLocations();
    }
  }

  load() {
    if (!this.partId) return;
    this.inventoryService.filter({ pageNumber: 1, pageSize: 200, partId: this.partId, isActive: true }).subscribe({
      next: (data) => (this.rows = data)
    });
  }

  loadLocations() {
    const tenantId = this.part?.tenantId ?? this.authService.getTenantId();
    this.locationService.getAll({ pageNumber: 1, pageSize: 500, isActive: true, tenantId }).subscribe({
      next: (data) => (this.locations = data.filter((l) => l.isActive))
    });
  }

  statusLabel(v: number) {
    return this.statusLabelMap.get(v) ?? String(v);
  }

  openReceipt() {
    this.receipt = { locationId: null, quantity: 1, serialNumber: '', remarks: '' };
    this.receiptVisible = true;
  }

  submitReceipt() {
    if (!this.partId || !this.receipt.locationId) return;
    if (this.part?.isSerialized && !this.receipt.serialNumber?.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Serial number is required' });
      return;
    }
    this.inventoryService
      .receipt({
        partId: this.partId,
        locationId: this.receipt.locationId,
        quantity: this.part?.isSerialized ? 1 : this.receipt.quantity,
        serialNumber: this.receipt.serialNumber,
        remarks: this.receipt.remarks,
        tenantId: this.part?.tenantId
      })
      .subscribe({
        next: () => {
          this.receiptVisible = false;
          this.load();
          this.messageService.add({ severity: 'success', summary: 'Received', detail: 'Stock received' });
        },
        error: (err) => this.showError(err)
      });
  }

  openTransfer(row: PartInventory) {
    this.transfer = { partInventoryId: row.id, toLocationId: null, quantity: row.quantityAvailable, remarks: '' };
    this.transferVisible = true;
  }

  submitTransfer() {
    if (!this.transfer.toLocationId) return;
    this.inventoryService.transfer({ ...this.transfer, toLocationId: this.transfer.toLocationId, tenantId: this.part?.tenantId }).subscribe({
      next: () => {
        this.transferVisible = false;
        this.load();
        this.messageService.add({ severity: 'success', summary: 'Transferred', detail: 'Inventory transferred' });
      },
      error: (err) => this.showError(err)
    });
  }

  openAdjust(row: PartInventory) {
    this.adjust = { partInventoryId: row.id, quantityChange: 0, remarks: '' };
    this.adjustVisible = true;
  }

  submitAdjust() {
    this.inventoryService.adjust({ ...this.adjust, tenantId: this.part?.tenantId }).subscribe({
      next: () => {
        this.adjustVisible = false;
        this.load();
        this.messageService.add({ severity: 'success', summary: 'Adjusted', detail: 'Quantity updated' });
      },
      error: (err) => this.showError(err)
    });
  }

  private showError(err: any) {
    const detail = err?.error?.errors?.[0] || err?.error?.message || 'Operation failed';
    this.messageService.add({ severity: 'error', summary: 'Error', detail });
  }
}
