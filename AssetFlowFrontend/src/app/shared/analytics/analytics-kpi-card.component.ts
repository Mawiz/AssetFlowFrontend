import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { KpiMetric } from '../../model/reporting';

@Component({
  selector: 'app-analytics-kpi-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (kpi.drillRoute) {
    <a
      class="card mb-0 h-full block no-underline text-inherit cursor-pointer hover:surface-hover transition-colors"
      [routerLink]="kpi.drillRoute"
      [queryParams]="parseQuery(kpi.drillQuery) ?? undefined"
    >
      <div class="flex justify-between items-start gap-2">
        <div class="flex-1 min-w-0">
          <span class="block text-muted-color text-sm font-medium mb-2">{{ kpi.label }}</span>
          <div class="text-surface-900 dark:text-surface-0 font-semibold text-2xl leading-none">
            {{ displayValue() }}
          </div>
          @if (kpi.changePercent != null && kpi.previousValue != null) {
            <div class="mt-2 text-sm" [class.text-green-600]="trendGood()" [class.text-red-500]="!trendGood()">
              {{ kpi.changePercent > 0 ? '↑' : '↓' }} {{ absChange() }}%
              <span class="text-muted-color"> vs prev. period</span>
            </div>
          }
        </div>
        <div class="flex items-center justify-center bg-primary/10 rounded-border shrink-0" style="width:2.5rem;height:2.5rem">
          <i class="pi pi-chart-line text-primary"></i>
        </div>
      </div>
    </a>
    } @else {
    <div class="card mb-0 h-full">
      <div class="flex justify-between items-start gap-2">
        <div class="flex-1 min-w-0">
          <span class="block text-muted-color text-sm font-medium mb-2">{{ kpi.label }}</span>
          <div class="text-surface-900 dark:text-surface-0 font-semibold text-2xl leading-none">
            {{ displayValue() }}
          </div>
          @if (kpi.changePercent != null && kpi.previousValue != null) {
            <div class="mt-2 text-sm" [class.text-green-600]="trendGood()" [class.text-red-500]="!trendGood()">
              {{ kpi.changePercent > 0 ? '↑' : '↓' }} {{ absChange() }}%
              <span class="text-muted-color"> vs prev. period</span>
            </div>
          }
        </div>
        <div class="flex items-center justify-center bg-primary/10 rounded-border shrink-0" style="width:2.5rem;height:2.5rem">
          <i class="pi pi-chart-line text-primary"></i>
        </div>
      </div>
    </div>
    }
  `
})
export class AnalyticsKpiCardComponent {
  @Input({ required: true }) kpi!: KpiMetric;

  displayValue(): string {
    if (this.kpi.value == null) return 'N/A';
    if (this.kpi.unit === 'percent') return `${this.kpi.value}%`;
    if (this.kpi.unit === 'currency') return this.kpi.value.toLocaleString(undefined, { maximumFractionDigits: 0 });
    if (this.kpi.unit === 'hours') return `${this.kpi.value.toLocaleString()} hrs`;
    return this.kpi.value.toLocaleString();
  }

  absChange(): string {
    return Math.abs(this.kpi.changePercent ?? 0).toFixed(1);
  }

  trendGood(): boolean {
    if (this.kpi.changePercent == null) return true;
    const up = this.kpi.changePercent > 0;
    return this.kpi.higherIsBetter ? up : !up;
  }

  parseQuery(q?: string | null): Record<string, string> | null {
    if (!q) return null;
    const params: Record<string, string> = {};
    q.split('&').forEach((pair) => {
      const [k, v] = pair.split('=');
      if (k && v) params[k] = v;
    });
    return params;
  }
}
