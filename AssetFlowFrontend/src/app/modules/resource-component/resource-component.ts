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
import { TextareaModule } from 'primeng/textarea';
import { DrawerModule } from 'primeng/drawer';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { CheckboxModule } from 'primeng/checkbox';
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
    TextareaModule,
    IconFieldModule,
    InputIconModule,
    CheckboxModule,
    TagModule,
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
      verb: [''],
      isBackEnd: [false],
      subResources: this.fb.array([])
    });
  }

  get subResources(): FormArray {
    return this.form.get('subResources') as FormArray;
  }

  addSubResource(sub?: SubResourceDto) {
    const group = this.fb.group({
      id: [sub?.id || 0],
      resourceName: [sub?.resourceName || '', Validators.required],
      verb: [sub?.verb || ''],
      isBackEnd: [sub?.isBackEnd || false]
    });
    this.subResources.push(group);
  }

  removeSubResource(index: number) {
    this.subResources.removeAt(index);
  }

  // No trackBy for sub-resources to avoid index reuse issues when items are removed.

  loadResources() {
    this.service.getAll().subscribe({
      next: (res) => this.resources.set(res || []),
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load resources'
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
  }

  editResource(res: ResourceDto) {
    this.isEditing = true;
    this.drawerVisible = true;
    this.selectedResourceId = res.id;
    this.form.reset();
    this.subResources.clear();

    this.form.patchValue({
      resourceName: res.resourceName,
      verb: res.verb,
      isBackEnd: res.isBackEnd
    });

    res.subResources?.forEach(sr => this.addSubResource(sr));
  }

  hideDrawer() {
    this.drawerVisible = false;
    this.submitted = false;
  }

  saveResource() {
    this.submitted = true;
    if (this.form.invalid) return;

    const dto = this.form.value;

    const payload: CreateResourceDto | UpdateResourceDto = {
      ...(this.isEditing ? { id: this.selectedResourceId! } : {}),
      resourceName: dto.resourceName,
      verb: dto.verb ?? '',
      isBackEnd: dto.isBackEnd,
      subResources: dto.subResources
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
          detail: `Resource ${this.isEditing ? 'updated' : 'created'} successfully`
        });
      },
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${this.isEditing ? 'update' : 'create'} resource`
        })
    });
  }

  deleteResource(res: ResourceDto) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${res.resourceName}"?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Assuming API delete is available
        // this.service.delete(res.id).subscribe(...)
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Resource deleted successfully (API delete not implemented)'
        });
      }
    });
  }

  onGlobalFilter(event: Event, table: Table) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
