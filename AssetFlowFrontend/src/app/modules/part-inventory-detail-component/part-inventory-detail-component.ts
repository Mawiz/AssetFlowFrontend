import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PartInventoryDetail, PartInventoryBatch, PartInventoryBatchDetail } from '../../model/part-inventory';
import { PartInventoryService } from '../../services/part-inventory-service';
import { LocationService } from '../../services/location-service';
import { Location } from '../../model/location';
import { UserService } from '../../services/user-service';
import { SupplierService } from '../../services/supplier-service';
import { Supplier } from '../../model/supplier';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';
import { AuthService } from '@/services/auth-service';
import { MetadataService } from '@/services/metadata-service';
import { PartTransactionService } from '../../services/part-transaction-service';
import { PartTransaction } from '../../model/part-transaction';
import { Part } from '../../model/part';
import { PartInventoryPanelComponent } from '../part-detail-component/part-inventory-panel.component';

@Component({
  selector: 'app-part-inventory-detail-component',
  standalone: true,
  templateUrl: './part-inventory-detail-component.html',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    DialogModule,
    SelectModule,
    InputNumberModule,
    InputTextModule,
    TextareaModule,
    ToastModule,
    HasPermissionDirective,
    PartInventoryPanelComponent
  ],
  providers: [MessageService]
})
export class PartInventoryDetailComponent implements OnInit {
  Permissions = Permissions;
  detail: PartInventoryDetail | null = null;
  partStub: Part | null = null;
  batchDetail: PartInventoryBatchDetail | null = null;
  selectedBatch: PartInventoryBatch | null = null;
  transactions: PartTransaction[] = [];
  locations: Location[] = [];
  users: { id: number; label: string }[] = [];
  suppliers: Supplier[] = [];
  serialStatusMap = new Map<number, string>();
  txnTypeMap = new Map<number, string>();

