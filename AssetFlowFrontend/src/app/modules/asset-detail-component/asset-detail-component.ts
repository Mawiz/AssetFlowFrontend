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
import { combineLatest, firstValueFrom } from 'rxjs';
import { AssetService } from '../../services/asset-service';
import { LocationService } from '../../services/location-service';
import { MetadataService } from '../../services/metadata-service';
import { AssetCategory } from '../../model/asset-category';
import { AssetType } from '../../model/asset-type';
import { CreateAsset, UpdateAsset } from '../../model/asset';
import { Location } from '../../model/location';
import { MetaDataByTypeItem } from '../../model/entity-metadata';
import { AuthService } from '@/services/auth-service';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';
import { AssetComponentsPanelComponent } from './asset-components-panel.component';
import { AssetPmPanelComponent } from './asset-pm-panel.component';

interface LocationLevel {
  label: string;
  options: MetaDataByTypeItem[];
  selectedId: number | null;
}

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
    AssetComponentsPanelComponent,
    AssetPmPanelComponent
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
  users: { id: number; displayName: string }[] = [];
  statusOptions: { label: string; value: number }[] = [];
  criticalityOptions: { label: string; value: number }[] = [];
  lifeUnitOptions: { label: string; value: number }[] = [];
  tenantsForForm: { id: number; displayName: string }[] = [];
  loadedTenantId: number | null = null;
  pageTitle = 'Asset';

  locationLevels: LocationLevel[] = [];
  departmentOptions: MetaDataByTypeItem[] = [];
  selectedDepartmentId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private assetService: AssetService,
    private locationService: LocationService,
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
        this.assetId = null;
        this.pageTitle = 'New Asset';
        this.loadLookups(this.getFormTenantId());
        this.resetLocationCascade();
        return;
      }

      const id = Number(idParam);
      if (!idParam || Number.isNaN(id)) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid asset id' });
        this.router.navigate(['/modules/assets']);
        return;
      }

      this.assetId = id;
      this.loadAsset(id);
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
      this.loadTypesForCategory(catId);
    });

    if (this.systemAdmin) {
      this.form.get('tenantId')?.valueChanges.subscribe((tenantId) => {
        this.loadLookups(this.normalizeTenantId(tenantId));
        this.form.patchValue(
          { assetCategoryId: null, assetTypeId: null, locationId: null, responsibleUserId: null },
          { emitEvent: false }
        );
        this.resetLocationCascade();
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

  loadTenants() {
    this.metadataService.getMetadataValues({ secretKeys: ['Tenant'] }).subscribe({
      next: (res) => {
        const list = res?.result?.metaResult?.[0]?.data ?? [];
        this.tenantsForForm = list.map((t: any) => ({ id: t.id, displayName: t.displayName ?? t.name }));
      }
    });
  }

  loadLookups(tenantId: number | null) {
    this.metadataService.getByType({ type: 'AssetCategory', tenantId }).subscribe({
      next: (res) => {
        const list: MetaDataByTypeItem[] = res?.result ?? [];
        this.categories = list.map((c) => ({
          id: c.id,
          name: c.displayName ?? c.name,
          code: '',
          description: '',
          isActive: true,
          tenantId
        }));
      }
    });

    this.metadataService.getByType({ type: 'ApplicationUser', tenantId }).subscribe({
      next: (res) => {
        const list: MetaDataByTypeItem[] = res?.result ?? [];
        this.users = list.map((u) => ({ id: u.id, displayName: u.displayName ?? u.name }));
      }
    });
  }

  loadTypesForCategory(categoryId: number | null) {
    if (!categoryId) {
      this.types = [];
      return;
    }
    this.metadataService
      .getByType({ type: 'AssetType', parentId: categoryId, tenantId: this.getFormTenantId() })
      .subscribe({
        next: (res) => {
          const list: MetaDataByTypeItem[] = res?.result ?? [];
          this.types = list.map((t) => ({
            id: t.id,
            name: t.displayName ?? t.name,
            code: '',
            assetCategoryId: categoryId,
            description: '',
            isActive: true,
            tenantId: this.getFormTenantId()
          }));
        }
      });
  }

  resetLocationCascade() {
    this.locationLevels = [{ label: 'Location', options: [], selectedId: null }];
    this.departmentOptions = [];
    this.selectedDepartmentId = null;
    this.form.patchValue({ locationId: null }, { emitEvent: false });
    this.loadLocationLevel(0, null);
  }

  loadLocationLevel(levelIndex: number, parentId: number | null) {
    this.metadataService
      .getByType({ type: 'Location', parentId, tenantId: this.getFormTenantId() })
      .subscribe({
        next: (res) => {
          const options: MetaDataByTypeItem[] = res?.result ?? [];
          if (this.locationLevels[levelIndex]) {
            this.locationLevels[levelIndex].options = options;
          }
        }
      });
  }

  onLocationLevelChange(levelIndex: number, selectedId: number | null) {
    this.locationLevels[levelIndex].selectedId = selectedId;
    this.locationLevels = this.locationLevels.slice(0, levelIndex + 1);

    if (selectedId == null) {
      this.form.patchValue({ locationId: null });
      this.departmentOptions = [];
      this.selectedDepartmentId = null;
      return;
    }

    this.form.patchValue({ locationId: selectedId });
    this.loadDepartments(selectedId);

    const selected = this.locationLevels[levelIndex].options.find((o) => o.id === selectedId);
    if (selected?.hasChildren) {
      this.locationLevels.push({ label: 'Sub-location', options: [], selectedId: null });
      this.loadLocationLevel(levelIndex + 1, selectedId);
    }
  }

  loadDepartments(locationId: number | null) {
    if (!locationId) {
      this.departmentOptions = [];
      this.selectedDepartmentId = null;
      return;
    }
    this.metadataService
      .getByType({ type: 'Department', parentId: locationId, tenantId: this.getFormTenantId() })
      .subscribe({
        next: (res) => {
          this.departmentOptions = res?.result ?? [];
        }
      });
  }

  async rebuildLocationCascade(locationId: number, tenantId: number | null) {
    const chain: number[] = [];
    let currentId: number | null = locationId;
    while (currentId) {
      chain.unshift(currentId);
      const loc: Location = await firstValueFrom(this.locationService.getById(currentId));
      currentId = loc.parentLocationId ?? null;
    }

    this.locationLevels = [];
    for (let i = 0; i < chain.length; i++) {
      const parentId = i === 0 ? null : chain[i - 1];
      const level: LocationLevel = {
        label: i === 0 ? 'Location' : 'Sub-location',
        options: [],
        selectedId: chain[i]
      };
      this.locationLevels.push(level);
      const res = await firstValueFrom(
        this.metadataService.getByType({ type: 'Location', parentId, tenantId })
      );
      level.options = res?.result ?? [];
    }

    const deepest = chain[chain.length - 1];
    this.form.patchValue({ locationId: deepest });
    this.loadDepartments(deepest);
  }

  loadAsset(id: number) {
    this.assetService.getById(id).subscribe({
      next: (asset) => {
        this.pageTitle = `${asset.assetCode} — ${asset.name}`;
        this.loadedTenantId = asset.tenantId ?? null;
        this.loadLookups(asset.tenantId ?? null);
        this.loadTypesForCategory(asset.assetCategoryId);
        this.form.patchValue({
          ...asset,
          installationDate: asset.installationDate ? new Date(asset.installationDate) : null,
          warrantyStartDate: asset.warrantyStartDate ? new Date(asset.warrantyStartDate) : null,
          warrantyEndDate: asset.warrantyEndDate ? new Date(asset.warrantyEndDate) : null,
          purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate) : null
        });
        this.rebuildLocationCascade(asset.locationId, asset.tenantId ?? null);
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Asset not found' })
    });
  }

  save() {
    this.submitted = true;
    if (this.form.invalid) return;

    const payload: CreateAsset = this.form.getRawValue();

    const req = this.isCreateMode
      ? this.assetService.create(payload)
      : this.assetService.update({ ...payload, id: this.assetId! } as UpdateAsset);

    req.subscribe({
      next: (asset) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Asset saved' });
        if (this.isCreateMode) {
          this.router.navigate(['/modules/assets', asset.id], { replaceUrl: true });
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
