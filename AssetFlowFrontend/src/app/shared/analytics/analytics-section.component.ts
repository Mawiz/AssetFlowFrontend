import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-analytics-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="mb-6">
      <div class="flex items-baseline justify-between gap-2 mb-3">
        <div>
          <h3 class="text-xl font-semibold m-0">{{ title }}</h3>
          @if (subtitle) {
            <p class="text-muted-color text-sm m-0 mt-1">{{ subtitle }}</p>
          }
        </div>
        <ng-content select="[actions]" />
      </div>
      <ng-content />
    </section>
  `
})
export class AnalyticsSectionComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
}
