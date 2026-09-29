import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { PartSerialNumber } from '../../model/part-serial-number';
import { PartSerialNumberService } from '../../services/part-serial-number-service';
import { PartSerialQrService } from '../../services/part-serial-qr.service';
import { Part } from '../../model/part';
import { MetadataService } from '@/services/metadata-service';

@Component({
  selector: 'app-part-serials-panel',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule],
  template: `
    <p-table [value]="rows" [paginator]="true" [rows]="10" dataKey="id">
      <ng-template #header>
        <tr>
          <th>Internal serial</th>
          <th>Supplier S/N</th>
          <th>Supplier</th>
          <th>Location</th>
          <th>Status</th>
          <th>Received</th>
          <th>Active</th>
          <th style="width: 6rem"></th>
        </tr>
      </ng-template>
      <ng-template #body let-row>
        <tr>
          <td>{{ row.serialNumber }}</td>
          <td>{{ row.supplierSerialReference || '—' }}</td>
          <td>{{ row.supplierName || '—' }}</td>
          <td>{{ row.locationName || '—' }}</td>
          <td>{{ statusLabel(row.status) }}</td>
          <td>{{ row.receivedDate | date: 'mediumDate' }}</td>
          <td>
            <p-tag [value]="row.isActive ? 'Yes' : 'No'" [severity]="row.isActive ? 'success' : 'danger'"></p-tag>
          </td>
          <td>
            <p-button icon="pi pi-qrcode" [rounded]="true" [outlined]="true" title="Print QR" (onClick)="printQr(row)"></p-button>
          </td>
        </tr>
      </ng-template>
    </p-table>
    <p *ngIf="!rows.length" class="text-color-secondary">No serial numbers. Receive stock from the Inventory tab.</p>
  `
})
export class PartSerialsPanelComponent implements OnChanges {
  @Input() partId: number | null = null;
  @Input() part: Part | null = null;
  @Input() refreshToken = 0;
  rows: PartSerialNumber[] = [];
  statusLabelMap = new Map<number, string>();

  constructor(
    private serialService: PartSerialNumberService,
    private qrService: PartSerialQrService,
    metadataService: MetadataService
  ) {
    metadataService.getEnums().subscribe({
      next: (res) => {
        const data = res?.result ?? res;
        (data?.PartInventoryStatus ?? []).forEach((x: any) => this.statusLabelMap.set(x.value, x.text));
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['partId'] || changes['refreshToken']) && this.partId) {
      this.loadRows();
    }
  }

  private loadRows() {
    this.serialService.filter({ pageNumber: 1, pageSize: 200, partId: this.partId!, isActive: null }).subscribe({
      next: (data) => (this.rows = data)
    });
  }

  statusLabel(v: number) {
    return this.statusLabelMap.get(v) ?? String(v);
  }

  printQr(row: PartSerialNumber) {
    void this.qrService.printLabel({
      serialNumber: row.serialNumber,
      partNumber: row.partNumber ?? this.part?.partNumber,
      partName: row.partName ?? this.part?.partName
    });
  }
}
