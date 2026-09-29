export interface Supplier {
  id: number;
  tenantId?: number | null;
  tenantName?: string | null;
  name: string;
  code: string;
  description?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  isActive: boolean;
}

export interface CreateSupplier {
  tenantId?: number | null;
  name: string;
  code: string;
  description?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  isActive: boolean;
}

export interface UpdateSupplier extends CreateSupplier {
  id: number;
}
