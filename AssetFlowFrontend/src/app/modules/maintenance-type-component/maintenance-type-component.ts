import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DrawerModule } from 'primeng/drawer';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { MaintenanceTypeService } from '../../services/maintenance-type-service';
import { MaintenanceType } from '../../model/maintenance';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';
import { ListFilterDto } from '../../model/list-filter';
import { readPagedList } from '../../utils/paged-list';

@Component({
  selector: 'app-maintenance-type-component',
  standalone: true,
  templateUrl: './maintenance-type-component.html',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    ToastModule,
    InputTextModule,
    TextareaModule,
    DrawerModule,
    InputNumberModule,
    CheckboxModule,
    HasPermissionDirective
  ],
  providers: [MessageService]
})
export class MaintenanceTypeComponent implements OnInit {
  Permissions = Permissions;
  rows = signal<MaintenanceType[]>([]);
  totalRecords = 0;
  filter: ListFilterDto = { pageNumber: 1, pageSize: 10, searchText: '' };
  drawerVisible = false;
  editModel: Partial<MaintenanceType> = { isActive: true, sortOrder: 0 };

  constructor(private service: MaintenanceTypeService, private messages: MessageService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.service.filter(this.filter).subscribe({
      next: (page) => {
        const { rows, total } = readPagedList<MaintenanceType>(page);
        this.rows.set(rows);
        this.totalRecords = total;
      },
      error: () => this.messages.add({ severity: 'error', summary: 'Error', detail: 'Load failed' })
    });
  }

  openNew() {
    this.editModel = { isActive: true, sortOrder: 0 };
    this.drawerVisible = true;
  }

  openEdit(row: MaintenanceType) {
    this.editModel = { ...row };
    this.drawerVisible = true;
  }

  save() {
    const obs = this.editModel.id
      ? this.service.update(this.editModel as MaintenanceType)
      : this.service.create(this.editModel);
    obs.subscribe({
      next: () => {
        this.drawerVisible = false;
        this.load();
        this.messages.add({ severity: 'success', summary: 'Saved' });
      },
      error: (e) =>
        this.messages.add({ severity: 'error', summary: 'Error', detail: e?.error?.errors?.[0] || 'Save failed' })
    });
  }

  onPage(e: { first?: number; rows?: number }) {
    this.filter.pageNumber = Math.floor((e.first ?? 0) / (e.rows ?? 10)) + 1;
    this.filter.pageSize = e.rows ?? 10;
    this.load();
  }
}
