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
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { TagModule } from 'primeng/tag';
import { DrawerModule } from 'primeng/drawer';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';

import { ConfirmationService, MessageService } from 'primeng/api';

import { ListFilterDto } from '../../model/list-filter';
import { SubscriptionService } from '../../services/subscription-service';
import {
    SubscriptionType,
    CreateSubscriptionType,
    UpdateSubscriptionType
} from '../../model/subscription';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';

interface Column {
    field: string;
    header: string;
}

interface ExportColumn {
    title: string;
    dataKey: string;
}

@Component({
    selector: 'app-subscription-component',
    standalone: true,
    templateUrl: './subscription-component.html',
    styleUrls: ['./subscription-component.scss'],
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
        InputIconModule,
        IconFieldModule,
        TagModule,
        DialogModule,
        DatePickerModule,
        SelectModule,
        HasPermissionDirective
    ],
    providers: [MessageService, ConfirmationService]
})
export class SubscriptionComponent implements OnInit {
    readonly Permissions = Permissions;
    @ViewChild('dt') dt!: Table;

    subscriptions = signal<SubscriptionType[]>([]);

    selectedSubscriptions!: SubscriptionType[] | null;

    subscriptionFilter: ListFilterDto = {
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
    exportColumns!: ExportColumn[];

    statusOptions = [
        { label: 'All', value: null },
        { label: 'Active', value: true },
        { label: 'Inactive', value: false }
    ];

    constructor(
        private fb: FormBuilder,
        private service: SubscriptionService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.initForm();

        this.cols = [
            { field: 'name', header: 'Name' },
            { field: 'displayName', header: 'Display Name' },
            { field: 'description', header: 'Description' },
            { field: 'isActive', header: 'Active' }
        ];

        this.exportColumns = this.cols.map((col) => ({
            title: col.header,
            dataKey: col.field
        }));

        this.loadSubscriptions();
    }

    initForm() {
        this.form = this.fb.group({
            name: ['', Validators.required],
            displayName: ['', Validators.required],
            description: ['']
        });
    }
onSort(event: any) {

  this.subscriptionFilter.orderByProp = event.field;

  this.subscriptionFilter.sortDirection =
    event.order === 1 ? 1 : 2;

  this.loadSubscriptions();
}
    loadSubscriptions(resetPage = false) {
        if (resetPage) {
            this.subscriptionFilter.pageNumber = 1;
        }

        this.service.getAll(this.subscriptionFilter).subscribe({
            next: (res: any) => {
                const list = res || [];

                this.subscriptions.set(list);

                this.totalRecords = list.length;
            },

            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load subscriptions'
                });
            }
        });
    }

    onSubscriptionSearch() {
        this.subscriptionFilter.pageNumber = 1;

        this.loadSubscriptions();
    }

    onSubscriptionPage(event: any) {
        this.subscriptionFilter.pageNumber = event.page + 1;

        this.subscriptionFilter.pageSize = event.rows;

        this.loadSubscriptions();
    }

    applyFilters() {
        this.subscriptionFilter.pageNumber = 1;

        this.loadSubscriptions();

        this.filterDialogVisible = false;
    }

    clearFilters() {
        this.subscriptionFilter = {
            pageNumber: 1,
            pageSize: 10,
            searchText: '',
            isActive: null,
            startDate: null,
            endDate: null
        };

        this.loadSubscriptions();

        this.filterDialogVisible = false;
    }

    exportCSV() {
        this.dt?.exportCSV();
    }

    openNew() {
        this.form.reset();

        this.isEditing = false;

        this.selectedId = null;

        this.submitted = false;

        this.drawerVisible = true;
    }

    editSubscription(sub: SubscriptionType) {
        this.isEditing = true;

        this.selectedId = sub.id;

        this.drawerVisible = true;

        this.form.patchValue(sub);
    }

    hideDrawer() {
        this.drawerVisible = false;

        this.submitted = false;
    }

    saveSubscription() {
        this.submitted = true;

        if (this.form.invalid) return;

        if (this.isEditing && this.selectedId) {
            const dto: UpdateSubscriptionType = {
                id: this.selectedId,
                ...this.form.value
            };

            this.service.update(dto).subscribe({
                next: () => {
                    this.loadSubscriptions();

                    this.drawerVisible = false;

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Updated',
                        detail: 'Subscription updated successfully'
                    });
                },

                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to update subscription'
                    });
                }
            });
        } else {
            const dto: CreateSubscriptionType = this.form.value;

            this.service.create(dto).subscribe({
                next: () => {
                    this.loadSubscriptions();

                    this.drawerVisible = false;

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Created',
                        detail: 'Subscription created successfully'
                    });
                },

                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to create subscription'
                    });
                }
            });
        }
    }

    deleteSelectedSubscriptions() {
        this.confirmationService.confirm({
            message:
                'Are you sure you want to delete the selected subscriptions?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',

            accept: () => {
                if (!this.selectedSubscriptions?.length) return;

                const deleteCalls = this.selectedSubscriptions.map((s) =>
                    this.service.delete(s.id)
                );

                deleteCalls.forEach((obs) =>
                    obs.subscribe(() => this.loadSubscriptions())
                );

                this.selectedSubscriptions = null;

                this.messageService.add({
                    severity: 'success',
                    summary: 'Deleted',
                    detail: 'Selected subscriptions deleted'
                });
            }
        });
    }

    deleteSubscription(sub: SubscriptionType) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${sub.displayName}"?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',

            accept: () => {
                this.service.delete(sub.id).subscribe({
                    next: () => {
                        this.loadSubscriptions();

                        this.messageService.add({
                            severity: 'success',
                            summary: 'Deleted',
                            detail: 'Subscription deleted successfully'
                        });
                    },

                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to delete subscription'
                        });
                    }
                });
            }
        });
    }

    toggleActive(sub: SubscriptionType) {
        const action = sub.isActive ? 'Deactivate' : 'Activate';

        this.confirmationService.confirm({
            message: `Are you sure you want to ${action.toLowerCase()} "${sub.displayName}"?`,
            header: 'Confirm',
            icon: 'pi pi-question-circle',

            accept: () => {
                this.service.toggleStatus(sub.id).subscribe({
                    next: () => {
                        this.loadSubscriptions();

                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: `Subscription ${action.toLowerCase()}d`
                        });
                    },

                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: `Failed to ${action.toLowerCase()}`
                        });
                    }
                });
            }
        });
    }

    onGlobalFilter(event: Event, table: Table) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }
}