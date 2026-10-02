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
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { AssetIssueService } from '../../services/asset-issue-service';
import { IssueCategoryService } from '../../services/issue-category-service';
import { AssetService } from '../../services/asset-service';
import { AssetIssue, AssetIssueFilter } from '../../model/issue';
import { Asset } from '../../model/asset';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';
import { MetadataService } from '@/services/metadata-service';
import { AuthService } from '@/services/auth-service';
import { readPagedList } from '../../utils/paged-list';
import { TenantDto } from '../../model/tenant';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments';
import { WorkOrderService } from '../../services/work-order-service';
import { Router } from '@angular/router';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

@Component({
  selector: 'app-asset-issue-component',
  standalone: true,
  templateUrl: './asset-issue-component.html',
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
    SelectModule,
    DatePickerModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    FileUploadModule,
    HasPermissionDirective
  ],
  providers: [MessageService]
})
export class AssetIssueComponent implements OnInit {
  Permissions = Permissions;
  rows = signal<AssetIssue[]>([]);
  totalRecords = 0;
  filter: AssetIssueFilter = { pageNumber: 1, pageSize: 15, searchText: '', tenantId: null };
  systemAdmin = false;
  tenantsForForm: { id: number; displayName: string }[] = [];
  tenantFilterOptions: { label: string; value: number | null }[] = [{ label: 'All tenants', value: null }];
  assets: { label: string; value: number }[] = [];
  categories: { label: string; value: number }[] = [];
  priorityOptions: { label: string; value: number }[] = [];
  assetStatusOptions: { label: string; value: number }[] = [];
  issueStatusOptions: { label: string; value: number | null }[] = [{ label: 'All', value: null }];
  priorityMap = new Map<number, string>();
  issueStatusMap = new Map<number, string>();
  assetStatusMap = new Map<number, string>();

  formDrawerVisible = false;
  detailDrawerVisible = false;
  isEditing = false;
  submitted = false;
  form!: FormGroup;
  activeIssue: AssetIssue | null = null;
  selectedAssetPreview: Partial<Asset> | null = null;
  statusChangeStatus: number | null = null;
  statusRemarks = '';
  pendingUploads: File[] = [];

  constructor(
    private service: AssetIssueService,
    private categoryService: IssueCategoryService,
    private assetService: AssetService,
    private metadata: MetadataService,
    private authService: AuthService,
    private messages: MessageService,
    private fb: FormBuilder,
    private http: HttpClient,
    private workOrderService: WorkOrderService,
    private router: Router
  ) {}

  ngOnInit() {
    this.systemAdmin = this.authService.systemAdminPermissions();
    this.initForm();
    this.metadata.getEnums().subscribe((res: unknown) => {
      const data = (res as { result?: unknown })?.result ?? res;
      const enums = data as Record<string, { text: string; value: number }[]>;
      this.priorityOptions = (enums?.['IssuePriority'] ?? []).map((x) => ({ label: x.text, value: x.value }));
      this.assetStatusOptions = (enums?.['AssetStatus'] ?? []).map((x) => ({ label: x.text, value: x.value }));
      (enums?.['IssuePriority'] ?? []).forEach((x) => this.priorityMap.set(x.value, x.text));
      (enums?.['AssetStatus'] ?? []).forEach((x) => this.assetStatusMap.set(x.value, x.text));
      (enums?.['IssueStatus'] ?? []).forEach((x) => {
        this.issueStatusMap.set(x.value, x.text);
        this.issueStatusOptions.push({ label: x.text, value: x.value });
      });
    });
    if (this.systemAdmin) {
      this.loadTenants();
    }
    this.loadDependents(this.getFormTenantId());
    this.load();
  }

