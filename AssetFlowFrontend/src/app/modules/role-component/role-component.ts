import { Component, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
    FormsModule,
    ReactiveFormsModule,
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';

import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DrawerModule } from 'primeng/drawer';
import { CheckboxModule } from 'primeng/checkbox';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';

import { ConfirmationService, MessageService } from 'primeng/api';

import { RoleService } from '../../services/role-service';
import { TenantService } from '../../services/tenant-service';
import { AuthService } from '../../services/auth-service';

import {
    CreateRoleDto,
    UpdateRoleDto,
    RoleDto,
    ResourceDto,
    SubResourceDto
} from '../../model/role';

import { TenantDto } from '../../model/tenant';
import { ListFilterDto } from '../../model/list-filter';
import { MetadataService } from '@/services/metadata-service';

interface Column {
    field: string;
    header: string;
}

@Component({
    selector: 'app-role-component',
    standalone: true,
    templateUrl: './role-component.html',
    styleUrls: ['./role-component.scss'],
    imports: [
        CommonModule,
        FormsModule,
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
        CheckboxModule,
        TagModule,
        SelectModule,
        IconFieldModule,
        InputIconModule,
        DialogModule,
        DatePickerModule,
        CardModule
    ],
    providers: [MessageService, ConfirmationService]
})
export class RoleComponent implements OnInit {

    @ViewChild('dt') dt!: Table;

    roles = signal<RoleDto[]>([]);

    selectedRoles!: RoleDto[] | null;

    resources: ResourceDto[] = [];

    tenants: TenantDto[] = [];

    currentUser: any;

    systemAdmin: boolean = false;

    form!: FormGroup;

    drawerVisible = false;

    submitted = false;

    isEditing = false;

    selectedId: number | null = null;

    filterDialogVisible = false;

    roleFilter: ListFilterDto = {
        pageNumber: 1,
        pageSize: 10,
        searchText: '',
        isActive: null,
        startDate: null,
        endDate: null
    };

    totalRecords = 0;

    cols!: Column[];

    statusOptions = [
        { label: 'All', value: null },
        { label: 'Active', value: true },
        { label: 'Inactive', value: false }
    ];

    constructor(
        private fb: FormBuilder,
        private service: RoleService,
        private tenantService: TenantService,
        private authService: AuthService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private metadataService: MetadataService
    ) {
        this.systemAdmin = this.authService.systemAdminPermissions();
    }

    ngOnInit(): void {

        this.initForm();

        this.loadRoles();

        this.loadResources();

        this.loadTenants();

        this.currentUser = this.authService.getCurrentUser();

        this.cols = [
            { field: 'name', header: 'Role Name' },
            { field: 'displayName', header: 'Display Name' },
            { field: 'description', header: 'Description' }
        ];

        if (!this.currentUser?.tenantId || this.currentUser.tenantId === 0) {

            this.cols.push({
                field: 'tenantName',
                header: 'Tenant'
            });

        }
    }

    initForm() {

        this.form = this.fb.group({
            name: ['', Validators.required],
            displayName: ['', Validators.required],
            description: [''],
            tenantId: [null]
        });

    }

    exportCSV() {
        this.dt?.exportCSV();
    }

    onSort(event: any) {

        this.roleFilter.orderByProp = event.field;

        this.roleFilter.sortDirection =
            event.order === 1 ? 1 : 2;

        this.loadRoles();
    }

