import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DrawerModule } from 'primeng/drawer';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import { CheckboxModule } from 'primeng/checkbox';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FileUploadModule } from 'primeng/fileupload';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { WorkOrderService } from '../../services/work-order-service';
import { PartReplacementService } from '../../services/part-replacement-service';
import { MetaDataByTypeItemExtended } from '../../model/entity-metadata';
import {
  ConfirmPartReplacement,
  PartReplacement,
  PartReplacementValidationResult
} from '../../model/part-replacement';
import { UserService } from '../../services/user-service';
import { WorkOrder, WorkOrderFilter } from '../../model/work-order';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';
import { MetadataService } from '@/services/metadata-service';
import { AuthService } from '@/services/auth-service';
import { readPagedList } from '../../utils/paged-list';
import * as WoPolicy from './work-order-action-policy';
import { TenantDto } from '../../model/tenant';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments';
import { Observable } from 'rxjs';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

@Component({
  selector: 'app-work-order-component',
  standalone: true,
  templateUrl: './work-order-component.html',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    ToastModule,
    SelectModule,
    InputTextModule,
    TextareaModule,
    DrawerModule,
    TagModule,
    TimelineModule,
    CheckboxModule,
    IconFieldModule,
    InputIconModule,
    FileUploadModule,
    DialogModule,
    InputNumberModule,
    HasPermissionDirective
  ],
  providers: [MessageService]
})
export class WorkOrderComponent implements OnInit {
  Permissions = Permissions;
  rows = signal<WorkOrder[]>([]);
  totalRecords = 0;
  filter: WorkOrderFilter = { pageNumber: 1, pageSize: 15, searchText: '', tenantId: null };
  systemAdmin = false;
  tenantFilterOptions: { label: string; value: number | null }[] = [{ label: 'All tenants', value: null }];
  statusOptions: { label: string; value: number | null }[] = [{ label: 'All', value: null }];
  sourceOptions: { label: string; value: number | null }[] = [{ label: 'All sources', value: null }];
  priorityOptions: { label: string; value: number }[] = [];
  assetStatusOptions: { label: string; value: number }[] = [];
  statusMap = new Map<number, string>();
  sourceMap = new Map<number, string>();
  priorityMap = new Map<number, string>();
  engineers: { label: string; value: number }[] = [];

  detailVisible = false;
  active: WorkOrder | null = null;
  actionRemarks = '';
  assignToUserId: number | null = null;
  diagnosisForm = {
    initialProblem: '',
    diagnosis: '',
    rootCause: '',
    actionTaken: '',
    finalResult: '',
    remarks: ''
  };
  completeForm = { workPerformed: '', finalResult: '', remarks: '', assetStatusAfterWork: null as number | null };
  approveForm = { approvalRemarks: '', restoreAssetOperational: true };
  rejectReason = '';
  myAssignmentsOnly = false;

  replacements: PartReplacement[] = [];
  replacementDialogVisible = false;
  assetComponentOptions: { label: string; value: number; partNumber?: string }[] = [];
  batchOptions: { label: string; value: number }[] = [];
  replacementValidation: PartReplacementValidationResult | null = null;
  replacementSaving = false;
  replacementForm: ConfirmPartReplacement = {
    workOrderId: 0,
    oldAssetComponentId: 0,
    newSerialNumber: '',
    quantity: 1,
    removalReason: '',
    failureReason: '',
    installationLocation: '',
    remarks: '',
    markOldSerialFaulty: true
  };

