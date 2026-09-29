export interface PartCategory {
  id: number;
  tenantId?: number | null;
  tenantName?: string | null;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export interface CreatePartCategory {
  tenantId?: number | null;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export interface UpdatePartCategory extends CreatePartCategory {
  id: number;
}