    loadRoles(resetPage = false) {

        if (resetPage) {
            this.roleFilter.pageNumber = 1;
        }

        this.service.getAll(this.roleFilter).subscribe({

            next: (res) => {

                const list = res || [];

                this.roles.set(list);

                this.totalRecords = list.length;
            },

            error: () =>

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load roles'
                })

        });
    }

    onRoleSearch() {

        this.roleFilter.pageNumber = 1;

        this.loadRoles();
    }

    onRolePage(event: any) {

        this.roleFilter.pageNumber = event.page + 1;

        this.roleFilter.pageSize = event.rows;

        this.loadRoles();
    }

    applyFilters() {

        this.roleFilter.pageNumber = 1;

        this.loadRoles();

        this.filterDialogVisible = false;
    }

    clearFilters() {

        this.roleFilter = {
            pageNumber: 1,
            pageSize: 10,
            searchText: '',
            isActive: null,
            startDate: null,
            endDate: null
        };

        this.loadRoles();

        this.filterDialogVisible = false;
    }

    loadResources() {

        this.service.getResources().subscribe({

            next: (res) => {

                const data = res || [];

                this.resources = data.map(r => ({
                    ...r,
                    checked: r.checked ?? false,
                    subResources: (r.subResources || []).map(s => ({
                        ...s,
                        checked: s.checked ?? false
                    }))
                }));
            },

            error: () =>

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load resources'
                })

        });
    }

    loadTenants() {

              const payload = {
            secretKeys: ['Language']
        };
        this.metadataService.getMetadataValues(payload).subscribe({

            next: (res) =>{
                    res.result?.metaResult[0]?.data || [];
            },
            error: () =>

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load tenants'
                })

        });
    }

    openNew() {

        this.form.reset();

        this.isEditing = false;

        this.drawerVisible = true;

        this.submitted = false;

        this.selectedId = null;

        this.resources.forEach(r => {

            r.checked = false;

            r.subResources.forEach(s => s.checked = false);

        });
    }

    editRole(role: RoleDto) {

        this.isEditing = true;

        this.drawerVisible = true;

        this.selectedId = role.id;

        this.form.patchValue({
            name: role.name,
            displayName: role.displayName,
            description: role.description,
            tenantId: role.tenantId
        });

        const ids = role.resourceIds || [];

        this.resources.forEach(r => {

            r.checked = ids.includes(r.id);

            r.subResources.forEach(s => {

                s.checked = ids.includes(s.id);

            });

        });
    }

    hideDrawer() {

        this.drawerVisible = false;

        this.submitted = false;
    }

    saveRole() {

        this.submitted = true;

        if (this.form.invalid) return;

        const selectedIds: number[] = [];

        this.resources.forEach(r => {

            if (r.checked) {
                selectedIds.push(r.id);
            }

            r.subResources.forEach(s => {

                if (s.checked) {
                    selectedIds.push(s.id);
                }

            });

        });

        const payload: CreateRoleDto | UpdateRoleDto = {

            ...(this.isEditing ? { id: this.selectedId! } : {}),

            name: this.form.value.name,

            displayName: this.form.value.displayName,

            description: this.form.value.description,

            tenantId: this.form.value.tenantId,

            resourceIds: selectedIds
        };

        const request = this.isEditing
            ? this.service.update(payload as UpdateRoleDto)
            : this.service.create(payload as CreateRoleDto);

        request.subscribe({

            next: () => {

                this.loadRoles();

                this.drawerVisible = false;

                this.messageService.add({
                    severity: 'success',
                    summary: this.isEditing ? 'Updated' : 'Created',
                    detail: `Role ${this.isEditing ? 'updated' : 'created'} successfully`
                });
            },

            error: () =>

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: `Failed to ${this.isEditing ? 'update' : 'create'} role`
                })

        });
    }

    deleteSelectedRoles() {

        this.confirmationService.confirm({

            message: 'Are you sure you want to delete the selected roles?',

            header: 'Confirm',

            icon: 'pi pi-exclamation-triangle',

            accept: () => {

                if (!this.selectedRoles) return;

                const deleteCalls = this.selectedRoles.map(r =>
                    this.service.delete(r.id)
                );

                deleteCalls.forEach(obs =>
                    obs.subscribe(() => this.loadRoles())
                );

                this.messageService.add({
                    severity: 'success',
                    summary: 'Deleted',
                    detail: 'Selected roles deleted'
                });

                this.selectedRoles = null;
            }

        });
    }

    deleteRole(role: RoleDto) {

        this.confirmationService.confirm({

            message: `Are you sure you want to delete "${role.displayName}"?`,

            header: 'Confirm',

            icon: 'pi pi-exclamation-triangle',

            accept: () => {

                this.service.delete(role.id).subscribe({

                    next: () => {

                        this.loadRoles();

                        this.messageService.add({
                            severity: 'success',
                            summary: 'Deleted',
                            detail: 'Role deleted successfully'
                        });
                    },

                    error: () =>

                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to delete role'
                        })

                });

            }

        });
    }

    onResourceChange(resource: ResourceDto) {

        resource.subResources.forEach(s =>
            s.checked = resource.checked
        );
    }

    onSubResourceChange(resource: ResourceDto, sub: SubResourceDto) {

        resource.checked =
            resource.subResources.some(s => s.checked);
    }

    onGlobalFilter(event: Event, table: Table) {

        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }
}