  constructor(
    private service: WorkOrderService,
    private partReplacementService: PartReplacementService,
    private userService: UserService,
    private metadata: MetadataService,
    private authService: AuthService,
    private messages: MessageService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.systemAdmin = this.authService.systemAdminPermissions();
    if (this.systemAdmin) this.loadTenants();
    this.metadata.getEnums().subscribe((res: unknown) => {
      const data = (res as { result?: unknown })?.result ?? res;
      const enums = data as Record<string, { text: string; value: number }[]>;
      (enums?.['WorkOrderStatus'] ?? []).forEach((x) => {
        this.statusMap.set(x.value, x.text);
        this.statusOptions.push({ label: x.text, value: x.value });
      });
      (enums?.['WorkOrderSourceType'] ?? []).forEach((x) => {
        this.sourceMap.set(x.value, x.text);
        this.sourceOptions.push({ label: x.text, value: x.value });
      });
      this.priorityOptions = (enums?.['IssuePriority'] ?? []).map((x) => ({ label: x.text, value: x.value }));
      this.assetStatusOptions = (enums?.['AssetStatus'] ?? []).map((x) => ({ label: x.text, value: x.value }));
      enums?.['IssuePriority']?.forEach((x) => this.priorityMap.set(x.value, x.text));
    });
    this.loadEngineers();
    this.load();
  }

  loadTenants() {
    this.metadata.getMetadataValues({ secretKeys: ['Tenant'] }).subscribe({
      next: (res) => {
        const tenants = res.result?.metaResult[0]?.data || [];
        this.tenantFilterOptions = [
          { label: 'All tenants', value: null },
          ...tenants.map((t: TenantDto) => ({
            label: (t as { displayName?: string }).displayName || t.companyName || String(t.id),
            value: t.id
          }))
        ];
      }
    });
  }

  loadEngineers() {
    const tenantId = this.systemAdmin ? this.filter.tenantId : this.authService.getTenantId();
    this.userService.filter({ pageNumber: 1, pageSize: 200, tenantId: tenantId ?? null, isActive: true }).subscribe({
      next: (page) => {
        const { rows } = readPagedList<any>(page?.result ?? page);
        this.engineers = rows.map((u: any) => ({
          label: u.fullName || u.userName || String(u.id),
          value: u.id
        }));
      }
    });
  }

  load() {
    this.filter.myAssignmentsOnly = this.myAssignmentsOnly || undefined;
    this.service.filter(this.filter).subscribe({
      next: (page) => {
        const { rows, total } = readPagedList<WorkOrder>(page);
        this.rows.set(rows);
        this.totalRecords = total;
      }
    });
  }

  onSearch() {
    this.filter.pageNumber = 1;
    this.load();
  }

  onFilterChange() {
    this.filter.pageNumber = 1;
    this.loadEngineers();
    this.load();
  }

  openDetail(row: WorkOrder) {
    this.service.getById(row.id).subscribe((wo) => {
      this.active = wo;
      this.patchForms(wo);
      this.loadReplacements(wo.id);
      this.detailVisible = true;
    });
  }

  loadReplacements(workOrderId: number) {
    this.partReplacementService.getByWorkOrder(workOrderId).subscribe({
      next: (list) => (this.replacements = list),
      error: () => (this.replacements = [])
    });
  }

  patchForms(wo: WorkOrder) {
    this.assignToUserId = wo.assignedToUserId ?? null;
    this.diagnosisForm = {
      initialProblem: wo.diagnosis?.initialProblem ?? wo.issueDescription ?? '',
      diagnosis: wo.diagnosis?.diagnosis ?? '',
      rootCause: wo.diagnosis?.rootCause ?? '',
      actionTaken: wo.diagnosis?.actionTaken ?? '',
      finalResult: wo.diagnosis?.finalResult ?? wo.finalResult ?? '',
      remarks: wo.diagnosis?.remarks ?? ''
    };
    this.completeForm = {
      workPerformed: wo.workPerformed ?? '',
      finalResult: wo.finalResult ?? '',
      remarks: wo.remarks ?? '',
      assetStatusAfterWork: wo.assetStatusAfterWork ?? null
    };
  }

  refreshActive() {
    if (!this.active) return;
    this.service.getById(this.active.id).subscribe((wo) => {
      this.active = wo;
      this.patchForms(wo);
      this.load();
    });
  }

  hideDetail() {
    this.detailVisible = false;
    this.active = null;
    this.replacements = [];
  }

  private woActionCtx(): WoPolicy.WorkOrderActionContext {
    return {
      userId: this.authService.getUserId(),
      hasPermission: (p) => this.authService.hasPermission(p)
    };
  }