  initForm() {
    this.form = this.fb.group({
      id: [null],
      tenantId: [this.systemAdmin ? null : this.getFixedTenantId(), this.systemAdmin ? Validators.required : []],
      assetId: [null, Validators.required],
      issueCategoryId: [null, Validators.required],
      priority: [null, Validators.required],
      assetStatusAtReport: [null, Validators.required],
      description: ['', Validators.required],
      immediateAction: [''],
      reportedAt: [new Date()]
    });
    if (this.systemAdmin) {
      this.form.get('tenantId')?.valueChanges.subscribe((tenantId) => {
        this.form.patchValue({ assetId: null, issueCategoryId: null }, { emitEvent: false });
        this.selectedAssetPreview = null;
        this.loadDependents(this.normalizeTenantId(tenantId));
      });
    }
    this.form.get('assetId')?.valueChanges.subscribe((assetId) => this.onAssetSelected(assetId));
  }

  private getFixedTenantId(): number | null {
    const t = this.authService.getTenantId();
    return t == null || t === 0 ? null : t;
  }

  private normalizeTenantId(tenantId: number | null | undefined): number | null {
    return tenantId == null || tenantId === 0 ? null : tenantId;
  }

  getFormTenantId(): number | null {
    if (!this.systemAdmin) return this.getFixedTenantId();
    return this.normalizeTenantId(this.form?.get('tenantId')?.value);
  }