  opDialog = false;
  opType = '';
  opQty = 1;
  opToLocationId: number | null = null;
  opUserId: number | null = null;
  opSupplierId: number | null = null;
  opReason = '';
  opRemarks = '';
  selectedSerialIds: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private inventoryService: PartInventoryService,
    private locationService: LocationService,
    private userService: UserService,
    private supplierService: SupplierService,
    private transactionService: PartTransactionService,
    private authService: AuthService,
    private metadataService: MetadataService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.metadataService.getEnums().subscribe({
      next: (res) => {
        const data = res?.result ?? res;
        (data?.PartSerialStatus ?? data?.PartInventoryStatus ?? []).forEach((x: any) =>
          this.serialStatusMap.set(x.value, x.text)
        );
        (data?.PartTransactionType ?? []).forEach((x: any) => this.txnTypeMap.set(x.value, x.text));
      }
    });
    this.locationService.getAll({ pageNumber: 1, pageSize: 500, isActive: true }).subscribe({
      next: (d) => (this.locations = d)
    });
    this.userService.filter({ pageNumber: 1, pageSize: 500, isActive: true }).subscribe({
      next: (list) =>
        (this.users = (list ?? []).map((u: any) => ({ id: u.id, label: u.fullName ?? u.userName ?? String(u.id) })))
    });
    this.supplierService.getAllActive(this.authService.getTenantId()).subscribe({
      next: (d) => (this.suppliers = d)
    });
    this.route.paramMap.subscribe((p) => {
      const id = Number(p.get('id'));
      if (id) this.load(id);
    });
  }

  load(id: number) {
    this.inventoryService.getById(id).subscribe({
      next: (d) => {
        this.detail = d;
        this.partStub = {
          id: d.partId,
          partNumber: d.partNumber,
          partName: d.partName,
          isSerialized: d.partIsSerialized ?? false,
          tenantId: d.tenantId,
          partCategoryId: 0,
          minStockLevel: 0,
          isActive: true
        } as Part;
        this.loadTransactions(id);
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Inventory not found' })
    });
  }

  loadTransactions(inventoryId: number) {
    this.transactionService.filter({ pageNumber: 1, pageSize: 50, partInventoryId: inventoryId }).subscribe({
      next: (rows) => (this.transactions = rows)
    });
  }

  openBatch(batch: PartInventoryBatch) {
    this.selectedBatch = batch;
    this.inventoryService.getBatchById(batch.id).subscribe({
      next: (d) => (this.batchDetail = d)
    });
  }

  openOp(type: string) {
    if (!this.selectedBatch) return;
    this.opType = type;
    this.opQty = this.detail?.partIsSerialized ? 1 : 1;
    this.opToLocationId = this.detail?.locationId ?? null;
    this.opUserId = null;
    this.opSupplierId = this.selectedBatch.supplierId ?? null;
    this.opReason = '';
    this.opRemarks = '';
    this.selectedSerialIds = [];
    this.opDialog = true;
  }

  toggleSerial(id: number) {
    const idx = this.selectedSerialIds.indexOf(id);
    if (idx >= 0) this.selectedSerialIds.splice(idx, 1);
    else this.selectedSerialIds.push(id);
  }

  submitOp() {
    if (!this.selectedBatch || !this.detail) return;
    const tenantId = this.detail.tenantId ?? this.authService.getTenantId();
    const batchId = this.selectedBatch.id;
    const base = {
      partInventoryBatchId: batchId,
      quantity: this.detail.partIsSerialized ? this.selectedSerialIds.length : this.opQty,
      partSerialNumberIds: this.detail.partIsSerialized ? this.selectedSerialIds : [],
      reason: this.opReason,
      remarks: this.opRemarks,
      tenantId
    };
    if (this.detail.partIsSerialized && base.quantity < 1) {
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Select serial number(s).' });
      return;
    }

    const done = () => {
      this.opDialog = false;
      this.load(this.detail!.id);
      if (this.selectedBatch) this.openBatch(this.selectedBatch);
    };
    const err = (e: any) => {
      const detail = e?.error?.errors?.[0] || e?.error?.message || 'Operation failed';
      this.messageService.add({ severity: 'error', summary: 'Error', detail });
    };

    switch (this.opType) {
      case 'transfer':
        this.inventoryService
          .transfer({ ...base, toLocationId: this.opToLocationId!, remarks: this.opRemarks })
          .subscribe({ next: done, error: err });
        break;
      case 'issue':
        this.inventoryService.issue({ ...base, issuedToUserId: this.opUserId }).subscribe({ next: done, error: err });
        break;
      case 'return':
        this.inventoryService
          .returnStock({ ...base, toLocationId: this.opToLocationId!, returnedFromUserId: this.opUserId })
          .subscribe({ next: done, error: err });
        break;
      case 'adjust':
        this.inventoryService
          .adjust({ partInventoryBatchId: batchId, quantityChange: this.opQty, reason: this.opReason, remarks: this.opRemarks, tenantId })
          .subscribe({ next: done, error: err });
        break;
      case 'faulty':
        this.inventoryService.markFaulty(base).subscribe({ next: done, error: err });
        break;
      case 'quarantine':
        this.inventoryService.quarantine(base).subscribe({ next: done, error: err });
        break;
      case 'release':
        this.inventoryService.releaseFromQuarantine(base).subscribe({ next: done, error: err });
        break;
      case 'supplier':
        this.inventoryService
          .returnToSupplier({ ...base, supplierId: this.opSupplierId! })
          .subscribe({ next: done, error: err });
        break;
      case 'scrap':
        this.inventoryService.scrap(base).subscribe({ next: done, error: err });
        break;
    }
  }

  serialLabel(v: number) {
    return this.serialStatusMap.get(v) ?? String(v);
  }

  txnLabel(v: number) {
    return this.txnTypeMap.get(v) ?? String(v);
  }
}
