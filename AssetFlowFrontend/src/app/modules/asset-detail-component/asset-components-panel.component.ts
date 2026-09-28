import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AssetComponentService } from '../../services/asset-component-service';
import { MetadataService } from '../../services/metadata-service';
import {
  AssetComponentItem,
  AssetComponentFilterDto,
  CreateAssetComponentItem,
  UpdateAssetComponentItem
} from '../../model/asset-component-item';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';

@Component({
  selector: 'app-asset-components-panel',
  standalone: true,
  templateUrl: './asset-components-panel.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    InputIconModule,
    IconFieldModule,
    DrawerModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    CheckboxModule,
    DatePickerModule,
    InputNumberModule,
    ToastModule,
    ConfirmDialogModule,
    HasPermissionDirective
  ],
  providers: [MessageService, ConfirmationService]
})
export class AssetComponentsPanelComponent implements OnInit, OnChanges {
  readonly Permissions = Permissions;
  @Input() assetId!: number;
  @Input() tenantId: number | null = null;
  @ViewChild('dt') dt!: Table;

  components = signal<AssetComponentItem[]>([]);
  totalRecords = 0;
  filter: AssetComponentFilterDto = { pageNumber: 1, pageSize: 10, assetId: 0, searchText: '' };
  form!: FormGroup;
  drawerVisible = false;
  submitted = false;
  isEditing = false;
  selectedId: number | null = null;
  statusOptions: { label: string; value: number }[] = [];
  lifeUnitOptions: { label: string; value: number }[] = [];
  statusLabelMap = new Map<number, string>();

  constructor(
    private fb: FormBuilder,
    private service: AssetComponentService,
    private metadataService: MetadataService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadEnums();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['assetId'] && this.assetId) {
      this.filter.assetId = this.assetId;
      this.loadComponents();
    }
  }

  initForm() {
    this.form = this.fb.group({
      componentCode: ['', Validators.required],
      componentName: ['', Validators.required],
      partNumber: [''],
      serialNumber: [''],
      manufacturer: [''],
      supplierName: [''],
      installationDate: [null as Date | null],
      installationLocation: [''],
      expectedLifeValue: [null as number | null],
      expectedLifeUnit: [null as number | null],
      currentStatus: [1, Validators.required],
      currentRunningHours: [null as number | null],
      warrantyStartDate: [null as Date | null],
      warrantyEndDate: [null as Date | null],
      notes: [''],
      isActive: [true]
    });
  }

  loadEnums() {
    this.metadataService.getEnums().subscribe({
      next: (res) => {
        const data = res?.result ?? res;
        this.statusOptions = (data?.ComponentCurrentStatus ?? []).map((x: any) => {
          this.statusLabelMap.set(x.value, x.text);
          return { label: x.text, value: x.value };
        });
        this.lifeUnitOptions = (data?.ExpectedLifeUnit ?? []).map((x: any) => ({
          label: x.text,
          value: x.value
        }));
      }
    });
  }

  loadComponents() {
    if (!this.assetId) return;
    this.filter.assetId = this.assetId;
    this.service.filter(this.filter).subscribe({
      next: (data) => {
        this.components.set(data);
        this.totalRecords = data.length;
      }
    });
  }

  onSearch() {
    this.filter.pageNumber = 1;
    this.loadComponents();
  }

  openNew() {
    this.isEditing = false;
    this.selectedId = null;
    this.submitted = false;
    this.form.reset({ currentStatus: 1, isActive: true });
    this.drawerVisible = true;
  }

  editItem(item: AssetComponentItem) {
    this.isEditing = true;
    this.selectedId = item.id;
    this.form.patchValue({ ...item, installationDate: item.installationDate ? new Date(item.installationDate) : null,
      warrantyStartDate: item.warrantyStartDate ? new Date(item.warrantyStartDate) : null,
      warrantyEndDate: item.warrantyEndDate ? new Date(item.warrantyEndDate) : null });
    this.drawerVisible = true;
  }

  save() {
    this.submitted = true;
    if (this.form.invalid || !this.assetId) return;

    const raw = this.form.getRawValue();

    const payload: CreateAssetComponentItem = {
      ...raw,
      assetId: this.assetId,
      tenantId: this.tenantId
    };

    const req = this.isEditing && this.selectedId
      ? this.service.update({ ...payload, id: this.selectedId })
      : this.service.create(payload);

    req.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Component saved' });
        this.drawerVisible = false;
        this.loadComponents();
      },
      error: (err) => {
        const msg = err?.error?.errors?.[0] ?? 'Save failed';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      }
    });
  }

  deleteItem(item: AssetComponentItem) {
    this.confirmationService.confirm({
      message: `Deactivate component "${item.componentName}"?`,
      accept: () => {
        this.service.delete(item.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Component deactivated' });
            this.loadComponents();
          }
        });
      }
    });
  }

  statusLabel(v: number) {
    return this.statusLabelMap.get(v) ?? String(v);
  }
}
