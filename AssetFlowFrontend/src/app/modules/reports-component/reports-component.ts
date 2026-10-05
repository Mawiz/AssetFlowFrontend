import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { RouterModule } from '@angular/router';
import { ReportingService } from '../../services/reporting-service';
import {
  AssetReportBundle,
  BreakdownReportBundle,
  CostReportBundle,
  MaintenanceReportBundle,
  PerformanceReportBundle,
  PeriodPreset,
  ReportingFilter,
  SparePartsReportBundle
} from '../../model/reporting';

@Component({
  selector: 'app-reports-component',
  standalone: true,
  templateUrl: './reports-component.html',
  imports: [CommonModule, FormsModule, TabsModule, SelectModule, ButtonModule, TableModule, ChartModule, RouterModule]
})
export class ReportsComponent implements OnInit {
  activeTab = 'assets';
  periodPreset: PeriodPreset = 'ThisMonth';
  loading = false;

  periodOptions = [
    { label: 'Today', value: 'Today' },
    { label: 'This week', value: 'ThisWeek' },
    { label: 'This month', value: 'ThisMonth' },
    { label: 'Last month', value: 'LastMonth' },
    { label: 'This quarter', value: 'ThisQuarter' },
    { label: 'This year', value: 'ThisYear' }
  ];

  assetReport: AssetReportBundle | null = null;
  maintenanceReport: MaintenanceReportBundle | null = null;
  breakdownReport: BreakdownReportBundle | null = null;
  partsReport: SparePartsReportBundle | null = null;
  costReport: CostReportBundle | null = null;
  performanceReport: PerformanceReportBundle | null = null;

  pmTrendChart: { labels: string[]; datasets: unknown[] } = { labels: [], datasets: [] };
  breakdownTrendChart: { labels: string[]; datasets: unknown[] } = { labels: [], datasets: [] };
  chartOptions = { maintainAspectRatio: false };

  constructor(private reportingService: ReportingService) {}

  ngOnInit(): void {
    this.loadTab(this.activeTab);
  }

  onTabChange(tab: string | number | undefined): void {
    if (typeof tab === 'string') this.loadTab(tab);
  }

  refreshActive(): void {
    this.loadTab(this.activeTab);
  }

  private filter(): ReportingFilter {
    return { periodPreset: this.periodPreset, pageSize: 50 };
  }

  private loadTab(tab: string): void {
    this.loading = true;
    const f = this.filter();
    const done = () => (this.loading = false);

    switch (tab) {
      case 'assets':
        this.reportingService.getAssetReport(f).subscribe({
          next: (r) => { this.assetReport = r; done(); },
          error: done
        });
        break;
      case 'maintenance':
        this.reportingService.getMaintenanceReport(f).subscribe({
          next: (r) => {
            this.maintenanceReport = r;
            this.pmTrendChart = {
              labels: r.preventiveMaintenance.completionTrend.map((p) => p.label),
              datasets: [{ label: 'PM completed', data: r.preventiveMaintenance.completionTrend.map((p) => p.value), backgroundColor: '#42A5F5' }]
            };
            done();
          },
          error: done
        });
        break;
      case 'breakdowns':
        this.reportingService.getBreakdownReport(f).subscribe({
          next: (r) => {
            this.breakdownReport = r;
            this.breakdownTrendChart = {
              labels: r.trend.map((p) => p.label),
              datasets: [{ label: 'Breakdowns', data: r.trend.map((p) => p.value), fill: false, borderColor: '#EF5350' }]
            };
            done();
          },
          error: done
        });
        break;
      case 'parts':
        this.reportingService.getSparePartsReport(f).subscribe({
          next: (r) => { this.partsReport = r; done(); },
          error: done
        });
        break;
      case 'costs':
        this.reportingService.getCostReport(f).subscribe({
          next: (r) => { this.costReport = r; done(); },
          error: done
        });
        break;
      case 'performance':
        this.reportingService.getPerformanceReport(f).subscribe({
          next: (r) => { this.performanceReport = r; done(); },
          error: done
        });
        break;
      default:
        done();
    }
  }
}
