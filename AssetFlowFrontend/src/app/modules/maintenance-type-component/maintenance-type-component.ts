import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
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
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    ToastModule,
    InputTextModule,
    TextareaModule,
    DrawerModule,
    InputNumberModule,
    CheckboxModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
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
  isEditing = false;
  submitted = false;
  form!: FormGroup;

  constructor(
    private service: MaintenanceTypeService,
    private messages: MessageService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.initForm();
    this.load();
  }

  initForm() {
    this.form = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      code: ['', Validators.required],
      description: [''],
      sortOrder: [0],
      isActive: [true]
    });
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

  onSearch() {
    this.filter.pageNumber = 1;
    this.load();
  }

  openNew() {
    this.isEditing = false;
    this.submitted = false;
    this.form.reset({ sortOrder: 0, isActive: true });
    this.drawerVisible = true;
  }

  editItem(row: MaintenanceType) {
    this.isEditing = true;
    this.submitted = false;
    this.form.patchValue({ ...row });
    this.drawerVisible = true;
  }

  hideDrawer() {
    this.drawerVisible = false;
    this.submitted = false;
  }

  save() {
    this.submitted = true;
    if (this.form.invalid) return;
    const payload = this.form.getRawValue();
    const obs = payload.id ? this.service.update(payload) : this.service.create(payload);
    obs.subscribe({
      next: () => {
        this.hideDrawer();
        this.load();
        this.messages.add({ severity: 'success', summary: 'Saved', detail: 'Maintenance type saved successfully' });
      },
      error: (e) =>
        this.messages.add({ severity: 'error', summary: 'Error', detail: e?.error?.errors?.[0] || 'Save failed' })
    });
  }

  onPage(event: { page?: number; rows?: number; first?: number }) {
    this.filter.pageNumber = event.page != null ? event.page + 1 : Math.floor((event.first ?? 0) / (event.rows ?? 10)) + 1;
    this.filter.pageSize = event.rows ?? 10;
    this.load();
  }
}