  showAssignmentSection(wo: WorkOrder): boolean {
    return WoPolicy.showAssignmentSection(this.woActionCtx(), wo);
  }

  canAssign(wo: WorkOrder): boolean {
    return WoPolicy.canAssignWorkOrder(this.woActionCtx(), wo);
  }

  canReassign(wo: WorkOrder): boolean {
    return WoPolicy.canReassignWorkOrder(this.woActionCtx(), wo);
  }

  showEngineerActionBar(wo: WorkOrder): boolean {
    return WoPolicy.showEngineerActionBar(this.woActionCtx(), wo);
  }

  canAccept(wo: WorkOrder): boolean {
    return WoPolicy.canAcceptWorkOrder(this.woActionCtx(), wo);
  }

  canStart(wo: WorkOrder): boolean {
    return WoPolicy.canStartWorkOrder(this.woActionCtx(), wo);
  }

  canPause(wo: WorkOrder): boolean {
    return WoPolicy.canPauseWorkOrder(this.woActionCtx(), wo);
  }

  canWaitingForParts(wo: WorkOrder): boolean {
    return WoPolicy.canWaitingForParts(this.woActionCtx(), wo);
  }

  canResume(wo: WorkOrder): boolean {
    return WoPolicy.canResumeWorkOrder(this.woActionCtx(), wo);
  }

  canEditDiagnosis(wo: WorkOrder): boolean {
    return WoPolicy.canEditDiagnosis(this.woActionCtx(), wo);
  }

  showDiagnosisReadOnly(wo: WorkOrder): boolean {
    return WoPolicy.showDiagnosisReadOnly(wo) && !this.canEditDiagnosis(wo);
  }

  canComplete(wo: WorkOrder): boolean {
    return WoPolicy.canCompleteWorkOrder(this.woActionCtx(), wo);
  }

  showCompletionReadOnly(wo: WorkOrder): boolean {
    return WoPolicy.showCompletionReadOnly(this.woActionCtx(), wo);
  }

  showManagerApproval(wo: WorkOrder): boolean {
    return WoPolicy.showManagerApprovalSection(this.woActionCtx(), wo);
  }

  canApprove(wo: WorkOrder): boolean {
    return WoPolicy.canApproveWorkOrder(this.woActionCtx(), wo);
  }

  canReject(wo: WorkOrder): boolean {
    return WoPolicy.canRejectWorkOrder(this.woActionCtx(), wo);
  }

  canReopen(wo: WorkOrder): boolean {
    return WoPolicy.canReopenWorkOrder(this.woActionCtx(), wo);
  }

  canUploadAttachment(wo: WorkOrder): boolean {
    return WoPolicy.canUploadWorkOrderAttachment(this.woActionCtx(), wo);
  }

  canReplacePart(wo: WorkOrder): boolean {
    const allowed: number[] = [
      WoPolicy.WoStatus.Accepted,
      WoPolicy.WoStatus.InProgress,
      WoPolicy.WoStatus.WaitingForParts,
      WoPolicy.WoStatus.Reopened
    ];
    if (!allowed.includes(wo.status)) return false;
    const uid = this.authService.getUserId();
    return !!wo.assignedToUserId && uid != null && wo.assignedToUserId === uid;
  }

  openReplacementDialog() {
    if (!this.active) return;
    this.replacementForm = {
      workOrderId: this.active.id,
      oldAssetComponentId: 0,
      newSerialNumber: '',
      quantity: 1,
      removalReason: '',
      failureReason: '',
      installationLocation: '',
      remarks: '',
      markOldSerialFaulty: true
    };
    this.replacementValidation = null;
    this.batchOptions = [];
    this.loadAssetComponents(this.active.assetId);
    this.replacementDialogVisible = true;
  }

  replacementTenantId(): number | null {
    if (this.systemAdmin) return this.active?.tenantId ?? this.filter.tenantId ?? null;
    return this.authService.getTenantId();
  }