  loadTenants() {
    this.metadata.getMetadataValues({ secretKeys: ['Tenant'] }).subscribe({
      next: (res) => {
        const tenants = res.result?.metaResult[0]?.data || [];
        this.tenantsForForm = tenants.map((t: TenantDto) => ({
          id: t.id,
          displayName: (t as { displayName?: string }).displayName || t.companyName || String(t.id)
        }));
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

  loadDependents(tenantId: number | null) {
    if (this.systemAdmin && tenantId == null) {
      this.assets = [];
      this.categories = [];
      return;
    }
    const tid = tenantId ?? undefined;
    this.assetService.filter({ pageNumber: 1, pageSize: 500, isActive: true, tenantId: tid ?? null }).subscribe((a) => {
      const { rows } = readPagedList<Asset>(a);
      this.assets = rows.map((x) => ({ label: `${x.assetCode} — ${x.name}`, value: x.id }));
    });
    this.categoryService.getAll(tid).subscribe((c) => {
      this.categories = c.filter((x) => x.isActive).map((x) => ({ label: x.name, value: x.id }));
    });
  }

  onAssetSelected(assetId: number | null) {
    if (!assetId) {
      this.selectedAssetPreview = null;
      return;
    }
    this.assetService.getById(assetId).subscribe({
      next: (a) => {
        this.selectedAssetPreview = a;
        if (this.form.get('assetStatusAtReport')?.value == null) {
          this.form.patchValue({ assetStatusAtReport: a.status });
        }
      }
    });
  }

  load() {
    this.service.filter(this.filter).subscribe({
      next: (page) => {
        const { rows, total } = readPagedList<AssetIssue>(page);
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

  onFilterChange() {
    this.filter.pageNumber = 1;
    this.load();
  }

  onTenantFilterChange() {
    this.filter.pageNumber = 1;
    this.load();
  }

  openNew() {
    this.isEditing = false;
    this.submitted = false;
    this.pendingUploads = [];
    this.selectedAssetPreview = null;
    this.form.reset({
      tenantId: this.systemAdmin ? null : this.getFixedTenantId(),
      reportedAt: new Date(),
      priority: this.priorityOptions[0]?.value ?? null,
      assetStatusAtReport: null
    });
    this.loadDependents(this.getFormTenantId());
    this.formDrawerVisible = true;
  }

  openEdit(row: AssetIssue) {
    if (row.status === 3 || row.status === 4) {
      this.messages.add({ severity: 'warn', summary: 'Not editable', detail: 'Resolved or cancelled issues cannot be edited.' });
      return;
    }
    this.isEditing = true;
    this.submitted = false;
    this.pendingUploads = [];
    this.service.getById(row.id).subscribe({
      next: (issue) => {
        this.activeIssue = issue;
        this.loadDependents(this.normalizeTenantId(issue.tenantId));
        this.form.patchValue({
          id: issue.id,
          tenantId: this.normalizeTenantId(issue.tenantId),
          assetId: issue.assetId,
          issueCategoryId: issue.issueCategoryId,
          priority: issue.priority,
          assetStatusAtReport: issue.assetStatusAtReport,
          description: issue.description,
          immediateAction: issue.immediateAction,
          reportedAt: issue.reportedAt ? new Date(issue.reportedAt) : new Date()
        });
        this.form.get('assetId')?.disable();
        if (this.systemAdmin) {
          this.form.get('tenantId')?.disable();
        }
        this.onAssetSelected(issue.assetId);
        this.formDrawerVisible = true;
      }
    });
  }

  openDetail(row: AssetIssue) {
    this.service.getById(row.id).subscribe({
      next: (issue) => {
        this.activeIssue = issue;
        this.statusChangeStatus = issue.status;
        this.statusRemarks = issue.resolutionRemarks ?? '';
        this.detailDrawerVisible = true;
      }
    });
  }

  hideFormDrawer() {
    this.formDrawerVisible = false;
    this.submitted = false;
    this.form.get('assetId')?.enable();
    if (this.systemAdmin) {
      this.form.get('tenantId')?.enable();
    }
  }

  hideDetailDrawer() {
    this.detailDrawerVisible = false;
    this.activeIssue = null;
  }

  save() {
    this.submitted = true;
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    if (this.isEditing && raw.id) {
      const payload = {
        id: raw.id,
        issueCategoryId: raw.issueCategoryId,
        priority: raw.priority,
        description: raw.description,
        assetStatusAtReport: raw.assetStatusAtReport,
        immediateAction: raw.immediateAction
      };
      this.service.update(payload).subscribe({
        next: (issue) => {
          this.uploadPending(issue.id, () => {
            this.hideFormDrawer();
            this.load();
            this.messages.add({ severity: 'success', summary: 'Saved', detail: 'Issue updated' });
          });
        },
        error: (e) =>
          this.messages.add({ severity: 'error', summary: 'Error', detail: e?.error?.errors?.[0] || 'Save failed' })
      });
      return;
    }
    const payload = {
      tenantId: this.systemAdmin ? this.normalizeTenantId(raw.tenantId) : this.getFixedTenantId(),
      assetId: raw.assetId,
      issueCategoryId: raw.issueCategoryId,
      priority: raw.priority,
      description: raw.description,
      assetStatusAtReport: raw.assetStatusAtReport,
      immediateAction: raw.immediateAction,
      reportedAt: raw.reportedAt
    };
    this.service.create(payload).subscribe({
      next: (issue) => {
        this.uploadPending(issue.id, () => {
          this.hideFormDrawer();
          this.load();
          this.messages.add({ severity: 'success', summary: 'Saved', detail: `Issue ${issue.issueNumber} created` });
        });
      },
      error: (e) =>
        this.messages.add({ severity: 'error', summary: 'Error', detail: e?.error?.errors?.[0] || 'Save failed' })
    });
  }

  private uploadPending(issueId: number, done: () => void) {
    if (!this.pendingUploads.length) {
      done();
      return;
    }
    let i = 0;
    const next = () => {
      if (i >= this.pendingUploads.length) {
        done();
        return;
      }
      const file = this.pendingUploads[i++];
      this.service.uploadAttachment(issueId, file).subscribe({
        next: () => next(),
        error: () => {
          this.messages.add({ severity: 'warn', summary: 'Upload', detail: `Failed to upload ${file.name}` });
          next();
        }
      });
    };
    next();
  }

  onFilesSelected(event: { files: File[] }) {
    this.pendingUploads = [...this.pendingUploads, ...event.files];
  }

  removePendingFile(index: number) {
    this.pendingUploads.splice(index, 1);
  }

  applyStatusChange() {
    if (!this.activeIssue || this.statusChangeStatus == null) return;
    this.service
      .changeStatus({
        id: this.activeIssue.id,
        status: this.statusChangeStatus,
        resolutionRemarks: this.statusRemarks
      })
      .subscribe({
        next: (issue) => {
          this.activeIssue = issue;
          this.load();
          this.messages.add({ severity: 'success', summary: 'Status', detail: 'Issue status updated' });
        },
        error: (e) =>
          this.messages.add({ severity: 'error', summary: 'Error', detail: e?.error?.errors?.[0] || 'Status change failed' })
      });
  }

  uploadOnDetail(event: { files: File[] }) {
    if (!this.activeIssue) return;
    for (const file of event.files) {
      this.service.uploadAttachment(this.activeIssue.id, file).subscribe({
        next: () => this.refreshActiveIssue(),
        error: () => this.messages.add({ severity: 'error', summary: 'Upload failed', detail: file.name })
      });
    }
  }

  refreshActiveIssue() {
    if (!this.activeIssue) return;
    this.service.getById(this.activeIssue.id).subscribe((issue) => (this.activeIssue = issue));
  }

  downloadAttachment(attachmentId: number, fileName: string) {
    const url = `${environment.apiUrl}/assetissue/attachments/${attachmentId}/download`;
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(a.href);
      },
      error: () => this.messages.add({ severity: 'error', summary: 'Download', detail: 'Could not download file' })
    });
  }

  deleteAttachment(attachmentId: number) {
    this.service.deleteAttachment(attachmentId).subscribe({
      next: () => this.refreshActiveIssue(),
      error: () => this.messages.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' })
    });
  }

  prioritySeverity(priority: number): TagSeverity {
    if (priority === 1) return 'danger';
    if (priority === 2) return 'warn';
    if (priority === 3) return 'info';
    return 'secondary';
  }

  issueStatusSeverity(status: number): TagSeverity {
    if (status === 1) return 'info';
    if (status === 2) return 'warn';
    if (status === 3) return 'success';
    if (status === 4) return 'secondary';
    return 'contrast';
  }

  labelPriority(v: number): string {
    return this.priorityMap.get(v) ?? String(v);
  }

  labelIssueStatus(v: number): string {
    return this.issueStatusMap.get(v) ?? String(v);
  }

  labelAssetStatus(v: number): string {
    return this.assetStatusMap.get(v) ?? String(v);
  }

  get reporterDisplay(): string {
    return this.authService.getUserName() ?? 'Current user';
  }

  get canEditActive(): boolean {
    if (!this.activeIssue) return false;
    return this.activeIssue.status !== 3 && this.activeIssue.status !== 4;
  }

  get canCreateWorkOrder(): boolean {
    return !!this.activeIssue && !this.activeIssue.workOrderId;
  }

  createWorkOrderFromIssue() {
    if (!this.activeIssue) return;
    const tenantId = this.systemAdmin ? this.normalizeTenantId(this.activeIssue.tenantId) : this.getFixedTenantId();
    this.workOrderService
      .createFromIssue({
        tenantId,
        assetIssueId: this.activeIssue.id,
        title: this.activeIssue.description?.slice(0, 200),
        description: this.activeIssue.description
      })
      .subscribe({
        next: (wo) => {
          this.messages.add({ severity: 'success', summary: 'Work Order', detail: wo.workOrderNumber + ' created' });
          this.activeIssue = { ...this.activeIssue!, workOrderId: wo.id };
          this.router.navigate(['/modules/work-orders']);
        },
        error: (e) =>
          this.messages.add({ severity: 'error', summary: 'Error', detail: e?.error?.errors?.[0] || 'Could not create work order' })
      });
  }

  get issueStatusChangeOptions(): { label: string; value: number }[] {
    return this.issueStatusOptions.filter((o): o is { label: string; value: number } => o.value != null);
  }

  onPage(event: { page?: number; rows?: number; first?: number }) {
    this.filter.pageNumber = event.page != null ? event.page + 1 : Math.floor((event.first ?? 0) / (event.rows ?? 10)) + 1;
    this.filter.pageSize = event.rows ?? 15;
    this.load();
  }
}
