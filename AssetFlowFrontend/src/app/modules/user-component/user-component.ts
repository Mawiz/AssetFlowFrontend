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

import { UserService } from '../../services/user-service';
import { RoleService } from '../../services/role-service';
import { TenantService } from '../../services/tenant-service';
import { AuthService } from '../../services/auth-service';

import {
    CreateUserDto,
    UpdateUserDto,
    UserDto,
    UserFilterDto
} from '../../model/user';

import { ListFilterDto } from '../../model/list-filter';
import { RoleDto } from '../../model/role';
import { TenantDto } from '../../model/tenant';
import { MetadataService } from '@/services/metadata-service';

interface Column {
    field: string;
    header: string;
}

@Component({
    selector: 'app-user-component',
    standalone: true,
    templateUrl: './user-component.html',
    styleUrls: ['./user-component.scss'],
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
export class UserComponent implements OnInit {

    @ViewChild('dt') dt!: Table;

    users = signal<UserDto[]>([]);

    selectedUsers!: UserDto[] | null;

    roles: RoleDto[] = [];

    tenants: TenantDto[] = [];

    currentUser: any;

    systemAdmin = false;

    userFilter: ListFilterDto = {
        pageNumber: 1,
        pageSize: 10,
        searchText: '',
        isActive: null,
        startDate: null,
        endDate: null
    };

    totalRecords = 0;

    form!: FormGroup;

    drawerVisible = false;

    submitted = false;

    isEditing = false;

    selectedId: number | null = null;

    isPasswordRequired = true;

    filterDialogVisible = false;

    cols!: Column[];

    statusOptions = [
        { label: 'All', value: null },
        { label: 'Active', value: true },
        { label: 'Inactive', value: false }
    ];

    constructor(
        private fb: FormBuilder,
        private service: UserService,
        private roleService: RoleService,
        private tenantService: TenantService,
        private authService: AuthService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private metadataService: MetadataService
    ) {}

    ngOnInit(): void {

        this.currentUser = this.authService.getCurrentUser();

        this.systemAdmin =
            this.authService.systemAdminPermissions();

        this.initForm();

        this.loadUsers();

        this.loadRoles();

        if (this.systemAdmin) {
            this.loadTenants();
        }

        this.cols = [
            { field: 'fullName', header: 'Full Name' },
            { field: 'userName', header: 'Username' },
            { field: 'email', header: 'Email' },
            { field: 'roleName', header: 'Role' },
            { field: 'isActive', header: 'Status' }
        ];

        if (this.systemAdmin) {

            this.cols.splice(4, 0, {
                field: 'tenantName',
                header: 'Tenant'
            });

        }
    }

    initForm() {

        this.form = this.fb.group({
            fullName: ['', Validators.required],
            firstLetter: ['', Validators.required],
            userName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: [
                '',
                this.isPasswordRequired
                    ? Validators.required
                    : []
            ],
            roleId: [null, Validators.required],
            tenantId: [
                this.systemAdmin
                    ? null
                    : this.currentUser?.tenantId ?? null
            ]
        });
    }

    onSort(event: any) {

        this.userFilter.orderByProp = event.field;

        this.userFilter.sortDirection =
            event.order === 1 ? 1 : 2;

        this.loadUsers();
    }

    loadUsers(resetPage = false) {

        if (resetPage) {
            this.userFilter.pageNumber = 1;
        }

        // const filter: UserFilterDto = {
        //     pageSize: this.userFilter.pageSize,
        //     pageNumber: this.userFilter.pageNumber,
        //     searchText: this.userFilter.searchText,
        //     isActive: this.userFilter.isActive,
        //     startDate: this.userFilter.startDate,
        //     endDate: this.userFilter.endDate,
        //     orderByProp: this.userFilter.orderByProp,
        //     sortDirection: this.userFilter.sortDirection
        // };

        this.service.filter(this.userFilter).subscribe({

            next: (res) => {

                const list = res?.result || res || [];

                this.users.set(list);

                this.totalRecords =
                    res?.totalCount ?? list.length;
            },

            error: () =>
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load users'
                })

        });
    }

    onUserSearch() {

        this.userFilter.pageNumber = 1;

        this.loadUsers();
    }

    onUserPage(event: any) {

        this.userFilter.pageNumber =
            event.page + 1;

        this.userFilter.pageSize =
            event.rows;

        this.loadUsers();
    }

    applyFilters() {

        this.userFilter.pageNumber = 1;

        this.loadUsers();

        this.filterDialogVisible = false;
    }

    clearFilters() {

        this.userFilter = {
            pageNumber: 1,
            pageSize: 10,
            searchText: '',
            isActive: null,
            startDate: null,
            endDate: null
        };

        this.loadUsers();

        this.filterDialogVisible = false;
    }

    loadRoles() {

      
        const payload = {
            secretKeys: ['ApplicationRole']
        };
        this.metadataService.getMetadataValues(payload).subscribe({

            next: (res) =>
                this.roles =  res.result?.metaResult[0]?.data  || [],

            error: () =>
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load roles'
                })

        });
    }

    loadTenants() {

              const payload = {
            secretKeys: ['Tenant']
        };
        this.metadataService.getMetadataValues(payload).subscribe({

            next: (res) =>
                this.tenants =
                      res.result?.metaResult[0]?.data   || [],

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

        this.isPasswordRequired = true;

        this.form
            .get('password')
            ?.setValidators(Validators.required);

        this.form
            .get('password')
            ?.updateValueAndValidity();

        if (!this.systemAdmin) {

            this.form
                .get('tenantId')
                ?.setValue(
                    this.currentUser?.tenantId ?? null
                );

        } else {

            this.form
                .get('tenantId')
                ?.setValue(null);

        }
    }

    editUser(user: UserDto) {

        this.isEditing = true;

        this.drawerVisible = true;

        this.selectedId = user.id;

        this.isPasswordRequired = false;

        this.form
            .get('password')
            ?.setValidators([]);

        this.form
            .get('password')
            ?.updateValueAndValidity();

        this.form.patchValue({
            fullName: user.fullName,
            firstLetter: user.firstLetter,
            userName: user.userName,
            email: user.email,
            roleId: user.roleId,
            tenantId: this.systemAdmin
                ? user.tenantId ?? null
                : this.currentUser?.tenantId ?? null
        });
    }

    hideDrawer() {

        this.drawerVisible = false;

        this.submitted = false;
    }

    saveUser() {

        this.submitted = true;

        if (this.form.invalid) return;

        const basePayload = {
            fullName: this.form.value.fullName,
            firstLetter: this.form.value.firstLetter,
            userName: this.form.value.userName,
            email: this.form.value.email,
            roleId: this.form.value.roleId,
            tenantId: this.systemAdmin
                ? this.form.value.tenantId ?? null
                : this.currentUser?.tenantId ?? null
        };

        let payload: any;

        if (this.isEditing) {

            payload = {
                id: this.selectedId!,
                ...basePayload
            } as UpdateUserDto;

        } else {

            payload = {
                ...basePayload,
                password: this.form.value.password
            } as CreateUserDto;

        }

        const request = this.isEditing
            ? this.service.update(payload)
            : this.service.create(payload);

        request.subscribe({

            next: () => {

                this.loadUsers();

                this.drawerVisible = false;

                this.messageService.add({
                    severity: 'success',
                    summary: this.isEditing
                        ? 'Updated'
                        : 'Created',
                    detail:
                        `User ${
                            this.isEditing
                                ? 'updated'
                                : 'created'
                        } successfully`
                });

            },

            error: () =>
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail:
                        `Failed to ${
                            this.isEditing
                                ? 'update'
                                : 'create'
                        } user`
                })

        });
    }

    deleteSelectedUsers() {

        this.confirmationService.confirm({

            message:
                'Are you sure you want to delete the selected users?',

            header: 'Confirm',

            icon: 'pi pi-exclamation-triangle',

            accept: () => {

                if (!this.selectedUsers) return;

                const deleteCalls =
                    this.selectedUsers.map((u) =>
                        this.service.delete(u.id)
                    );

                deleteCalls.forEach((obs) =>
                    obs.subscribe(() =>
                        this.loadUsers()
                    )
                );

                this.messageService.add({
                    severity: 'success',
                    summary: 'Deleted',
                    detail:
                        'Selected users deleted'
                });

                this.selectedUsers = null;
            }

        });
    }

    deleteUser(user: UserDto) {

        this.confirmationService.confirm({

            message:
                `Are you sure you want to delete "${user.fullName}"?`,

            header: 'Confirm',

            icon: 'pi pi-exclamation-triangle',

            accept: () => {

                this.service.delete(user.id).subscribe({

                    next: () => {

                        this.loadUsers();

                        this.messageService.add({
                            severity: 'success',
                            summary: 'Deleted',
                            detail:
                                'User deleted successfully'
                        });

                    },

                    error: () =>
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail:
                                'Failed to delete user'
                        })

                });
            }

        });
    }

    onGlobalFilter(
        event: Event,
        table: Table
    ) {

        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }
}