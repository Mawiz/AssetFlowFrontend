import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { PartInventory } from '../../model/part-inventory';
import { PartInventoryService } from '../../services/part-inventory-service';
import { PartSerialNumberService } from '../../services/part-serial-number-service';
import { PartSerialQrService } from '../../services/part-serial-qr.service';
import { SupplierService } from '../../services/supplier-service';
import { LocationService } from '../../services/location-service';
import { Location } from '../../model/location';
import { Supplier } from '../../model/supplier';
import { Part } from '../../model/part';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';
import { AuthService } from '@/services/auth-service';
import { MetadataService } from '@/services/metadata-service';

type SerialMode = 'auto' | 'scan';

@Component({
  selector: 'app-part-inventory-panel',
  standalone: true,
  templateUrl: './part-inventory-panel.component.html',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    SelectModule,
    SelectButtonModule,
    InputTextModule,
    InputNumberModule,
    ToastModule,
    HasPermissionDirective
  ],
  providers: [MessageService]
})
export class PartInventoryPanelComponent implements OnChanges, OnDestroy {
  readonly Permissions = Permissions;
  readonly year = new Date().getFullYear();

  @Input() partId: number | null = null;
  @Input() part: Part | null = null;
  @Output() inventoryChanged = new EventEmitter<void>();

  @ViewChild('scanVideo') scanVideo?: ElementRef<HTMLVideoElement>;

  rows: PartInventory[] = [];
  locations: Location[] = [];
  suppliers: Supplier[] = [];
  statusLabelMap = new Map<number, string>();

  receiptVisible = false;
  transferVisible = false;
  adjustVisible = false;
  receipt = {
    locationId: null as number | null,
    supplierId: null as number | null,
    quantity: 1,
    remarks: ''
  };
  transfer = { partInventoryId: 0, toLocationId: null as number | null, quantity: 1, remarks: '' };
  transferMaxQty = 1;
  adjust = { partInventoryId: 0, quantityChange: 0, remarks: '' };

  serialMode: SerialMode = 'auto';
  serialModeOptions = [
    { label: 'Auto serial', value: 'auto' as SerialMode },
    { label: 'Supplier serial (scan/type)', value: 'scan' as SerialMode }
  ];
  previewSerials: string[] = [];
  supplierSerialLines: string[] = [''];
  scanBuffer = '';

  scanning = false;
  private scanReader: BrowserMultiFormatReader | null = null;
  private scanControls: { stop: () => void } | null = null;