  loadAssetComponents(assetId: number) {
    this.metadata
      .getByType({
        type: 'AssetComponent',
        parentId: assetId,
        tenantId: this.replacementTenantId()
      })
      .subscribe({
        next: (res) => {
          const items = (res?.result ?? []) as MetaDataByTypeItemExtended[];
          this.assetComponentOptions = items.map((c) => ({
            label: c.displayName || c.name,
            value: c.id,
            partNumber: c.code?.trim() || undefined
          }));
        }
      });
  }

  onOldComponentChange() {
    this.replacementValidation = null;
    this.batchOptions = [];
    this.replacementForm.newPartInventoryBatchId = null;
    this.replacementForm.newPartId = null;
    if (!this.replacementForm.oldAssetComponentId) return;
    const comp = this.assetComponentOptions.find((o) => o.value === this.replacementForm.oldAssetComponentId);
    const pn = comp?.partNumber;
    if (!pn) return;
    this.metadata
      .getByType({
        type: 'Part',
        searchText: pn,
        tenantId: this.replacementTenantId()
      })
      .subscribe({
        next: (res) => {
          const parts = (res?.result ?? []) as MetaDataByTypeItemExtended[];
          const match = parts.find((p) => !p.isSerialized);
          if (!match) return;
          this.replacementForm.newPartId = match.id;
          this.loadBatchesForPart(match.id);
        }
      });
  }

  loadBatchesForPart(partId: number) {
    this.metadata
      .getByType({
        type: 'PartInventoryBatch',
        parentId: partId,
        tenantId: this.replacementTenantId()
      })
      .subscribe({
        next: (res) => {
          const batches = (res?.result ?? []) as MetaDataByTypeItemExtended[];
          this.batchOptions = batches.map((b) => ({
            label: b.displayName || b.name,
            value: b.id
          }));
        }
      });
  }

  lookupNewSerial() {
    if (!this.active || !this.replacementForm.newSerialNumber?.trim()) return;
    this.partReplacementService.lookupSerial(this.active.id, this.replacementForm.newSerialNumber.trim()).subscribe({
      next: (r) => {
        this.replacementValidation = r;
        if (r.newPart?.id) this.replacementForm.newPartId = r.newPart.id;
        if (r.serial?.id) this.replacementForm.newPartSerialNumberId = r.serial.id;
      },
      error: (e) =>
        this.messages.add({
          severity: 'error',
          summary: 'Lookup failed',
          detail: e?.error?.errors?.[0] || 'Serial lookup failed'
        })
    });
  }

  validateReplacement() {
    if (!this.active) return;
    const dto = { ...this.replacementForm, workOrderId: this.active.id };
    this.partReplacementService.validate(dto).subscribe({
      next: (r) => (this.replacementValidation = r),
      error: (e) =>
        this.messages.add({
          severity: 'error',
          summary: 'Validation failed',
          detail: e?.error?.errors?.[0] || 'Validation failed'
        })
    });
  }

  confirmReplacement() {
    if (!this.active || !this.replacementForm.oldAssetComponentId) {
      this.messages.add({ severity: 'warn', summary: 'Required', detail: 'Select the component being replaced.' });
      return;
    }
    this.replacementSaving = true;
    const dto = { ...this.replacementForm, workOrderId: this.active.id };
    this.partReplacementService.replace(dto).subscribe({
      next: () => {
        this.replacementSaving = false;
        this.replacementDialogVisible = false;
        this.messages.add({ severity: 'success', summary: 'Success', detail: 'Part replaced and installed.' });
        this.loadReplacements(this.active!.id);
        this.refreshActive();
      },
      error: (e) => {
        this.replacementSaving = false;
        this.messages.add({
          severity: 'error',
          summary: 'Replace failed',
          detail: e?.error?.errors?.[0] || e?.error?.result?.errors?.[0] || 'Replace failed'
        });
      }
    });
  }

  runAction(call: () => Observable<WorkOrder>, success: string) {
    if (!this.active) return;
    call().subscribe({
      next: () => {
        this.messages.add({ severity: 'success', summary: 'Success', detail: success });
        this.refreshActive();
      },
      error: (e) => this.messages.add({ severity: 'error', summary: 'Error', detail: e?.error?.errors?.[0] || 'Action failed' })
    });
  }

