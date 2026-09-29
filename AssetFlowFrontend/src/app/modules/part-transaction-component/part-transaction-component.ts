import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PartTransaction, PartTransactionFilterDto } from '../../model/part-transaction';
import { PartTransactionService } from '../../services/part-transaction-service';
import { PartService } from '../../services/part-service';
import { Part } from '../../model/part';
import { LocationService } from '../../services/location-service';
import { Location } from '../../model/location';
import { AuthService } from '@/services/auth-service';
import { MetadataService } from '@/services/metadata-service';
import { HasPermissionDirective } from '@/directives/has-permission.directive';
import { Permissions } from '@/constants/permissions';

@Component({
  selector: 'app-part-transaction-component',
  standalone: true,
  templateUrl: './part-transaction-component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    SelectModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    ToastModule,
    HasPermissionDirective
  ],
  providers: [MessageService]
})
export class PartTransactionComponent implements OnInit {
  readonly Permissions = Permissions;
  rows = signal<PartTransaction[]>([]);
  totalRecords = 0;
  parts: Part[] = [];
  locations: Location[] = [];
  typeOptions: { label: string; value: number }[] = [];
  typeLabelMap = new Map<number, string>();
  dialogVisible = false;
  form!: FormGroup;
  submitted = false;

  filter: PartTransactionFilterDto = {
    pageNumber: 1,
    pageSize: 10,
    partId: null,
    transactionType: null
  };

  constructor(
    private transactionService: PartTransactionService,
    private partService: PartService,
    private locationService: LocationService,
    private metadataService: MetadataService,
    private authService: AuthService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      partId: [null, Validators.required],
      transactionType: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      fromLocationId: [null],
      toLocationId: [null],
      transactionDate: [new Date(), Validators.required],
      remarks: ['']
    });

    this.metadataService.getEnums().subscribe({
      next: (res) => {
        const data = res?.result ?? res;
        this.typeOptions = (data?.PartTransactionType ?? []).map((x: any) => {
          this.typeLabelMap.set(x.value, x.text);
          return { label: x.text, value: x.value };
        });
      }
    });

    this.partService.filter({ pageNumber: 1, pageSize: 500, isActive: true }).subscribe({
      next: (data) => (this.parts = data)
    });
    this.locationService.getAll({ pageNumber: 1, pageSize: 500, isActive: true }).subscribe({
      next: (data) => (this.locations = data)
    });
    this.load();
  }

  load() {
    this.transactionService.filter(this.filter).subscribe({
      next: (data) => {
        this.rows.set(data);
        this.totalRecords =
          data.length < this.filter.pageSize
            ? (this.filter.pageNumber - 1) * this.filter.pageSize + data.length
            : this.filter.pageNumber * this.filter.pageSize + 1;
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load transactions' })
    });
  }

  onPage(event: any) {
    this.filter.pageNumber = event.first / event.rows + 1;
    this.filter.pageSize = event.rows;
    this.load();
  }

  typeLabel(v: number) {
    return this.typeLabelMap.get(v) ?? String(v);
  }

  openCreate() {
    this.submitted = false;
    this.form.reset({
      quantity: 1,
      transactionDate: new Date()
    });
    this.dialogVisible = true;
  }

  save() {
    this.submitted = true;
    if (this.form.invalid) return;
    const raw = this.form.value;
    this.transactionService
      .create({
        ...raw,
        tenantId: this.authService.getTenantId()
      })
      .subscribe({
        next: () => {
          this.dialogVisible = false;
          this.load();
          this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Transaction recorded' });
        },
        error: (err) => {
          const detail = err?.error?.errors?.[0] || err?.error?.message || 'Create failed';
          this.messageService.add({ severity: 'error', summary: 'Error', detail });
        }
      });
  }
}
