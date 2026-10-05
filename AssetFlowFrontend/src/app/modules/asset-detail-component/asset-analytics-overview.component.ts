import { Component, Input, OnChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { ReportingService } from '../../services/reporting-service';
import { AssetDetailAnalytics } from '../../model/reporting';
import { AnalyticsKpiCardComponent } from '../../shared/analytics/analytics-kpi-card.component';
import { baseChartOptions, chartPalette } from '../../shared/analytics/analytics-chart-options';

@Component({
  selector: 'app-asset-analytics-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, ChartModule, AnalyticsKpiCardComponent],
  template: `
    @if (loading()) {
      <p class="text-muted-color text-sm">Loading asset analytics…</p>
    } @else {
      @if (data(); as d) {
      <div class="grid grid-cols-12 gap-3 mb-4">
        @for (k of d.kpis; track k.key) {
          <div class="col-span-12 sm:col-span-6 lg:col-span-3"><app-analytics-kpi-card [kpi]="k" /></div>
        }
        <div class="col-span-12 sm:col-span-6 lg:col-span-3 card mb-0 p-3">
          <span class="text-muted-color text-sm">MTBF</span>
          <div class="text-xl font-semibold">{{ d.mtbfHours ?? 'N/A' }}@if (d.mtbfHours != null) { hrs}</div>
        </div>
        <div class="col-span-12 sm:col-span-6 lg:col-span-3 card mb-0 p-3">
          <span class="text-muted-color text-sm">MTTR</span>
          <div class="text-xl font-semibold">{{ d.mttrHours ?? 'N/A' }}@if (d.mttrHours != null) { hrs}</div>
        </div>
      </div>
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12 lg:col-span-6">
          <div class="card mb-0">
            <span class="font-medium block mb-2">Breakdown trend</span>
            <p-chart type="line" [data]="breakdownChart()" [options]="chartOptions" class="h-14rem" />
          </div>
        </div>
        <div class="col-span-12 lg:col-span-6">
          <div class="card mb-0 text-sm">
            <div>Last maintenance: {{ d.lastMaintenance ? (d.lastMaintenance | date:'mediumDate') : 'N/A' }}</div>
            <div class="mt-2">Next PM due: {{ d.nextMaintenanceDue ? (d.nextMaintenanceDue | date:'mediumDate') : 'N/A' }}</div>
            <a class="inline-block mt-3" [routerLink]="['/modules/assets', assetId]" fragment="history">View full service history →</a>
          </div>
        </div>
      </div>
      }
    }
  `
})
export class AssetAnalyticsOverviewComponent implements OnChanges {
  @Input({ required: true }) assetId!: number;
  loading = signal(false);
  data = signal<AssetDetailAnalytics | null>(null);
  breakdownChart = signal<any>(null);
  chartOptions = baseChartOptions(false);

  constructor(private reporting: ReportingService) {}

  ngOnChanges(): void {
    if (!this.assetId) return;
    this.loading.set(true);
    this.reporting.getAssetDetailAnalytics(this.assetId, { periodPreset: 'ThisYear' }).subscribe({
      next: (d) => {
        this.data.set(d);
        this.breakdownChart.set({
          labels: d.breakdownTrend.map((x) => x.label),
          datasets: [{ data: d.breakdownTrend.map((x) => x.value), borderColor: chartPalette[3], tension: 0.3, fill: false }]
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
