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
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { MaintenanceChecklistService } from '../../services/maintenance-checklist-service';
import { MaintenanceTypeService } from '../../services/maintenance-type-service';
import { MaintenanceChecklist, MaintenanceChecklistItem } from '../../model/maintenance';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';
import { MetadataService } from '@/services/metadata-service';
import { ListFilterDto } from '../../model/list-filter';
import { readPagedList } from '../../utils/paged-list';

@Component({
  selector: 'app-maintenance-checklist-component',
  standalone: true,
  templateUrl: './maintenance-checklist-component.html',
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
    SelectModule,
    CheckboxModule,
    HasPermissionDirective
  ],
  providers: [MessageService]
})
export class MaintenanceChecklistComponent implements OnInit {
  Permissions = Permissions;
  rows = signal<MaintenanceChecklist[]>([]);
  totalRecords = 0;
  filter: ListFilterDto = { pageNumber: 1, pageSize: 10, searchText: '' };
  drawerVisible = false;
  editModel: Partial<MaintenanceChecklist> & { items: MaintenanceChecklistItem[] } = { isActive: true, items: [] };
  maintenanceTypes: { label: string; value: number }[] = [];
  responseTypes: { label: string; value: number }[] = [];

  constructor(
    private service: MaintenanceChecklistService,
    private typeService: MaintenanceTypeService,
    private metadata: MetadataService,
    private messages: MessageService
  ) {}

  ngOnInit() {
    this.metadata.getEnums().subscribe((res: any) => {
      const data = res?.result ?? res;
      this.responseTypes = (data?.ChecklistResponseType ?? []).map((x: any) => ({ label: x.text, value: x.value }));
    });
    this.typeService.getAll().subscribe((t) => (this.maintenanceTypes = t.map((x) => ({ label: x.name, value: x.id }))));
    this.load();
  }

  load() {
    this.service.filter(this.filter).subscribe({
      next: (page) => {
        const { rows, total } = readPagedList<MaintenanceChecklist>(page);
        this.rows.set(rows);
        this.totalRecords = total;
      }
    });
  }

  openNew() {
    this.editModel = { isActive: true, items: [this.newItem(1)] };
    this.drawerVisible = true;
  }

  openEdit(row: MaintenanceChecklist) {
    this.service.getById(row.id).subscribe((c) => {
      this.editModel = { ...c, items: c.items?.length ? [...c.items] : [this.newItem(1)] };
      this.drawerVisible = true;
    });
  }

  newItem(sort: number): MaintenanceChecklistItem {
    return { itemText: '', responseType: 1, isRequired: true, sortOrder: sort, isActive: true, options: [] };
  }

  addItem() {
    this.editModel.items.push(this.newItem(this.editModel.items.length + 1));
  }

  addOption(item: MaintenanceChecklistItem) {
    if (!item.options) item.options = [];
    item.options.push({ optionText: '', sortOrder: item.options.length + 1, isActive: true });
  }

  save() {
    const payload = {
      id: this.editModel.id,
      tenantId: this.editModel.tenantId,
      name: this.editModel.name,
      code: this.editModel.code,
      description: this.editModel.description,
      maintenanceTypeId: this.editModel.maintenanceTypeId,
      isActive: this.editModel.isActive,
      items: this.editModel.items
    };
    const obs = this.editModel.id ? this.service.update(payload) : this.service.create(payload);
    obs.subscribe({
      next: () => {
        this.drawerVisible = false;
        this.load();
        this.messages.add({ severity: 'success', summary: 'Saved' });
      },
      error: (e) => this.messages.add({ severity: 'error', summary: 'Error', detail: e?.error?.errors?.[0] || 'Save failed' })
    });
  }

  onPage(e: { first?: number; rows?: number }) {
    this.filter.pageNumber = Math.floor((e.first ?? 0) / (e.rows ?? 10)) + 1;
    this.filter.pageSize = e.rows ?? 10;
    this.load();
  }
}