  constructor(
    private inventoryService: PartInventoryService,
    private serialService: PartSerialNumberService,
    private qrService: PartSerialQrService,
    private supplierService: SupplierService,
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
      this.loadSuppliers();
    }
  }

  ngOnDestroy() {
    this.stopScan();
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

  loadSuppliers() {
    const tenantId = this.part?.tenantId ?? this.authService.getTenantId();
    this.supplierService.getAllActive(tenantId).subscribe({
      next: (data) => (this.suppliers = data.filter((s) => s.isActive))
    });
  }

  statusLabel(v: number) {
    return this.statusLabelMap.get(v) ?? String(v);
  }

  openReceipt() {
    this.receipt = { locationId: null, supplierId: null, quantity: 1, remarks: '' };
    this.serialMode = 'auto';
    this.supplierSerialLines = this.buildSupplierLines(this.receipt.quantity);
    this.scanBuffer = '';
    this.receiptVisible = true;
    this.loadPreviewSerials();
  }

  onSerialModeChange() {
    this.stopScan();
    this.supplierSerialLines = this.buildSupplierLines(this.receipt.quantity);
    this.scanBuffer = '';
    if (this.serialMode === 'auto') this.loadPreviewSerials();
  }

  onQuantityChange() {
    if (this.serialMode === 'auto') this.loadPreviewSerials();
    this.supplierSerialLines = this.buildSupplierLines(this.receipt.quantity, this.supplierSerialLines);
  }

  private buildSupplierLines(qty: number, existing: string[] = []): string[] {
    const lines: string[] = [];
    for (let i = 0; i < qty; i++) lines.push(existing[i]?.trim() ?? '');
    return lines;
  }

  loadPreviewSerials() {
    if (!this.partId || this.receipt.quantity < 1) {
      this.previewSerials = [];
      return;
    }
    const tenantId = this.part?.tenantId ?? this.authService.getTenantId();
    this.serialService.getNextSerials(this.partId, this.receipt.quantity, tenantId).subscribe({
      next: (list) => (this.previewSerials = list),
      error: () => (this.previewSerials = [])
    });
  }

  async startScan() {
    this.stopScan();
    const video = this.scanVideo?.nativeElement;
    if (!video) return;
    this.scanning = true;
    this.scanReader = new BrowserMultiFormatReader();
    try {
      this.scanControls = await this.scanReader.decodeFromVideoDevice(undefined, video, (result, _err, controls) => {
        if (result) {
          this.addSupplierSerial(result.getText().trim());
          controls.stop();
          this.scanning = false;
          this.scanControls = null;
        }
      });
    } catch {
      this.scanning = false;
      this.messageService.add({
        severity: 'warn',
        summary: 'Camera',
        detail: 'Use the scan field with a USB scanner if camera is unavailable.'
      });
    }
  }

  stopScan() {
    this.scanControls?.stop();
    this.scanControls = null;
    this.scanReader = null;
    this.scanning = false;
  }

  onSupplierScanEnter() {
    const v = this.scanBuffer?.trim();
    if (!v) return;
    this.addSupplierSerial(v);
    this.scanBuffer = '';
  }

  addSupplierSerial(value: string) {
    const idx = this.supplierSerialLines.findIndex((x) => !x?.trim());
    const targetIdx = idx >= 0 ? idx : -1;
    if (targetIdx < 0) {
      this.messageService.add({ severity: 'warn', summary: 'Full', detail: 'All supplier serial lines are filled.' });
      return;
    }
    if (this.supplierSerialLines.some((x) => x?.trim().toLowerCase() === value.toLowerCase())) {
      this.messageService.add({ severity: 'warn', summary: 'Duplicate', detail: 'Supplier serial already entered.' });
      return;
    }
    this.supplierSerialLines[targetIdx] = value;
    this.supplierSerialLines = [...this.supplierSerialLines];
  }

  submitReceipt(printAfter: boolean) {
    if (!this.partId || !this.receipt.locationId || !this.receipt.supplierId) {
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Location and supplier are required.' });
      return;
    }
    if (this.receipt.quantity < 1) return;

    const supplierRefs =
      this.serialMode === 'scan' ? this.supplierSerialLines.map((x) => x?.trim() ?? '') : [];

    if (this.serialMode === 'scan') {
      if (supplierRefs.length !== this.receipt.quantity || supplierRefs.some((x) => !x)) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Validation',
          detail: `Enter or scan a supplier serial for each of ${this.receipt.quantity} unit(s).`
        });
        return;
      }
      const dup = new Set(supplierRefs.map((x) => x.toLowerCase()));
      if (dup.size !== supplierRefs.length) {
        this.messageService.add({ severity: 'warn', summary: 'Duplicate', detail: 'Supplier serials must be unique.' });
        return;
      }
    }

    const tenantId = this.part?.tenantId ?? this.authService.getTenantId();
    this.inventoryService
      .batchReceipt({
        partId: this.partId,
        locationId: this.receipt.locationId,
        supplierId: this.receipt.supplierId,
        quantity: this.receipt.quantity,
        receiptMode: this.serialMode === 'scan' ? 1 : 0,
        supplierSerialReferences: supplierRefs,
        remarks: this.receipt.remarks,
        tenantId
      })
      .subscribe({
        next: (result) => {
          this.receiptVisible = false;
          this.stopScan();
          this.load();
          this.inventoryChanged.emit();
          this.messageService.add({
            severity: 'success',
            summary: 'Received',
            detail: `${result.generatedSerialNumbers?.length ?? 0} unit(s) received`
          });
          if (printAfter && result.generatedSerialNumbers?.length) {
            void this.printAllLabels(result.generatedSerialNumbers);
          }
        },
        error: (err) => this.showError(err)
      });
  }

  private async printAllLabels(serials: string[]) {
    for (const serial of serials) {
      await this.qrService.printLabel({
        serialNumber: serial,
        partNumber: this.part?.partNumber,
        partName: this.part?.partName
      });
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  printQr(row: PartInventory) {
    if (!row.serialNumber) return;
    void this.qrService.printLabel({
      serialNumber: row.serialNumber,
      partNumber: row.partNumber ?? this.part?.partNumber,
      partName: row.partName ?? this.part?.partName
    });
  }

  openTransfer(row: PartInventory) {
    this.transferMaxQty = row.quantityAvailable;
    this.transfer = {
      partInventoryId: row.id,
      toLocationId: null,
      quantity: row.serialNumber ? 1 : row.quantityAvailable,
      remarks: ''
    };
    this.transferVisible = true;
  }

  submitTransfer() {
    if (!this.transfer.toLocationId) return;
    this.inventoryService
      .transfer({ ...this.transfer, toLocationId: this.transfer.toLocationId, tenantId: this.part?.tenantId })
      .subscribe({
        next: () => {
          this.transferVisible = false;
          this.load();
          this.inventoryChanged.emit();
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
        this.inventoryChanged.emit();
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
