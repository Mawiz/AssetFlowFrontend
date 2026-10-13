import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { DrawerModule } from 'primeng/drawer';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { TabsModule } from 'primeng/tabs';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService } from 'primeng/api';
import { WorkflowConfigurationService } from '../../services/workflow-configuration-service';
import {
  WorkflowActionDef,
  WorkflowModule,
  WorkflowModuleStage,
  WorkflowStageAction,
  WorkflowStageActionViewer
} from '../../model/workflow-configuration';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';
import { readPagedList } from '../../utils/paged-list';
import { AuthService } from '@/services/auth-service';
import { MetadataService } from '@/services/metadata-service';
import { TenantDto } from '../../model/tenant';
import { UserService } from '../../services/user-service';
import { RoleService } from '../../services/role-service';
import { MultiSelectModule } from 'primeng/multiselect';
import {
  parsePopupComponentIds,
  popupComponentIdsToStorage,
  WORKFLOW_POPUP_COMPONENT_OPTIONS
} from '../../constants/workflow-popup-components';

@Component({
  selector: 'app-workflow-module-component',
  standalone: true,
  templateUrl: './workflow-module-component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    ToastModule,
    InputTextModule,
    DrawerModule,
    DialogModule,
    CheckboxModule,
    TagModule,
    SelectModule,
    InputNumberModule,
    TextareaModule,
    TabsModule,
    IconFieldModule,
    InputIconModule,
    MultiSelectModule,
    HasPermissionDirective
  ],
  providers: [MessageService]
})
export class WorkflowModuleComponent implements OnInit {
  Permissions = Permissions;
  workflowPopupOptions = WORKFLOW_POPUP_COMPONENT_OPTIONS;
  rows = signal<WorkflowModule[]>([]);
  totalRecords = 0;
  filter = { pageNumber: 1, pageSize: 10, searchText: '', tenantId: null as number | null };
  systemAdmin = false;
  tenantFilterOptions: { label: string; value: number | null }[] = [{ label: 'All tenants', value: null }];
  tenantsForForm: { id: number; displayName: string }[] = [];

  moduleDrawerVisible = false;
  moduleEditing = false;
  moduleForm!: FormGroup;
  moduleSubmitted = false;
  selectedModule: WorkflowModule | null = null;
  stages = signal<WorkflowModuleStage[]>([]);

  stageDialogVisible = false;
  stageEditing = false;
  stageForm!: FormGroup;
  activeStage: WorkflowModuleStage | null = null;
  stageTab = 'details';

  stageActions = signal<WorkflowStageAction[]>([]);
  viewers = signal<WorkflowStageActionViewer[]>([]);
  actionDefs: WorkflowActionDef[] = [];
  roleOptions: { label: string; value: number }[] = [];
  userOptions: { label: string; value: number }[] = [];
  partyTypeOptions = [
    { label: 'Role', value: 1 },
    { label: 'User', value: 2 }
  ];

  stageActionFormVisible = false;
  stageActionEditing = false;
  stageActionForm!: FormGroup;

  viewerFormVisible = false;
  viewerEditing = false;
  viewerForm!: FormGroup;

  constructor(
    private service: WorkflowConfigurationService,
    private messages: MessageService,
    private fb: FormBuilder,
    private authService: AuthService,
    private metadataService: MetadataService,
    private userService: UserService,
    private roleService: RoleService
  ) {}

  ngOnInit() {
    this.systemAdmin = this.authService.systemAdminPermissions();
    this.initForms();
    if (this.systemAdmin) this.loadTenants();
    this.service.getAllActions().subscribe((a) => (this.actionDefs = a));
    this.load();
  }

