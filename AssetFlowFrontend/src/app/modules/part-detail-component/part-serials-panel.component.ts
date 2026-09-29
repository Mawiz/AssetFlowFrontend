import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { PartSerialNumber } from '../../model/part-serial-number';
import { PartSerialNumberService } from '../../services/part-serial-number-service';
import { MetadataService } from '@/services/metadata-service';

@Component({
  selector: 'app-part-serials-panel',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule],
  template: `
    <p-table [value]="rows" [paginator]="true" [rows]="10" dataKey="id">
      <ng-template #header>
        <tr>
          <th>Serial number</th>
          <th>Location</th>
          <th>Status</th>
          <th>Received</th>
          <th>Active</th>
        </tr>
      </ng-template>
      <ng-template #body let-row>
        <tr>
          <td>{{ row.serialNumber }}</td>
          <td>{{ row.locationName || '—' }}</td>
          <td>{{ statusLabel(row.status) }}</td>
          <td>{{ row.receivedDate | date: 'mediumDate' }}</td>
          <td>
            <p-tag [value]="row.isActive ? 'Yes' : 'No'" [severity]="row.isActive ? 'success' : 'danger'"></p-tag>
          </td>
        </tr>
      </ng-template>
    </p-table>
    <p *ngIf="!rows.length" class="text-color-secondary">No serial numbers. Receive serialized stock from the Inventory tab.</p>
  `
})
export class PartSerialsPanelComponent implements OnChanges {
  @Input() partId: number | null = null;
  rows: PartSerialNumber[] = [];
  statusLabelMap = new Map<number, string>();

  constructor(
    private serialService: PartSerialNumberService,
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
    if (changes['partId'] && this.partId) {
      this.serialService.filter({ pageNumber: 1, pageSize: 200, partId: this.partId, isActive: null }).subscribe({
        next: (data) => (this.rows = data)
      });
    }
  }

  statusLabel(v: number) {
    return this.statusLabelMap.get(v) ?? String(v);
  }
}
