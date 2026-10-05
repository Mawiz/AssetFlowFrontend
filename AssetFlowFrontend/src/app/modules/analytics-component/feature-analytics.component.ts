import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ReportingService } from '../../services/reporting-service';
import { PeriodPreset, ReportingFilter } from '../../model/reporting';
import { AnalyticsFilterBarComponent } from '../../shared/analytics/analytics-filter-bar.component';
import { AnalyticsKpiCardComponent } from '../../shared/analytics/analytics-kpi-card.component';
import { AnalyticsSectionComponent } from '../../shared/analytics/analytics-section.component';
import { baseChartOptions, chartPalette } from '../../shared/analytics/analytics-chart-options';

type AnalyticsMode = 'assets' | 'maintenance' | 'reliability' | 'work-orders' | 'spare-parts' | 'cost' | 'performance';

@Component({
  selector: 'app-feature-analytics',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ChartModule,
    TableModule,
    ProgressSpinnerModule,
    AnalyticsFilterBarComponent,
    AnalyticsKpiCardComponent,
    AnalyticsSectionComponent
  ],
  templateUrl: './feature-analytics.component.html'
})
export class FeatureAnalyticsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private reporting = inject(ReportingService);

  mode = signal<AnalyticsMode>('assets');
  title = signal('Analytics');
  periodPreset: PeriodPreset | string = '30Days';
  loading = signal(true);
  payload = signal<any>(null);
  charts = signal<Record<string, unknown>>({});

  chartOptions = baseChartOptions(true);
  barH = { ...baseChartOptions(false), indexAxis: 'y' as const };

  ngOnInit(): void {
    this.route.data.subscribe((d) => {
      this.mode.set(d['mode'] as AnalyticsMode);
      this.title.set(d['title'] ?? 'Analytics');
      this.load();
    });
  }

  load(): void {
    this.loading.set(true);
    const filter: ReportingFilter = { periodPreset: this.periodPreset };
    const done = { next: (p: unknown) => { this.payload.set(p); this.buildCharts(p); this.loading.set(false); }, error: () => this.loading.set(false) };
    switch (this.mode()) {
      case 'assets': this.reporting.getAssetAnalyticsDashboard(filter).subscribe(done); break;
      case 'maintenance': this.reporting.getMaintenanceAnalyticsDashboard(filter).subscribe(done); break;
      case 'reliability': this.reporting.getReliabilityAnalyticsDashboard(filter).subscribe(done); break;
      case 'work-orders': this.reporting.getWorkOrderAnalyticsDashboard(filter).subscribe(done); break;
      case 'spare-parts': this.reporting.getSparePartsAnalyticsDashboard(filter).subscribe(done); break;
      case 'cost': this.reporting.getCostAnalyticsDashboard(filter).subscribe(done); break;
      case 'performance': this.reporting.getTeamPerformanceDashboard(filter).subscribe(done); break;
    }
  }

  onPeriodChange(p: string): void {
    this.periodPreset = p;
    this.load();
  }

  private buildCharts(p: any): void {
    const c: Record<string, unknown> = {};
    if (this.mode() === 'assets' && p?.summary) {
      c['status'] = { labels: p.summary.statusDistribution.map((x: any) => x.label), datasets: [{ data: p.summary.statusDistribution.map((x: any) => x.value), backgroundColor: chartPalette }] };
      c['category'] = { labels: p.summary.byCategory.map((x: any) => x.label), datasets: [{ data: p.summary.byCategory.map((x: any) => x.value), backgroundColor: chartPalette[0] }] };
    }
    if (this.mode() === 'reliability' && p?.breakdown) {
      c['trend'] = { labels: p.breakdown.trend.map((x: any) => x.label), datasets: [{ data: p.breakdown.trend.map((x: any) => x.value), borderColor: chartPalette[3], fill: false, tension: 0.3 }] };
      c['scatter'] = {
        datasets: [{ label: 'MTBF vs MTTR', data: (p.mtbfMttrScatter ?? []).map((s: any) => ({ x: s.x, y: s.y })), backgroundColor: chartPalette[0] }]
      };
    }
    if (this.mode() === 'work-orders' && p?.statusPipeline) {
      c['pipeline'] = { labels: p.statusPipeline.map((x: any) => x.label), datasets: [{ data: p.statusPipeline.map((x: any) => x.value), backgroundColor: chartPalette[1] }] };
      c['aging'] = { labels: p.aging.map((x: any) => x.label), datasets: [{ data: p.aging.map((x: any) => x.count), backgroundColor: chartPalette[2] }] };
    }
    if (this.mode() === 'spare-parts' && p?.consumptionTrend) {
      c['consumption'] = { labels: p.consumptionTrend.map((x: any) => x.label), datasets: [{ data: p.consumptionTrend.map((x: any) => x.value), borderColor: chartPalette[4], tension: 0.3 }] };
      c['health'] = { labels: p.inventoryHealth.map((x: any) => x.label), datasets: [{ data: p.inventoryHealth.map((x: any) => x.value), backgroundColor: chartPalette }] };
    }
    if (this.mode() === 'cost' && p?.report) {
      c['costMonth'] = { labels: p.report.byMonth.map((x: any) => x.label), datasets: [{ data: p.report.byMonth.map((x: any) => x.value), backgroundColor: chartPalette[0] }] };
    }
    this.charts.set(c);
  }

  chart(key: string): any {
    return this.charts()[key];
  }
}
