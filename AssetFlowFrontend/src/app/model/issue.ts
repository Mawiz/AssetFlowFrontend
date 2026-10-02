import { ListFilterDto } from './list-filter';

export interface IssueCategory {
  id: number;
  tenantId?: number | null;
  tenantName?: string;
  code: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface IssueAttachment {
  id: number;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  downloadUrl: string;
}

export interface AssetIssue {
  id: number;
  tenantId?: number | null;
  tenantName?: string;
  issueNumber: string;
  assetId: number;
  assetCode?: string;
  assetName?: string;
  assetSerialNumber?: string;
  assetCriticality?: number;
  locationId: number;
  locationName?: string;
  locationDisplayPath?: string;
  reportedByUserId: number;
  reportedByUserName?: string;
  reportedAt: string | Date;
  issueCategoryId: number;
  issueCategoryName?: string;
  priority: number;
  description: string;
  assetStatusAtReport: number;
  immediateAction?: string;
  status: number;
  resolvedAt?: string | Date | null;
  resolvedByUserId?: number | null;
  resolvedByUserName?: string;
  resolutionRemarks?: string;
  workOrderId?: number | null;
  attachments?: IssueAttachment[];
}

export interface CreateAssetIssue {
  tenantId?: number | null;
  assetId: number;
  issueCategoryId: number;
  priority: number;
  description: string;
  assetStatusAtReport: number;
  immediateAction?: string;
  reportedAt?: string | Date | null;
}

export interface UpdateAssetIssue {
  id: number;
  issueCategoryId: number;
  priority: number;
  description: string;
  assetStatusAtReport: number;
  immediateAction?: string;
}

export interface ChangeAssetIssueStatus {
  id: number;
  status: number;
  resolutionRemarks?: string;
}

export interface AssetIssueFilter extends ListFilterDto {
  assetId?: number | null;
  issueCategoryId?: number | null;
  priority?: number | null;
  status?: number | null;
  locationId?: number | null;
  reportedByUserId?: number | null;
  reportedFrom?: string | Date | null;
  reportedTo?: string | Date | null;
}
