// src/app/models/tenant.models.ts
export interface CreateTenantDto {
  companyName: string;
  subscriptionTypeId: number;
  languageIds: number[];
}

export interface UpdateTenantDto {
  id: number;
  companyName: string;
  subscriptionTypeId: number;
  languageIds: number[];
}

export interface TenantDto {
  id: number;
  companyName: string;
  subscriptionTypeId: number;
  languageIds: number[];
  isActive: boolean;
}

export interface LanguageDto {
  id: number;
  name: string;
  displayName?: string;
  code?: string;
}
