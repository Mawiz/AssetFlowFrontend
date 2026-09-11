import { Component, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { DrawerModule } from 'primeng/drawer';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { CardModule } from 'primeng/card';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CreateResourceDto, ResourceDto, SubResourceDto, UpdateResourceDto } from '../../model/resource';
import { ResourceService } from '@/services/resource-service';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';

@Component({
  selector: 'app-resource-component',
  standalone: true,
  templateUrl: './resource-component.html',
  styleUrls: ['./resource-component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    RippleModule,
    ToastModule,
    ConfirmDialogModule,
    DrawerModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    CardModule,
    HasPermissionDirective
  ],
  providers: [MessageService, ConfirmationService]
})
export class ResourceComponent implements OnInit {
  readonly Permissions = Permissions;
  @ViewChild('dt') dt!: Table;

  resources = signal<ResourceDto[]>([]);
  selectedResources!: ResourceDto[] | null;
  drawerVisible = false;
  form!: FormGroup;
  submitted = false;
  isEditing = false;
  selectedResourceId: number | null = null;
  duplicatePermissionError = '';

  constructor(
    private fb: FormBuilder,
    private service: ResourceService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadResources();
  }

  initForm() {
    this.form = this.fb.group({
      resourceName: ['', Validators.required],
      subResources: this.fb.array([])
    });
  }

  get subResources(): FormArray {
    return this.form.get('subResources') as FormArray;
  }

  addSubResource(sub?: SubResourceDto) {
    const group = this.fb.group({
      id: [sub?.id || 0],
      resourceName: [sub?.resourceName || '', Validators.required]
    });
    this.subResources.push(group);
  }

  removeSubResource(index: number) {
    this.subResources.removeAt(index);
  }

  loadResources() {
    this.service.getAll().subscribe({
      next: (res) => this.resources.set(res || []),
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load permissions'
        })
    });
  }

  openNew() {
    this.form.reset();
    this.subResources.clear();
    this.drawerVisible = true;
    this.submitted = false;
    this.isEditing = false;
    this.selectedResourceId = null;
    this.duplicatePermissionError = '';
  }

  editResource(res: ResourceDto) {
    this.isEditing = true;
    this.drawerVisible = true;
    this.selectedResourceId = res.id;
    this.submitted = false;
    this.duplicatePermissionError = '';
    this.form.reset();
    this.subResources.clear();

    this.form.patchValue({
      resourceName: res.resourceName
    });

    res.subResources?.forEach(sr => this.addSubResource(sr));
  }

  hideDrawer() {
    this.drawerVisible = false;
    this.submitted = false;
    this.duplicatePermissionError = '';
  }

  saveResource() {
    this.submitted = true;
    this.duplicatePermissionError = this.getDuplicatePermissionError();
    if (this.form.invalid || this.duplicatePermissionError) return;

    const dto = this.form.value;

    const payload: CreateResourceDto | UpdateResourceDto = {
      ...(this.isEditing ? { id: this.selectedResourceId! } : {}),
      resourceName: dto.resourceName,
      verb: '',
      isBackEnd: false,
      subResources: (dto.subResources || []).map((s: { id?: number; resourceName?: string }) => ({
        id: s.id || 0,
        resourceName: s.resourceName,
        verb: '',
        isBackEnd: false
      }))
    };

    const request = this.isEditing
      ? this.service.update(payload as UpdateResourceDto)
      : this.service.create(payload as CreateResourceDto);

    request.subscribe({
      next: () => {
        this.loadResources();
        this.drawerVisible = false;
        this.messageService.add({
          severity: 'success',
          summary: this.isEditing ? 'Updated' : 'Created',
          detail: `Feature ${this.isEditing ? 'updated' : 'created'} successfully`
        });
      },
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${this.isEditing ? 'update' : 'create'} feature`
        })
    });
  }

  private getDuplicatePermissionError(): string {
    const featureName = (this.form.value.resourceName || '').trim().toLowerCase();
    const names = (this.form.value.subResources || [])
      .map((s: { resourceName?: string }) => (s.resourceName || '').trim())
      .filter((n: string) => n.length > 0);

    const seen = new Set<string>();
    for (const name of names) {
      const key = name.toLowerCase();
      if (key === featureName) {
        return 'A permission cannot have the same name as its feature.';
      }
      if (seen.has(key)) {
        return 'A feature cannot have two permissions with the same name.';
      }
      seen.add(key);
    }
    return '';
  }

  deleteResource(res: ResourceDto) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${res.resourceName}"?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Feature deleted successfully (API delete not implemented)'
        });
      }
    });
  }

  onGlobalFilter(event: Event, table: Table) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
