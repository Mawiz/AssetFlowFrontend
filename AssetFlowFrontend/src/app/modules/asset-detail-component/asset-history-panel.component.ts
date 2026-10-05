import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AssetHistoryService } from '../../services/asset-history-service';
import { MaintenanceCostService } from '../../services/maintenance-cost-service';
import {
  AssetCostHistoryRow,
  AssetCostSummary,
  AssetHistoryEvent,
  AssetHistoryFilter,
  AssetHistorySummary,
  MaintenanceCostUpsert
} from '../../model/asset-history';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';

@Component({
  selector: 'app-asset-history-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TabsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DatePickerModule,
    DialogModule,
    SelectModule,
    InputNumberModule,
    ToastModule,
    HasPermissionDirective
  ],
  providers: [MessageService],
  templateUrl: './asset-history-panel.component.html'
})
export class AssetHistoryPanelComponent implements OnChanges {
  Permissions = Permissions;
  @Input() assetId!: number;
  @Input() tenantId: number | null = null;

  summary: AssetHistorySummary | null = null;
  costSummary: AssetCostSummary | null = null;
  timeline: AssetHistoryEvent[] = [];
  timelineTotal = 0;
  maintenanceRows: unknown[] = [];
  breakdownRows: unknown[] = [];
  workOrderRows: unknown[] = [];
  partsRows: unknown[] = [];
  downtimeRows: unknown[] = [];
  costRows: AssetCostHistoryRow[] = [];

  filter: AssetHistoryFilter = { assetId: 0, pageNumber: 1, pageSize: 15 };
  costDialogVisible = false;
  costForm: MaintenanceCostUpsert = {
    assetId: 0,
    costType: 2,
    amount: 0,
    currency: 'USD',
    costDate: new Date()
  };
  costTypeOptions = [
    { label: 'Labor', value: 1 },
    { label: 'Parts', value: 2 },
    { label: 'External service', value: 3 },
    { label: 'Other', value: 4 }
  ];

  constructor(
    private historyService: AssetHistoryService,
    private costService: MaintenanceCostService,
    private messages: MessageService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['assetId'] && this.assetId) {
      this.filter.assetId = this.assetId;
      this.loadAll();
    }
  }

  loadAll() {
    this.historyService.getSummary(this.assetId).subscribe((s) => (this.summary = s));
    this.loadTimeline();
    this.loadTabData();
    this.historyService.getCostSummary(this.assetId, this.filter).subscribe((s) => (this.costSummary = s));
    this.historyService.getCostHistory(this.filter).subscribe((r) => (this.costRows = r));
  }

  loadTimeline() {
    this.historyService.getTimeline(this.filter).subscribe((p) => {
      this.timeline = p.items;
      this.timelineTotal = p.totalCount;
    });
  }

  loadTabData() {
    this.historyService.getMaintenanceHistory(this.filter).subscribe((r) => (this.maintenanceRows = r));
    this.historyService.getBreakdownHistory(this.filter).subscribe((r) => (this.breakdownRows = r));
    this.historyService.getWorkOrderHistory(this.filter).subscribe((r) => (this.workOrderRows = r));
    this.historyService.getPartsHistory(this.filter).subscribe((r) => (this.partsRows = r));
    this.historyService.getDowntimeHistory(this.filter).subscribe((r) => (this.downtimeRows = r));
  }

  onFilterApply() {
    this.filter.pageNumber = 1;
    this.loadAll();
  }

  openAddCost() {
    this.costForm = {
      assetId: this.assetId,
      tenantId: this.tenantId,
      costType: 2,
      amount: 0,
      currency: 'USD',
      costDate: new Date(),
      description: ''
    };
    this.costDialogVisible = true;
  }

  saveCost() {
    this.costService.upsertCost(this.costForm).subscribe({
      next: () => {
        this.costDialogVisible = false;
        this.messages.add({ severity: 'success', summary: 'Saved', detail: 'Cost recorded' });
        this.loadAll();
      },
      error: (e) =>
        this.messages.add({ severity: 'error', summary: 'Error', detail: e?.error?.errors?.[0] || 'Save failed' })
    });
  }

  formatMinutes(m: number): string {
    if (!m) return '0';
    const h = Math.floor(m / 60);
    const min = Math.round(m % 60);
    return h ? `${h}h ${min}m` : `${min}m`;
  }
}
