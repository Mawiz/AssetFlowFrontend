import {
  Component,
  Input,
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
import { LocationService } from '../../services/location-service';
import { Location } from '../../model/location';
import { Part } from '../../model/part';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';
import { AuthService } from '@/services/auth-service';
import { MetadataService } from '@/services/metadata-service';

type SerialMode = 'auto' | 'scan' | 'manual';

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

  @ViewChild('scanVideo') scanVideo?: ElementRef<HTMLVideoElement>;

  rows: PartInventory[] = [];
  locations: Location[] = [];
  statusLabelMap = new Map<number, string>();

  receiptVisible = false;
  transferVisible = false;
  adjustVisible = false;
  receipt = { locationId: null as number | null, serialNumber: '', remarks: '' };
  transfer = { partInventoryId: 0, toLocationId: null as number | null, quantity: 1, remarks: '' };
  transferMaxQty = 1;
  adjust = { partInventoryId: 0, quantityChange: 0, remarks: '' };

  serialMode: SerialMode = 'auto';
  serialModeOptions = [
    { label: 'Auto', value: 'auto' as SerialMode },
    { label: 'Scan', value: 'scan' as SerialMode },
    { label: 'Type', value: 'manual' as SerialMode }
  ];

  scanning = false;
  private scanReader: BrowserMultiFormatReader | null = null;
  private scanControls: { stop: () => void } | null = null;

  constructor(
    private inventoryService: PartInventoryService,
    private serialService: PartSerialNumberService,
    private qrService: PartSerialQrService,
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

  statusLabel(v: number) {
    return this.statusLabelMap.get(v) ?? String(v);
  }

  openReceipt() {
    this.receipt = { locationId: null, serialNumber: '', remarks: '' };
    this.serialMode = 'auto';
    this.receiptVisible = true;
    setTimeout(() => this.loadNextSerial(), 0);
  }

  onSerialModeChange() {
    this.stopScan();
    if (this.serialMode === 'auto') {
      this.loadNextSerial();
    } else {
      this.receipt.serialNumber = '';
    }
  }

  loadNextSerial() {
    if (!this.partId) return;
    const tenantId = this.part?.tenantId ?? this.authService.getTenantId();
    this.serialService.getNextSerial(this.partId, tenantId).subscribe({
      next: (serial) => (this.receipt.serialNumber = serial),
      error: () =>
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not generate next serial' })
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
          this.receipt.serialNumber = result.getText().trim();
          this.messageService.add({ severity: 'info', summary: 'Scanned', detail: this.receipt.serialNumber });
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
        detail: 'Could not access camera. Use the text field with a USB scanner or type manually.'
      });
    }
  }

  stopScan() {
    this.scanControls?.stop();
    this.scanControls = null;
    this.scanReader = null;
    this.scanning = false;
  }

  onScanInputEnter() {
    this.receipt.serialNumber = this.receipt.serialNumber?.trim() ?? '';
  }

  private validateSerialBeforeSubmit(): boolean {
    if (!this.receipt.serialNumber?.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Serial number is required' });
      return false;
    }
    if (!this.receipt.locationId) {
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Location is required' });
      return false;
    }
    return true;
  }

  submitReceipt(printAfter: boolean) {
    if (!this.partId || !this.validateSerialBeforeSubmit()) return;

    const serial = this.receipt.serialNumber.trim();
    const tenantId = this.part?.tenantId ?? this.authService.getTenantId();

    this.serialService.serialExists(serial, tenantId).subscribe({
      next: (exists) => {
        if (exists) {
          this.messageService.add({ severity: 'error', summary: 'Duplicate', detail: 'Serial number already exists' });
          if (this.serialMode === 'auto') this.loadNextSerial();
          return;
        }
        this.inventoryService
          .receipt({
            partId: this.partId!,
            locationId: this.receipt.locationId!,
            quantity: 1,
            serialNumber: serial,
            remarks: this.receipt.remarks,
            tenantId
          })
          .subscribe({
            next: () => {
              this.receiptVisible = false;
              this.stopScan();
              this.load();
              this.messageService.add({ severity: 'success', summary: 'Received', detail: 'Stock received' });
              if (printAfter) {
                void this.qrService.printLabel({
                  serialNumber: serial,
                  partNumber: this.part?.partNumber,
                  partName: this.part?.partName
                });
              }
            },
            error: (err) => this.showError(err)
          });
      },
      error: (err) => this.showError(err)
    });
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
