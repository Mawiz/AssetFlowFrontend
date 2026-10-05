import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ReportingService } from '../../services/reporting-service';
import { ManagementAnalytics, PeriodPreset, ReportingFilter, StackedCostMonth } from '../../model/reporting';
import { AnalyticsFilterBarComponent } from '../../shared/analytics/analytics-filter-bar.component';
import { AnalyticsKpiCardComponent } from '../../shared/analytics/analytics-kpi-card.component';
import { AnalyticsSectionComponent } from '../../shared/analytics/analytics-section.component';
import { AnalyticsInsightsComponent } from '../../shared/analytics/analytics-insights.component';
import { baseChartOptions, chartPalette } from '../../shared/analytics/analytics-chart-options';

@Component({
  selector: 'app-management-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ChartModule,
    TableModule,
    ProgressSpinnerModule,
    AnalyticsFilterBarComponent,
    AnalyticsKpiCardComponent,
    AnalyticsSectionComponent,
    AnalyticsInsightsComponent
  ],
  templateUrl: './management-dashboard.html'
})
export class ManagementDashboard implements OnInit {
  periodPreset: PeriodPreset | string = '30Days';
  loading = signal(true);
  error = signal(false);
  data = signal<ManagementAnalytics | null>(null);

  healthChart = signal<any>(null);
  activityChart = signal<any>(null);
  pipelineChart = signal<any>(null);
  costChart = signal<any>(null);
  downtimeChart = signal<any>(null);
  partsChart = signal<any>(null);

  chartOptions = baseChartOptions(true);
  barOptions = { ...baseChartOptions(false), indexAxis: 'y' as const };
  doughnutOptions = { ...baseChartOptions(true), cutout: '65%' };
  stackedBarOptions = (() => {
    const base = baseChartOptions(true);
    return { ...base, scales: { x: { ...base.scales?.x, stacked: true }, y: { ...base.scales?.y, stacked: true } } };
  })();

  constructor(private reportingService: ReportingService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    const filter: ReportingFilter = { periodPreset: this.periodPreset };
    this.reportingService.getManagementAnalytics(filter).subscribe({
      next: (d) => {
        this.data.set(d);
        this.buildCharts(d);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  onPeriodChange(p: string): void {
    this.periodPreset = p;
    this.load();
  }

  private buildCharts(d: ManagementAnalytics): void {
    const s = d.summary.asset;
    this.healthChart.set({
      labels: ['Operational', 'Under maint.', 'Breakdown', 'Retired'],
      datasets: [{ data: [s.operational, s.underMaintenance, s.breakdown, s.retired], backgroundColor: chartPalette }]
    });

    const act = d.maintenanceActivity;
    this.activityChart.set({
      labels: act.labels,
      datasets: act.series.map((ser, i) => ({
        label: ser.name,
        data: ser.values,
        borderColor: chartPalette[i % chartPalette.length],
        backgroundColor: chartPalette[i % chartPalette.length] + '33',
        fill: i === 0,
        tension: 0.35
      }))
    });

    this.pipelineChart.set({
      labels: d.workOrderPipeline.map((p) => p.label),
      datasets: [{ label: 'Open WOs', data: d.workOrderPipeline.map((p) => p.value), backgroundColor: chartPalette[0] }]
    });

    this.costChart.set(this.stackedCost(d.costTrendStacked));
    this.downtimeChart.set({
      labels: d.downtimeTrend.map((t) => t.label),
      datasets: [{ label: 'Breakdown events', data: d.downtimeTrend.map((t) => t.value), fill: true, tension: 0.3, borderColor: chartPalette[3] }]
    });
    this.partsChart.set({
      labels: d.stockByLocation.map((x) => x.label),
      datasets: [{ data: d.stockByLocation.map((x) => x.value), backgroundColor: chartPalette[1] }]
    });
  }

  private stackedCost(rows: StackedCostMonth[]) {
    return {
      labels: rows.map((r) => r.label),
      datasets: [
        { label: 'Labor', data: rows.map((r) => r.labor), backgroundColor: chartPalette[0], stack: 'cost' },
        { label: 'Parts', data: rows.map((r) => r.parts), backgroundColor: chartPalette[1], stack: 'cost' },
        { label: 'External', data: rows.map((r) => r.external), backgroundColor: chartPalette[2], stack: 'cost' },
        { label: 'Other', data: rows.map((r) => r.other), backgroundColor: chartPalette[4], stack: 'cost' }
      ]
    };
  }

  formatMinutes(v: number): string {
    if (v >= 60) return `${(v / 60).toFixed(1)} hrs`;
    return `${Math.round(v)} min`;
  }
}
