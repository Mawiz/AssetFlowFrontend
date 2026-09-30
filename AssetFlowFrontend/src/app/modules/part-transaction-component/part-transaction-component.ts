import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PartTransaction, PartTransactionFilterDto } from '../../model/part-transaction';
import { PartTransactionService } from '../../services/part-transaction-service';
import { PartService } from '../../services/part-service';
import { Part } from '../../model/part';
import { MetadataService } from '@/services/metadata-service';

@Component({
  selector: 'app-part-transaction-component',
  standalone: true,
  templateUrl: './part-transaction-component.html',
  imports: [CommonModule, FormsModule, TableModule, ToolbarModule, SelectModule, ToastModule],
  providers: [MessageService]
})
export class PartTransactionComponent implements OnInit {
  rows = signal<PartTransaction[]>([]);
  totalRecords = 0;
  parts: Part[] = [];
  typeOptions: { label: string; value: number }[] = [];
  typeLabelMap = new Map<number, string>();

  filter: PartTransactionFilterDto = {
    pageNumber: 1,
    pageSize: 10,
    partId: null,
    transactionType: null
  };

  constructor(
    private transactionService: PartTransactionService,
    private partService: PartService,
    private metadataService: MetadataService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.metadataService.getEnums().subscribe({
      next: (res) => {
        const data = res?.result ?? res;
        this.typeOptions = (data?.PartTransactionType ?? []).map((x: any) => {
          this.typeLabelMap.set(x.value, x.text);
          return { label: x.text, value: x.value };
        });
      }
    });

    this.partService.filter({ pageNumber: 1, pageSize: 500, isActive: true }).subscribe({
      next: (data) => (this.parts = data)
    });
    this.load();
  }

  load() {
    this.transactionService.filter(this.filter).subscribe({
      next: (data) => {
        this.rows.set(data);
        this.totalRecords =
          data.length < this.filter.pageSize
            ? (this.filter.pageNumber - 1) * this.filter.pageSize + data.length
            : this.filter.pageNumber * this.filter.pageSize + 1;
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load transactions' })
    });
  }

  onPage(event: any) {
    this.filter.pageNumber = event.first / event.rows + 1;
    this.filter.pageSize = event.rows;
    this.load();
  }

  typeLabel(v: number) {
    return this.typeLabelMap.get(v) ?? String(v);
  }
}
