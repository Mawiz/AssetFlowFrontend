export interface ListFilterDto {
  pageSize: number;
  pageNumber: number;
  searchText?: string;
  orderByProp?: string;
  sortDirection?: number;
  isActive?: boolean | null;
  startDate?: Date | null;
  endDate?: Date | null;
  latestByDate?: Date;
}