  initForms() {
    this.moduleForm = this.fb.group({
      moduleId: [null],
      moduleNameEn: ['', Validators.required],
      moduleNameAr: [''],
      displayOrder: [0],
      isReOpen: [false],
      tenantId: [this.systemAdmin ? null : this.getFixedTenantId(), this.systemAdmin ? Validators.required : []],
      isActive: [true]
    });
    this.stageForm = this.fb.group({
      stageId: [null],
      moduleId: [null],
      stageNameEn: ['', Validators.required],
      stageNameAr: [''],
      sequenceNo: [1],
      dueInHours: [0],
      versionNo: [1],
      emailTemplateId: [0],
      isFinalApprover: [false],
      acknowledgementTemplateId: [null],
      isClosingStage: [false],
      isInitialStage: [false],
      isLogOpen: [false],
      isTATExtension: [false],
      assigneeTypeId: [null as number | null],
      assignmentValue: [null as number | null],
      isActive: [true]
    });
    this.stageForm.get('assigneeTypeId')?.valueChanges.subscribe(() => {
      if (this.stageUsesRuntimeUser()) {
        this.stageForm.patchValue({ assignmentValue: null }, { emitEvent: false });
      }
    });
    this.stageActionForm = this.fb.group({
      stageActionId: [null],
      stageId: [null],
      actionId: [null, Validators.required],
      stageActionDisplayName: ['', Validators.required],
      stageActionDisplayNameAr: [''],
      emailTemplateId: [0],
      displayOrderNo: [1],
      cssClass: [''],
      nextSageId: [null],
      assigneeTypeId: [null],
      assignmentValue: [null],
      acknowledgementTemplateId: [null],
      popupComponentIds: [[] as number[]],
      isActive: [true]
    });
    this.stageActionForm.get('assigneeTypeId')?.valueChanges.subscribe(() => {
      this.stageActionForm.patchValue({ assignmentValue: null }, { emitEvent: false });
    });
    this.viewerForm = this.fb.group({
      stageActionViewerId: [null],
      stageId: [null],
      viewerTypeId: [1, Validators.required],
      viewerValue: [null, Validators.required],
      isActive: [true]
    });
  }

  getFixedTenantId(): number | null {
    const t = this.authService.getTenantId();
    return t == null || t === 0 ? null : t;
  }

  loadTenants() {
    this.metadataService.getMetadataValues({ secretKeys: ['Tenant'] }).subscribe({
      next: (res) => {
        const tenants = res.result?.metaResult[0]?.data || [];
        this.tenantsForForm = tenants.map((t: TenantDto) => ({
          id: t.id,
          displayName: (t as { displayName?: string }).displayName || t.companyName || String(t.id)
        }));
        this.tenantFilterOptions = [
          { label: 'All tenants', value: null },
          ...this.tenantsForForm.map((t) => ({ label: t.displayName, value: t.id }))
        ];
      }
    });
  }

  loadLookupsForModule(module: WorkflowModule) {
    const tenantId = module.tenantId ?? this.getFixedTenantId();
    this.userService.filter({ pageNumber: 1, pageSize: 200, tenantId, isActive: true }).subscribe({
      next: (page) => {
        const { rows } = readPagedList<any>(page?.result ?? page);
        this.userOptions = rows.map((u: any) => ({
          label: u.fullName || u.userName || String(u.id),
          value: u.id
        }));
      }
    });
    this.roleService.getRolesByTenant(tenantId ?? undefined).subscribe({
      next: (roles) => {
        this.roleOptions = (roles ?? []).map((r) => ({
          label: r.displayName || r.roleName || String(r.roleId),
          value: r.roleId
        }));
      }
    });
  }

