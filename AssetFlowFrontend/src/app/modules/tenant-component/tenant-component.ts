// tenant-component.ts

import { Component, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
    FormsModule,
    ReactiveFormsModule,
    FormBuilder,
    FormGroup,
    FormArray,
    Validators
} from '@angular/forms';

import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { DrawerModule } from 'primeng/drawer';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';

import {
    ConfirmationService,
    MessageService
} from 'primeng/api';

import { TenantService } from '../../services/tenant-service';
import { SubscriptionService } from '../../services/subscription-service';

import {
    CreateTenantDto,
    TenantDto,
    UpdateTenantDto
} from '../../model/tenant';

import { ListFilterDto } from '../../model/list-filter';
import { MetadataService } from '../../services/metadata-service';

interface Column {
    field: string;
    header: string;
}

@Component({
    selector: 'app-tenant-component',
    standalone: true,
    templateUrl: './tenant-component.html',
    styleUrls: ['./tenant-component.scss'],
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
        InputIconModule,
        IconFieldModule,
        TagModule,
        SelectModule,
        CheckboxModule,
        DialogModule,
        DatePickerModule
    ],
    providers: [MessageService, ConfirmationService]
})
export class TenantComponent implements OnInit {

    @ViewChild('dt') dt!: Table;

    tenants = signal<TenantDto[]>([]);

    selectedTenants!: TenantDto[] | null;

    subscriptionTypes: any[] = [];

    languages: any[] = [];

