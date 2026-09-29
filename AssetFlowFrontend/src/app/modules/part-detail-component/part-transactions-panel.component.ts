import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { PartTransaction } from '../../model/part-transaction';
import { PartTransactionService } from '../../services/part-transaction-service';
import { MetadataService } from '@/services/metadata-service';

@Component({
  selector: 'app-part-transactions-panel',
  standalone: true,
  imports: [CommonModule, TableModule],
  template: `
    <p-table [value]="rows" [paginator]="true" [rows]="10" dataKey="id">
      <ng-template #header>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Qty</th>
          <th>From</th>
          <th>To</th>
          <th>Serial</th>
          <th>User</th>
          <th>Remarks</th>
        </tr>
      </ng-template>
      <ng-template #body let-row>
        <tr>
          <td>{{ row.transactionDate | date: 'short' }}</td>
          <td>{{ typeLabel(row.transactionType) }}</td>
          <td>{{ row.quantity }}</td>
          <td>{{ row.fromLocationName || '—' }}</td>
          <td>{{ row.toLocationName || '—' }}</td>
          <td>{{ row.serialNumber || '—' }}</td>
          <td>{{ row.performedByUserName || '—' }}</td>
          <td>{{ row.remarks }}</td>
        </tr>
      </ng-template>
    </p-table>
  `
})
export class PartTransactionsPanelComponent implements OnChanges {
  @Input() partId: number | null = null;
  rows: PartTransaction[] = [];
  typeLabelMap = new Map<number, string>();

  constructor(
    private transactionService: PartTransactionService,
    metadataService: MetadataService
  ) {
    metadataService.getEnums().subscribe({
      next: (res) => {
        const data = res?.result ?? res;
        (data?.PartTransactionType ?? []).forEach((x: any) => this.typeLabelMap.set(x.value, x.text));
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['partId'] && this.partId) {
      this.transactionService.filter({ pageNumber: 1, pageSize: 200, partId: this.partId }).subscribe({
        next: (data) => (this.rows = data)
      });
    }
  }

  typeLabel(v: number) {
    return this.typeLabelMap.get(v) ?? String(v);
  }
}
