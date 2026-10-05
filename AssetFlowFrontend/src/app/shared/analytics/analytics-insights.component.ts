import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AnalyticsInsight } from '../../model/reporting';

@Component({
  selector: 'app-analytics-insights',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex flex-col gap-2">
      @for (item of insights; track item.text) {
        @if (item.drillRoute) {
          <a
            class="card mb-0 py-3 px-4 border-l-4 block no-underline text-inherit cursor-pointer hover:surface-hover"
            [class.border-orange-500]="item.severity === 'warn'"
            [class.border-green-500]="item.severity === 'success'"
            [class.border-primary]="item.severity === 'info'"
            [routerLink]="item.drillRoute"
          >
            <span class="text-sm">{{ item.text }}</span>
          </a>
        } @else {
          <div
            class="card mb-0 py-3 px-4 border-l-4"
            [class.border-orange-500]="item.severity === 'warn'"
            [class.border-green-500]="item.severity === 'success'"
            [class.border-primary]="item.severity === 'info'"
          >
            <span class="text-sm">{{ item.text }}</span>
          </div>
        }
      }
      @if (!insights.length) {
        <p class="text-muted-color text-sm m-0">No insights for this period yet.</p>
      }
    </div>
  `
})
export class AnalyticsInsightsComponent {
  @Input() insights: AnalyticsInsight[] = [];
}