    tenantFilter: ListFilterDto = {
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

    filterDialogVisible = false;

    cols!: Column[];

    statusOptions = [
        { label: 'All', value: null },
        { label: 'Active', value: true },
        { label: 'Inactive', value: false }
    ];

    constructor(
        private fb: FormBuilder,
        private tenantService: TenantService,
        private subscriptionService: SubscriptionService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private metadataService: MetadataService
    ) {}

    ngOnInit(): void {

        this.initForm();

        this.loadTenants();

        this.loadSubscriptions();

        this.loadLanguages();

        this.cols = [
            { field: 'companyName', header: 'Company Name' },
            { field: 'subscriptionName', header: 'Subscription Type' },
            { field: 'isActive', header: 'Active' }
        ];
    }

    initForm() {

        this.form = this.fb.group({
            companyName: ['', Validators.required],
            subscriptionTypeId: [null, Validators.required],
            languages: this.fb.array([], Validators.required)
        });
    }

    get languagesArray(): FormArray {

        return this.form.get('languages') as FormArray;
    }

    onSort(event: any) {

        this.tenantFilter.orderByProp = event.field;

        this.tenantFilter.sortDirection =
            event.order === 1 ? 1 : 2;

        this.loadTenants();
    }

    loadTenants(resetPage = false) {

        if (resetPage) {
            this.tenantFilter.pageNumber = 1;
        }

        this.tenantService.getAll(this.tenantFilter).subscribe({

            next: (res) => {

                const list = res?.result || res || [];

                this.tenants.set(list);

                this.totalRecords =
                    res?.totalCount ?? list.length;
            },

            error: () => {

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load tenants'
                });
            }
        });
    }

    onTenantSearch() {

        this.tenantFilter.pageNumber = 1;

        this.loadTenants();
    }

    onTenantPage(event: any) {

        this.tenantFilter.pageNumber =
            event.page + 1;

        this.tenantFilter.pageSize =
            event.rows;

        this.loadTenants();
    }

    applyFilters() {

        this.tenantFilter.pageNumber = 1;

        this.loadTenants();

        this.filterDialogVisible = false;
    }

    clearFilters() {

        this.tenantFilter = {
            pageNumber: 1,
            pageSize: 10,
            searchText: '',
            isActive: null,
            startDate: null,
            endDate: null
        };

        this.loadTenants();

        this.filterDialogVisible = false;
    }

    loadSubscriptions() {

        this.metadataService.getMetadataValues({ secretKeys: ['SubscriptionType'] })
        .subscribe({

            next: (res) => {

                this.subscriptionTypes =
                    res.result?.metaResult[0]?.data  || [];
            },

            error: () => {

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load subscription types'
                });
            }
        });
    }

    loadLanguages() {

        const payload = {
            secretKeys: ['Language']
        };

        this.tenantService.getLanguages(payload).subscribe({

            next: (res) => {

                this.languages =
                    res.result?.metaResult[0]?.data || [];
            },

            error: () => {

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load languages'
                });
            }
        });
    }

    onLanguageChange(event: any, langId: number) {

        if (event.checked) {

            this.languagesArray.push(
                this.fb.control(langId)
            );

        } else {

            const index =
                this.languagesArray.controls.findIndex(
                    x => x.value === langId
                );

            if (index >= 0) {

                this.languagesArray.removeAt(index);
            }
        }

        this.languagesArray.updateValueAndValidity();
    }

    openNew() {

        this.form.reset();

        this.languagesArray.clear();

        this.isEditing = false;

        this.selectedId = null;

        this.submitted = false;

        this.drawerVisible = true;
    }

    editTenant(tenant: any) {

        this.isEditing = true;

        this.selectedId = tenant.id;

        this.drawerVisible = true;

        this.form.patchValue({
            companyName: tenant.companyName,
            subscriptionTypeId: tenant.subscriptionTypeId
        });

        this.languagesArray.clear();

        tenant.languageIds?.forEach((id: number) => {

            this.languagesArray.push(
                this.fb.control(id)
            );
        });
    }

    hideDrawer() {

        this.drawerVisible = false;

        this.submitted = false;
    }

    saveTenant() {

        this.submitted = true;

        if (this.form.invalid) return;

        const payload = {
            companyName: this.form.value.companyName,
            subscriptionTypeId: this.form.value.subscriptionTypeId,
            languageIds: this.languagesArray.value
        };

        if (this.isEditing && this.selectedId) {

            const dto: UpdateTenantDto = {
                id: this.selectedId,
                ...payload
            };

            this.tenantService.update(dto).subscribe({

                next: () => {

                    this.loadTenants();

                    this.drawerVisible = false;

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Updated',
                        detail: 'Tenant updated successfully'
                    });
                },

                error: () => {

                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to update tenant'
                    });
                }
            });

        } else {

            const dto: CreateTenantDto = payload;

            this.tenantService.create(dto).subscribe({

                next: () => {

                    this.loadTenants();

                    this.drawerVisible = false;

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Created',
                        detail: 'Tenant created successfully'
                    });
                },

                error: () => {

                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to create tenant'
                    });
                }
            });
        }
    }

    deleteSelectedTenants() {

        this.confirmationService.confirm({

            message:
                'Are you sure you want to delete the selected tenants?',

            header: 'Confirm',

            icon: 'pi pi-exclamation-triangle',

            accept: () => {

                if (!this.selectedTenants?.length) return;

                const deleteCalls =
                    this.selectedTenants.map((t) =>
                        this.tenantService.delete(t.id)
                    );

                deleteCalls.forEach((obs) =>
                    obs.subscribe(() =>
                        this.loadTenants()
                    )
                );

                this.selectedTenants = null;

                this.messageService.add({
                    severity: 'success',
                    summary: 'Deleted',
                    detail: 'Selected tenants deleted'
                });
            }
        });
    }

    deleteTenant(tenant: any) {

        this.confirmationService.confirm({

            message:
                `Are you sure you want to delete "${tenant.companyName}"?`,

            header: 'Confirm',

            icon: 'pi pi-exclamation-triangle',

            accept: () => {

                this.tenantService.delete(tenant.id).subscribe({

                    next: () => {

                        this.loadTenants();

                        this.messageService.add({
                            severity: 'success',
                            summary: 'Deleted',
                            detail: 'Tenant deleted successfully'
                        });
                    },

                    error: () => {

                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to delete tenant'
                        });
                    }
                });
            }
        });
    }

    toggleActive(tenant: any) {

        const action =
            tenant.isActive
                ? 'Deactivate'
                : 'Activate';

        this.confirmationService.confirm({

            message:
                `Are you sure you want to ${action.toLowerCase()} "${tenant.companyName}"?`,

            header: 'Confirm',

            icon: 'pi pi-question-circle',

            accept: () => {

                this.tenantService.toggleStatus(tenant.id).subscribe({

                    next: () => {

                        this.loadTenants();

                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: `Tenant ${action.toLowerCase()}d`
                        });
                    },

                    error: () => {

                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail:
                                `Failed to ${action.toLowerCase()} tenant`
                        });
                    }
                });
            }
        });
    }
}