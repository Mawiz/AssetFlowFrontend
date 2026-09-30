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
import { RouterModule } from '@angular/router';
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
import { PartInventory, PartReceiveLine } from '../../model/part-inventory';
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

type SerialMode = 'auto' | 'scan';

interface ReceiptLineUi {
  supplierId: number | null;
  quantity: number;
  expiryDate: string;
  supplierSerialLines: string[];
  previewSerials: string[];
}

@Component({
  selector: 'app-part-inventory-panel',
  standalone: true,
  templateUrl: './part-inventory-panel.component.html',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
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
  /** When true, only show receive action (no location stock table). */
  @Input() receiveOnly = false;
  @Input() defaultLocationId: number | null = null;
  @Output() inventoryChanged = new EventEmitter<void>();

  @ViewChild('scanVideo') scanVideo?: ElementRef<HTMLVideoElement>;

  rows: PartInventory[] = [];
  locations: Location[] = [];
  suppliers: Supplier[] = [];

  receiptVisible = false;
  receipt = {
    locationId: null as number | null,
    remarks: ''
  };
  receiptLines: ReceiptLineUi[] = [];
  scanLineIndex = 0;

  serialMode: SerialMode = 'auto';
  serialModeOptions = [
    { label: 'Auto serial', value: 'auto' as SerialMode },
    { label: 'Supplier serial (scan/type)', value: 'scan' as SerialMode }
  ];
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
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (this.partId && (changes['partId'] || changes['part'])) {
      if (!this.receiveOnly) this.load();
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

  newReceiptLine(): ReceiptLineUi {
    return {
      supplierId: null,
      quantity: 1,
      expiryDate: '',
      supplierSerialLines: [''],
      previewSerials: []
    };
  }

  openReceipt() {
    this.receipt = { locationId: this.defaultLocationId, remarks: '' };
    this.receiptLines = [this.newReceiptLine()];
    this.serialMode = 'auto';
    this.scanBuffer = '';
    this.receiptVisible = true;
    this.refreshAllLinePreviews();
  }

  addReceiptLine() {
    this.receiptLines = [...this.receiptLines, this.newReceiptLine()];
    this.refreshAllLinePreviews();
  }

  removeReceiptLine(index: number) {
    if (this.receiptLines.length <= 1) return;
    this.receiptLines = this.receiptLines.filter((_, i) => i !== index);
  }

  onSerialModeChange() {
    this.stopScan();
    this.receiptLines.forEach((line) => {
      line.supplierSerialLines = this.buildSupplierLines(line.quantity);
    });
    if (this.serialMode === 'auto') this.refreshAllLinePreviews();
  }

  onLineQuantityChange(lineIndex: number) {
    const line = this.receiptLines[lineIndex];
    line.supplierSerialLines = this.buildSupplierLines(line.quantity, line.supplierSerialLines);
    if (this.part?.isSerialized && this.serialMode === 'auto') this.loadPreviewForLine(lineIndex);
  }

  private buildSupplierLines(qty: number, existing: string[] = []): string[] {
    const lines: string[] = [];
    for (let i = 0; i < qty; i++) lines.push(existing[i]?.trim() ?? '');
    return lines;
  }

  refreshAllLinePreviews() {
    if (!this.part?.isSerialized || this.serialMode !== 'auto') return;
    this.receiptLines.forEach((_, i) => this.loadPreviewForLine(i));
  }

  loadPreviewForLine(lineIndex: number) {
    const line = this.receiptLines[lineIndex];
    if (!this.part?.isSerialized || !this.partId || line.quantity < 1) {
      line.previewSerials = [];
      return;
    }
    const tenantId = this.part?.tenantId ?? this.authService.getTenantId();
    this.serialService.getNextSerials(this.partId, line.quantity, tenantId).subscribe({
      next: (list) => (line.previewSerials = list),
      error: () => (line.previewSerials = [])
    });
  }

  async startScan(lineIndex: number) {
    this.scanLineIndex = lineIndex;
    this.stopScan();
    const video = this.scanVideo?.nativeElement;
    if (!video) return;
    this.scanning = true;
    this.scanReader = new BrowserMultiFormatReader();
    try {
      this.scanControls = await this.scanReader.decodeFromVideoDevice(undefined, video, (result, _err, controls) => {
        if (result) {
          this.addSupplierSerial(lineIndex, result.getText().trim());
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

  onSupplierScanEnter(lineIndex: number) {
    const v = this.scanBuffer?.trim();
    if (!v) return;
    this.addSupplierSerial(lineIndex, v);
    this.scanBuffer = '';
  }

  addSupplierSerial(lineIndex: number, value: string) {
    const lines = this.receiptLines[lineIndex]?.supplierSerialLines ?? [];
    const idx = lines.findIndex((x) => !x?.trim());
    if (idx < 0) {
      this.messageService.add({ severity: 'warn', summary: 'Full', detail: 'All supplier serial lines are filled for this batch.' });
      return;
    }
    if (lines.some((x) => x?.trim().toLowerCase() === value.toLowerCase())) {
      this.messageService.add({ severity: 'warn', summary: 'Duplicate', detail: 'Supplier serial already entered.' });
      return;
    }
    lines[idx] = value;
    this.receiptLines[lineIndex].supplierSerialLines = [...lines];
  }

  submitReceipt(printAfter: boolean) {
    if (!this.partId || !this.receipt.locationId) {
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Location is required.' });
      return;
    }

    const apiLines: PartReceiveLine[] = [];
    for (let i = 0; i < this.receiptLines.length; i++) {
      const line = this.receiptLines[i];
      if (!line.supplierId || line.quantity < 1) {
        this.messageService.add({ severity: 'warn', summary: 'Validation', detail: `Batch line ${i + 1}: supplier and quantity are required.` });
        return;
      }

      let supplierRefs: string[] = [];
      if (this.part?.isSerialized && this.serialMode === 'scan') {
        supplierRefs = line.supplierSerialLines.map((x) => x?.trim() ?? '');
        if (supplierRefs.length !== line.quantity || supplierRefs.some((x) => !x)) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Validation',
            detail: `Batch line ${i + 1}: enter one supplier serial per unit.`
          });
          return;
        }
        const dup = new Set(supplierRefs.map((x) => x.toLowerCase()));
        if (dup.size !== supplierRefs.length) {
          this.messageService.add({ severity: 'warn', summary: 'Duplicate', detail: `Batch line ${i + 1}: duplicate supplier serials.` });
          return;
        }
      }

      apiLines.push({
        supplierId: line.supplierId,
        quantity: line.quantity,
        expiryDate: line.expiryDate || null,
        receiptMode: this.part?.isSerialized && this.serialMode === 'scan' ? 1 : 0,
        supplierSerialReferences: supplierRefs
      });
    }

    const tenantId = this.part?.tenantId ?? this.authService.getTenantId();
    this.inventoryService
      .receiveStock({
        partId: this.partId,
        locationId: this.receipt.locationId,
        remarks: this.receipt.remarks,
        tenantId,
        lines: apiLines
      })
      .subscribe({
        next: (result) => {
          this.receiptVisible = false;
          this.stopScan();
          this.load();
          this.inventoryChanged.emit();
          const totalQty = apiLines.reduce((s, l) => s + l.quantity, 0);
          this.messageService.add({
            severity: 'success',
            summary: 'Received',
            detail: `${totalQty} unit(s) in ${apiLines.length} batch(es)`
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

  private showError(err: any) {
    const detail = err?.error?.errors?.[0] || err?.error?.message || 'Operation failed';
    this.messageService.add({ severity: 'error', summary: 'Error', detail });
  }
}
