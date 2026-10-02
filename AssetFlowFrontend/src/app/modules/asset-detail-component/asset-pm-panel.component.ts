import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { RouterModule } from '@angular/router';
import { PreventiveMaintenanceService } from '../../services/preventive-maintenance-service';
import { AssetPreventiveMaintenanceSummary } from '../../model/maintenance';

@Component({
  selector: 'app-asset-pm-panel',
  standalone: true,
  templateUrl: './asset-pm-panel.component.html',
  imports: [CommonModule, TableModule, RouterModule]
})
export class AssetPmPanelComponent implements OnChanges {
  @Input() assetId: number | null = null;
  summary: AssetPreventiveMaintenanceSummary | null = null;

  constructor(private pmService: PreventiveMaintenanceService) {}

  ngOnChanges(): void {
    if (this.assetId) {
      this.pmService.assetSummary(this.assetId).subscribe((s) => (this.summary = s ?? null));
    } else {
      this.summary = null;
    }
  }
}
