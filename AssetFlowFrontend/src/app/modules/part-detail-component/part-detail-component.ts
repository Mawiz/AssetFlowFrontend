import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { combineLatest } from 'rxjs';
import { PartService } from '../../services/part-service';
import { PartCategoryService } from '../../services/part-category-service';
import { PartCategory } from '../../model/part-category';
import { CreatePart, Part, UpdatePart } from '../../model/part';
import { AuthService } from '@/services/auth-service';
import { MetadataService } from '@/services/metadata-service';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';
import { PartInventoryPanelComponent } from './part-inventory-panel.component';
import { PartSerialsPanelComponent } from './part-serials-panel.component';
import { PartTransactionsPanelComponent } from './part-transactions-panel.component';

@Component({
  selector: 'app-part-detail-component',
  standalone: true,
  templateUrl: './part-detail-component.html',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TabsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    CheckboxModule,
    InputNumberModule,
    ToastModule,
    HasPermissionDirective,
    PartInventoryPanelComponent,
    PartSerialsPanelComponent,
    PartTransactionsPanelComponent
  ],
  providers: [MessageService]
})
export class PartDetailComponent implements OnInit {
  readonly Permissions = Permissions;
  partId: number | null = null;
  part: Part | null = null;
  isCreateMode = false;
  systemAdmin = false;
  form!: FormGroup;
  submitted = false;
  categories: PartCategory[] = [];
  lifeUnitOptions: { label: string; value: number }[] = [];
  tenantsForForm: { id: number; displayName: string }[] = [];
  pageTitle = 'Part';
  serialsRefreshToken = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private partService: PartService,
    private categoryService: PartCategoryService,
    private metadataService: MetadataService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.systemAdmin = this.authService.systemAdminPermissions();
    this.initForm();
    this.loadEnums();
    if (this.systemAdmin) {
      this.loadTenants();
    }

    combineLatest([this.route.data, this.route.paramMap]).subscribe(([data, params]) => {
      const idParam = params.get('id');
      this.isCreateMode = data['mode'] === 'create' || idParam === 'new';

      if (this.isCreateMode) {
        this.partId = null;
        this.part = null;
        this.pageTitle = 'New part';
        this.loadCategories(this.getFormTenantId());
        return;
      }

      const id = Number(idParam);
      if (!idParam || Number.isNaN(id)) {
        this.router.navigate(['/modules/parts']);
        return;
      }
      this.partId = id;
      this.loadPart(id);
    });
  }

  initForm() {
    this.form = this.fb.group({
      tenantId: [this.systemAdmin ? null : this.authService.getTenantId(), this.systemAdmin ? Validators.required : []],
      partNumber: ['', Validators.required],
      partName: ['', Validators.required],
      partCategoryId: [null as number | null, Validators.required],
      description: [''],
      manufacturer: [''],
      supplierName: [''],
      unitOfMeasure: [''],
      expectedLifeValue: [null as number | null],
      expectedLifeUnit: [null as number | null],
      minStockLevel: [0, [Validators.required, Validators.min(0)]],
      maxStockLevel: [null as number | null],
      isSerialized: [{ value: true, disabled: true }],
      isActive: [true]
    });

    if (this.systemAdmin) {
      this.form.get('tenantId')?.valueChanges.subscribe((tenantId) => {
        this.loadCategories(this.normalizeTenantId(tenantId));
        this.form.patchValue({ partCategoryId: null }, { emitEvent: false });
      });
    }
  }

  getFormTenantId(): number | null {
    if (!this.systemAdmin) return this.authService.getTenantId();
    return this.normalizeTenantId(this.form.get('tenantId')?.value);
  }

  normalizeTenantId(value: number | null | undefined): number | null {
    if (value == null || value === 0) return null;
    return value;
  }

  loadEnums() {
    this.metadataService.getEnums().subscribe({
      next: (res) => {
        const data = res?.result ?? res;
        this.lifeUnitOptions = (data?.ExpectedLifeUnit ?? []).map((x: any) => ({
          label: x.text,
          value: x.value
        }));
      }
    });
  }

  loadTenants() {
    this.metadataService.getMetadataValues({ secretKeys: ['Tenant'] }).subscribe({
      next: (res) => {
        const list = res?.result?.metaResult?.[0]?.data ?? [];
        this.tenantsForForm = list.map((t: any) => ({
          id: t.id,
          displayName: t.displayName ?? t.companyName ?? t.name
        }));
      }
    });
  }

  loadCategories(tenantId: number | null) {
    this.categoryService.getAllActive(tenantId).subscribe({
      next: (data) => (this.categories = data.filter((c) => c.isActive))
    });
  }

  loadPart(id: number) {
    this.partService.getById(id).subscribe({
      next: (p) => {
        this.part = p;
        this.pageTitle = `${p.partNumber} — ${p.partName}`;
        this.loadCategories(this.normalizeTenantId(p.tenantId));
        this.form.patchValue({
          tenantId: p.tenantId,
          partNumber: p.partNumber,
          partName: p.partName,
          partCategoryId: p.partCategoryId,
          description: p.description,
          manufacturer: p.manufacturer,
          supplierName: p.supplierName,
          unitOfMeasure: p.unitOfMeasure,
          expectedLifeValue: p.expectedLifeValue,
          expectedLifeUnit: p.expectedLifeUnit,
          minStockLevel: p.minStockLevel,
          maxStockLevel: p.maxStockLevel,
          isSerialized: p.isSerialized,
          isActive: p.isActive
        });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Part not found' });
        this.router.navigate(['/modules/parts']);
      }
    });
  }

  backToList() {
    this.router.navigate(['/modules/parts']);
  }

  onInventoryChanged() {
    this.serialsRefreshToken++;
    if (this.partId) {
      this.partService.getById(this.partId).subscribe({ next: (p) => (this.part = p) });
    }
  }

  save() {
    this.submitted = true;
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const tenantId = this.systemAdmin ? this.normalizeTenantId(raw.tenantId) : this.authService.getTenantId();

    if (this.isCreateMode) {
      const dto: CreatePart = { ...raw, tenantId };
      this.partService.create(dto).subscribe({
        next: (created) => {
          this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Part created' });
          this.router.navigate(['/modules/parts', created.id]);
        },
        error: (err) => this.showError(err)
      });
    } else if (this.partId) {
      const dto: UpdatePart = { id: this.partId, ...raw, tenantId };
      this.partService.update(dto).subscribe({
        next: (updated) => {
          this.part = updated;
          this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Part updated' });
        },
        error: (err) => this.showError(err)
      });
    }
  }

  private showError(err: any) {
    const detail = err?.error?.errors?.[0] || err?.error?.message || 'Save failed';
    this.messageService.add({ severity: 'error', summary: 'Error', detail });
  }
}
