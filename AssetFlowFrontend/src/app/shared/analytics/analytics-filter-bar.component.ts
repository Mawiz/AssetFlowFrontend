import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { PeriodPreset } from '../../model/reporting';

@Component({
  selector: 'app-analytics-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, ButtonModule],
  template: `
    <div class="flex flex-wrap items-center gap-2">
      <p-select
        [options]="periodOptions"
        [(ngModel)]="periodPreset"
        (ngModelChange)="periodChange.emit($event)"
        optionLabel="label"
        optionValue="value"
        styleClass="w-44"
      />
      <p-button icon="pi pi-refresh" [loading]="loading" (onClick)="refresh.emit()" label="Refresh" />
      @if (lastUpdated) {
        <span class="text-muted-color text-sm ml-2">Updated {{ lastUpdated | date: 'short' }}</span>
      }
    </div>
  `
})
export class AnalyticsFilterBarComponent {
  @Input() periodPreset: PeriodPreset | string = '30Days';
  @Input() loading = false;
  @Input() lastUpdated: string | Date | null = null;
  @Output() periodChange = new EventEmitter<string>();
  @Output() refresh = new EventEmitter<void>();

  periodOptions = [
    { label: 'Today', value: 'Today' },
    { label: '7 days', value: '7Days' },
    { label: '30 days', value: '30Days' },
    { label: 'This month', value: 'ThisMonth' },
    { label: 'This quarter', value: 'ThisQuarter' },
    { label: 'This year', value: 'ThisYear' }
  ];
}