  load() {
    this.service.filterModules(this.filter).subscribe({
      next: (page) => {
        const { rows, total } = readPagedList<WorkflowModule>(page);
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

  onTenantFilterChange() {
    this.filter.pageNumber = 1;
    this.load();
  }

  onPage(event: { page?: number; rows?: number; first?: number }) {
    this.filter.pageNumber = event.page != null ? event.page + 1 : Math.floor((event.first ?? 0) / (event.rows ?? 10)) + 1;
    this.filter.pageSize = event.rows ?? 10;
    this.load();
  }

  openNewModule() {
    this.moduleEditing = false;
    this.moduleSubmitted = false;
    this.selectedModule = null;
    this.stages.set([]);
    this.moduleForm.reset({
      displayOrder: 0,
      isReOpen: false,
      tenantId: this.systemAdmin ? null : this.getFixedTenantId(),
      isActive: true
    });
    this.moduleDrawerVisible = true;
  }

  editModule(item: WorkflowModule) {
    this.moduleEditing = true;
    this.moduleSubmitted = false;
    this.selectedModule = item;
    this.moduleForm.patchValue(item);
    this.loadStages(item.moduleId);
    this.loadLookupsForModule(item);
    this.moduleDrawerVisible = true;
  }

  loadStages(moduleId: number) {
    this.service.getStages(moduleId).subscribe({
      next: (s) => this.stages.set(s),
      error: () => this.stages.set([])
    });
  }

  saveModule() {
    this.moduleSubmitted = true;
    if (this.moduleForm.invalid) return;
    const v = this.moduleForm.value;
    const req = this.moduleEditing ? this.service.updateModule(v) : this.service.createModule(v);
    req.subscribe({
      next: (m) => {
        this.messages.add({ severity: 'success', summary: 'Saved', detail: 'Workflow module saved' });
        if (!this.moduleEditing && m) {
          this.moduleEditing = true;
          this.selectedModule = m;
          this.moduleForm.patchValue(m);
        }
        this.load();
      },
      error: (e) =>
        this.messages.add({ severity: 'error', summary: 'Error', detail: e?.error?.errors?.[0] || 'Save failed' })
    });
  }

  deleteModule(item: WorkflowModule) {
    if (!confirm('Delete this workflow module and its stages?')) return;
    this.service.deleteModule(item.moduleId).subscribe({
      next: () => {
        this.messages.add({ severity: 'success', summary: 'Deleted', detail: 'Module removed' });
        this.moduleDrawerVisible = false;
        this.load();
      },
      error: (e) =>
        this.messages.add({ severity: 'error', summary: 'Error', detail: e?.error?.errors?.[0] || 'Delete failed' })
    });
  }

  openNewStage() {
    if (!this.selectedModule) return;
    this.stageEditing = false;
    this.activeStage = null;
    this.stageTab = 'details';
    this.stageForm.reset({
      moduleId: this.selectedModule.moduleId,
      sequenceNo: (this.stages().length || 0) + 1,
      versionNo: 1,
      dueInHours: 0,
      emailTemplateId: 0,
      isActive: true
    });
    this.stageActions.set([]);
    this.viewers.set([]);
    this.stageDialogVisible = true;
  }

  editStage(stage: WorkflowModuleStage) {
    this.stageEditing = true;
    this.activeStage = stage;
    this.stageTab = 'details';
    this.stageForm.patchValue(this.normalizeStageForm(stage));
    this.loadStageActions(stage.stageId);
    this.loadViewers(stage.stageId);
    this.stageDialogVisible = true;
  }

  /** API requires non-null booleans; checkboxes / patchValue can leave null. */
  private normalizeStageForm(raw: WorkflowModuleStage | Record<string, unknown>): Record<string, unknown> {
    const s = raw as Record<string, unknown>;
    return {
      stageId: s['stageId'] ?? s['StageId'] ?? null,
      moduleId: s['moduleId'] ?? s['ModuleId'] ?? null,
      stageNameEn: s['stageNameEn'] ?? s['StageNameEn'] ?? '',
      stageNameAr: s['stageNameAr'] ?? s['StageNameAr'] ?? '',
      sequenceNo: Number(s['sequenceNo'] ?? s['SequenceNo'] ?? 1),
      dueInHours: Number(s['dueInHours'] ?? s['DueInHours'] ?? 0),
      versionNo: Number(s['versionNo'] ?? s['VersionNo'] ?? 1),
      emailTemplateId: Number(s['emailTemplateId'] ?? s['EmailTemplateId'] ?? 0),
      isFinalApprover: this.coerceBool(s['isFinalApprover'] ?? s['IsFinalApprover']),
      acknowledgementTemplateId: s['acknowledgementTemplateId'] ?? s['AcknowledgementTemplateId'] ?? null,
      isClosingStage: this.coerceBool(s['isClosingStage'] ?? s['IsClosingStage']),
      isInitialStage: this.coerceBool(s['isInitialStage'] ?? s['IsInitialStage']),
      isLogOpen: this.coerceBool(s['isLogOpen'] ?? s['IsLogOpen']),
      isTATExtension: this.coerceBool(s['isTATExtension'] ?? s['IsTATExtension']),
      assigneeTypeId: (s['assigneeTypeId'] ?? s['AssigneeTypeId'] ?? null) as number | null,
      assignmentValue: (s['assignmentValue'] ?? s['AssignmentValue'] ?? null) as number | null,
      isActive: this.coerceBool(s['isActive'] ?? s['IsActive'], true)
    };
  }

  stageUsesRuntimeUser(): boolean {
    return this.stageForm.get('assigneeTypeId')?.value === 2;
  }

  showStageRoleAssignee(): boolean {
    return this.stageForm.get('assigneeTypeId')?.value === 1;
  }

  private coerceBool(value: unknown, defaultValue = false): boolean {
    if (value === true || value === false) return value;
    if (value === 'true' || value === 1 || value === '1') return true;
    if (value === 'false' || value === 0 || value === '0') return false;
    return defaultValue;
  }

  private stagePayloadFromForm(): Record<string, unknown> {
    const payload = this.normalizeStageForm(this.stageForm.getRawValue());
    if (payload['assigneeTypeId'] === 2) {
      payload['assignmentValue'] = null;
    }
    return payload;
  }

  saveStage() {
    if (this.stageForm.invalid) return;
    const v = this.stagePayloadFromForm();
    if (!v['moduleId']) {
      this.messages.add({ severity: 'warn', summary: 'Module required', detail: 'Save the workflow module first.' });
      return;
    }
    const req = this.stageEditing
      ? this.service.updateStage(v as Partial<WorkflowModuleStage> & { stageId: number })
      : this.service.createStage(v as Partial<WorkflowModuleStage>);
    req.subscribe({
      next: (s) => {
        this.messages.add({ severity: 'success', summary: 'Saved', detail: 'Stage saved' });
        if (!this.stageEditing && s) {
          this.stageEditing = true;
          this.activeStage = s;
          this.stageForm.patchValue(this.normalizeStageForm(s as unknown as Record<string, unknown>));
        } else if (this.stageEditing && s && this.activeStage?.stageId === s.stageId) {
          this.activeStage = s;
        }
        if (this.selectedModule) this.loadStages(this.selectedModule.moduleId);
      },
      error: (e) =>
        this.messages.add({ severity: 'error', summary: 'Error', detail: e?.error?.errors?.[0] || 'Save failed' })
    });
  }

  deleteStage(stage: WorkflowModuleStage) {
    if (!confirm('Delete this stage?')) return;
    this.service.deleteStage(stage.stageId).subscribe({
      next: () => {
        if (this.selectedModule) this.loadStages(this.selectedModule.moduleId);
        this.stageDialogVisible = false;
      },
      error: (e) =>
        this.messages.add({ severity: 'error', summary: 'Error', detail: e?.error?.errors?.[0] || 'Delete failed' })
    });
  }

  loadStageActions(stageId: number) {
    this.service.getStageActions(stageId).subscribe({
      next: (a) => this.stageActions.set(a),
      error: () => this.stageActions.set([])
    });
  }

  loadViewers(stageId: number) {
    this.service.getViewers(stageId).subscribe({
      next: (v) => this.viewers.set(v),
      error: () => this.viewers.set([])
    });
  }

  stageOptionsForNext(): { label: string; value: number }[] {
    return this.stages().map((s) => ({ label: `${s.sequenceNo}: ${s.stageNameEn}`, value: s.stageId }));
  }

  openNewStageAction() {
    const stageId = this.activeStage?.stageId ?? this.stageForm.value.stageId;
    if (!stageId) {
      this.messages.add({ severity: 'warn', summary: 'Save stage first', detail: 'Save the stage before adding actions.' });
      return;
    }
    this.stageActionEditing = false;
    this.stageActionForm.reset({
      stageId,
      displayOrderNo: 1,
      emailTemplateId: 0,
      isActive: true
    });
    this.stageActionFormVisible = true;
  }

  editStageAction(item: WorkflowStageAction) {
    this.stageActionEditing = true;
    this.stageActionForm.patchValue({
      ...item,
      popupComponentIds: parsePopupComponentIds(item.actionPopUpRenderingComponents)
    });
    this.stageActionFormVisible = true;
  }

  saveStageAction() {
    if (this.stageActionForm.invalid) return;
    const v = { ...this.stageActionForm.value };
    const ids = Array.isArray(v.popupComponentIds) ? v.popupComponentIds : parsePopupComponentIds(v.actionPopUpRenderingComponents);
    v.actionPopUpRenderingComponents = popupComponentIdsToStorage(ids);
    delete v.popupComponentIds;
    const req = this.stageActionEditing ? this.service.updateStageAction(v) : this.service.createStageAction(v);
    req.subscribe({
      next: () => {
        this.stageActionFormVisible = false;
        this.loadStageActions(v.stageId);
      },
      error: (e) =>
        this.messages.add({ severity: 'error', summary: 'Error', detail: e?.error?.errors?.[0] || 'Save failed' })
    });
  }

  deleteStageAction(item: WorkflowStageAction) {
    this.service.deleteStageAction(item.stageActionId).subscribe({
      next: () => this.loadStageActions(item.stageId),
      error: (e) =>
        this.messages.add({ severity: 'error', summary: 'Error', detail: e?.error?.errors?.[0] || 'Delete failed' })
    });
  }

  assigneeOptions(): { label: string; value: number }[] {
    const typeId = this.stageActionForm?.value?.assigneeTypeId;
    return typeId === 2 ? this.userOptions : this.roleOptions;
  }

  openNewViewer() {
    const stageId = this.activeStage?.stageId ?? this.stageForm.value.stageId;
    if (!stageId) {
      this.messages.add({ severity: 'warn', summary: 'Save stage first', detail: 'Save the stage before adding viewers.' });
      return;
    }
    this.viewerEditing = false;
    this.viewerForm.reset({ stageId, viewerTypeId: 1, isActive: true });
    this.viewerFormVisible = true;
  }

  editViewer(item: WorkflowStageActionViewer) {
    this.viewerEditing = true;
    this.viewerForm.patchValue(item);
    this.viewerFormVisible = true;
  }

  saveViewer() {
    if (this.viewerForm.invalid) return;
    const v = this.viewerForm.value;
    const req = this.viewerEditing ? this.service.updateViewer(v) : this.service.createViewer(v);
    req.subscribe({
      next: () => {
        this.viewerFormVisible = false;
        this.loadViewers(v.stageId);
      },
      error: (e) =>
        this.messages.add({ severity: 'error', summary: 'Error', detail: e?.error?.errors?.[0] || 'Save failed' })
    });
  }

  deleteViewer(item: WorkflowStageActionViewer) {
    this.service.deleteViewer(item.stageActionViewerId).subscribe({
      next: () => this.loadViewers(item.stageId),
      error: (e) =>
        this.messages.add({ severity: 'error', summary: 'Error', detail: e?.error?.errors?.[0] || 'Delete failed' })
    });
  }

  viewerTargetOptions(): { label: string; value: number }[] {
    const typeId = this.viewerForm?.value?.viewerTypeId;
    return typeId === 2 ? this.userOptions : this.roleOptions;
  }
}
