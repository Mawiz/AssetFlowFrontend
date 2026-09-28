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
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AssetService } from '../../services/asset-service';
import { AssetCategoryService } from '../../services/asset-category-service';
import { AssetTypeService } from '../../services/asset-type-service';
import { LocationService } from '../../services/location-service';
import { MetadataService } from '../../services/metadata-service';
import { AssetCategory } from '../../model/asset-category';
import { AssetType } from '../../model/asset-type';
import { Location } from '../../model/location';
import { CreateAsset, UpdateAsset } from '../../model/asset';
import { MetaDataKeyDefinition } from '../../model/entity-metadata';
import { AuthService } from '@/services/auth-service';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';
import { AssetComponentsPanelComponent } from './asset-components-panel.component';

@Component({
  selector: 'app-asset-detail-component',
  standalone: true,
  templateUrl: './asset-detail-component.html',
  styleUrls: ['./asset-detail-component.scss'],
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
    DatePickerModule,
    InputNumberModule,
    ToastModule,
    HasPermissionDirective,
    AssetComponentsPanelComponent
  ],
  providers: [MessageService]
})
export class AssetDetailComponent implements OnInit {
  readonly Permissions = Permissions;
  assetId: number | null = null;
  isCreateMode = false;
  systemAdmin = false;
  form!: FormGroup;
  submitted = false;
  categories: AssetCategory[] = [];
  types: AssetType[] = [];
  locations: Location[] = [];
  users: { id: number; displayName: string }[] = [];
  statusOptions: { label: string; value: number }[] = [];
  criticalityOptions: { label: string; value: number }[] = [];
  lifeUnitOptions: { label: string; value: number }[] = [];
  metadataKeys: MetaDataKeyDefinition[] = [];
  metadataValues: { keyId: number; value: string }[] = [];
  tenantsForForm: { id: number; displayName: string }[] = [];
  loadedTenantId: number | null = null;
  pageTitle = 'Asset';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private assetService: AssetService,
    private categoryService: AssetCategoryService,
    private typeService: AssetTypeService,
    private locationService: LocationService,
    private metadataService: MetadataService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.systemAdmin = this.authService.systemAdminPermissions();
    this.initForm();
    this.loadEnums();
    this.loadMetadataKeys();
    if (this.systemAdmin) {
      this.loadTenants();
    }

    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      this.isCreateMode = idParam === 'new';
      this.assetId = this.isCreateMode ? null : Number(idParam);
      if (!this.isCreateMode && this.assetId) {
        this.loadAsset(this.assetId);
      } else {
        this.pageTitle = 'New Asset';
        this.loadLookups(this.getFormTenantId());
      }
    });
  }

  initForm() {
    this.form = this.fb.group({
      tenantId: [this.systemAdmin ? null : this.authService.getTenantId(), this.systemAdmin ? Validators.required : []],
      assetCode: ['', Validators.required],
      name: ['', Validators.required],
      assetCategoryId: [null as number | null, Validators.required],
      assetTypeId: [null as number | null, Validators.required],
      manufacturer: [''],
      model: [''],
      serialNumber: [''],
      installationDate: [null as Date | null],
      locationId: [null as number | null, Validators.required],
      responsibleUserId: [null as number | null],
      otherLocationInformation: [''],
      status: [1, Validators.required],
      criticality: [3, Validators.required],
      warrantyStartDate: [null as Date | null],
      warrantyEndDate: [null as Date | null],
      purchaseDate: [null as Date | null],
      purchaseCost: [null as number | null],
      supplierName: [''],
      expectedLifeValue: [null as number | null],
      expectedLifeUnit: [null as number | null],
      notes: [''],
      isActive: [true]
    });

    this.form.get('assetCategoryId')?.valueChanges.subscribe((catId) => {
      this.form.patchValue({ assetTypeId: null }, { emitEvent: false });
      this.loadTypes(catId);
    });

    if (this.systemAdmin) {
      this.form.get('tenantId')?.valueChanges.subscribe((tenantId) => {
        this.loadLookups(this.normalizeTenantId(tenantId));
        this.form.patchValue({ assetCategoryId: null, assetTypeId: null, locationId: null, responsibleUserId: null }, { emitEvent: false });
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
        this.statusOptions = (data?.AssetStatus ?? []).map((x: any) => ({ label: x.text, value: x.value }));
        this.criticalityOptions = (data?.AssetCriticality ?? []).map((x: any) => ({ label: x.text, value: x.value }));
        this.lifeUnitOptions = (data?.ExpectedLifeUnit ?? []).map((x: any) => ({ label: x.text, value: x.value }));
      }
    });
  }

  loadMetadataKeys() {
    this.metadataService.getMetadataKeys('Asset').subscribe({
      next: (res) => {
        this.metadataKeys = res?.result ?? [];
        this.metadataValues = this.metadataKeys.map((k) => ({ keyId: k.id, value: '' }));
      },
      error: () => (this.metadataKeys = [])
    });
  }

  loadTenants() {
    this.metadataService.getMetadataValues({ secretKeys: ['Tenant'] }).subscribe({
      next: (res) => {
        const list = res?.result?.metaResult?.[0]?.data ?? [];
        this.tenantsForForm = list.map((t: any) => ({ id: t.id, displayName: t.displayName ?? t.name }));
      }
    });
  }

  loadLookups(tenantId: number | null) {
    this.categoryService.getAllActive(tenantId).subscribe({ next: (d) => (this.categories = d.filter((c) => c.isActive)) });
    this.locationService.getAll({ pageNumber: 1, pageSize: 500, isActive: true, tenantId }).subscribe({
      next: (d) => (this.locations = d.filter((l) => l.isActive))
    });
    this.metadataService.getMetadataValues({ secretKeys: ['ApplicationUser'], tenantId }).subscribe({
      next: (res) => {
        const list = res?.result?.metaResult?.[0]?.data ?? [];
        this.users = list.map((u: any) => ({ id: u.id, displayName: u.displayName ?? u.name }));
      }
    });
  }

  loadTypes(categoryId: number | null) {
    if (!categoryId) {
      this.types = [];
      return;
    }
    this.typeService.getAll({ pageNumber: 1, pageSize: 500, assetCategoryId: categoryId, isActive: true, tenantId: this.getFormTenantId() }).subscribe({
      next: (d) => (this.types = d)
    });
  }

  loadAsset(id: number) {
    this.assetService.getById(id).subscribe({
      next: (asset) => {
        this.pageTitle = `${asset.assetCode} — ${asset.name}`;
        this.loadedTenantId = asset.tenantId ?? null;
        this.loadLookups(asset.tenantId ?? null);
        this.loadTypes(asset.assetCategoryId);
        this.form.patchValue({
          ...asset,
          installationDate: asset.installationDate ? new Date(asset.installationDate) : null,
          warrantyStartDate: asset.warrantyStartDate ? new Date(asset.warrantyStartDate) : null,
          warrantyEndDate: asset.warrantyEndDate ? new Date(asset.warrantyEndDate) : null,
          purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate) : null
        });
        this.metadataValues = this.metadataKeys.map((k) => {
          const existing = asset.metadata?.find((m) => m.metaDataKeyId === k.id);
          return { keyId: k.id, value: existing?.value ?? '' };
        });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Asset not found' })
    });
  }

  save() {
    this.submitted = true;
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const metadata = this.metadataValues
      .filter((m) => m.value?.trim())
      .map((m) => ({ metaDataKeyId: m.keyId, value: m.value.trim() }));

    const payload: CreateAsset = { ...raw, metadata };

    const req = this.isCreateMode
      ? this.assetService.create(payload)
      : this.assetService.update({ ...payload, id: this.assetId! } as UpdateAsset);

    req.subscribe({
      next: (asset) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Asset saved' });
        if (this.isCreateMode) {
          this.router.navigate(['/modules/assets', asset.id]);
        } else {
          this.loadAsset(asset.id);
        }
      },
      error: (err) => {
        const msg = err?.error?.errors?.[0] ?? 'Save failed';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      }
    });
  }

  backToList() {
    this.router.navigate(['/modules/assets']);
  }
}