  doAssign(reassign: boolean) {
    if (!this.active || !this.assignToUserId) return;
    const dto = { id: this.active.id, assignedToUserId: this.assignToUserId, remarks: this.actionRemarks };
    this.runAction(() => (reassign ? this.service.reassign(dto) : this.service.assign(dto)), reassign ? 'Reassigned' : 'Assigned');
  }

  doAccept() {
    if (!this.active) return;
    this.runAction(() => this.service.accept({ id: this.active!.id, remarks: this.actionRemarks }), 'Accepted');
  }

  doStart() {
    if (!this.active) return;
    this.runAction(() => this.service.start({ id: this.active!.id, remarks: this.actionRemarks }), 'Work started');
  }

  doPause() {
    if (!this.active) return;
    this.runAction(() => this.service.pause({ id: this.active!.id, remarks: this.actionRemarks }), 'Paused');
  }

  doWaitingForParts() {
    if (!this.active) return;
    this.runAction(() => this.service.waitingForParts({ id: this.active!.id, remarks: this.actionRemarks }), 'Waiting for parts');
  }

  doResume() {
    if (!this.active) return;
    this.runAction(() => this.service.resume({ id: this.active!.id, remarks: this.actionRemarks }), 'Resumed');
  }

  saveDiagnosis() {
    if (!this.active) return;
    this.runAction(
      () =>
        this.service.upsertDiagnosis({
          workOrderId: this.active!.id,
          ...this.diagnosisForm
        }),
      'Diagnosis saved'
    );
  }

  doComplete() {
    if (!this.active) return;
    this.runAction(() => this.service.complete({ id: this.active!.id, ...this.completeForm }), 'Submitted for approval');
  }

  doApprove() {
    if (!this.active) return;
    this.runAction(
      () =>
        this.service.approve({
          id: this.active!.id,
          approvalRemarks: this.approveForm.approvalRemarks,
          restoreAssetOperational: this.approveForm.restoreAssetOperational
        }),
      'Approved and closed'
    );
  }

  doReject() {
    if (!this.active) return;
    this.runAction(() => this.service.reject({ id: this.active!.id, rejectionReason: this.rejectReason }), 'Rejected');
  }

  doReopen() {
    if (!this.active) return;
    this.runAction(() => this.service.reopen({ id: this.active!.id, remarks: this.actionRemarks }), 'Reopened');
  }

  uploadFile(event: { files: File[] }) {
    if (!this.active) return;
    for (const file of event.files) {
      this.service.uploadAttachment(this.active.id, file).subscribe({
        next: () => this.refreshActive(),
        error: () => this.messages.add({ severity: 'error', summary: 'Upload failed', detail: file.name })
      });
    }
  }

  downloadAttachment(id: number, fileName: string) {
    const url = `${environment.apiUrl}/workorder/attachments/${id}/download`;
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(a.href);
      }
    });
  }

  timelineEvents() {
    if (!this.active?.statusHistory?.length) return [];
    return this.active.statusHistory.map((h) => ({
      status: this.labelStatus(h.toStatus),
      date: h.changedAt,
      description: `${h.changedByUserName || 'User'}: ${h.remarks || ''}`
    }));
  }

  labelStatus(v: number): string {
    return this.statusMap.get(v) ?? String(v);
  }

  labelSource(v: number): string {
    return this.sourceMap.get(v) ?? String(v);
  }

  labelPriority(v: number): string {
    return this.priorityMap.get(v) ?? String(v);
  }

  statusSeverity(status: number): TagSeverity {
    if (status === 13) return 'success';
    if (status === 12 || status === 10) return 'secondary';
    if (status === 6 || status === 7) return 'warn';
    if (status === 8) return 'info';
    return 'info';
  }

  onPage(event: { page?: number; rows?: number; first?: number }) {
    this.filter.pageNumber = event.page != null ? event.page + 1 : Math.floor((event.first ?? 0) / (event.rows ?? 15)) + 1;
    this.filter.pageSize = event.rows ?? 15;
    this.load();
  }
}
