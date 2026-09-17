export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  hasNext: boolean;
  hasPrevious: boolean;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginationOptions {
  limit: number;
  offset: number;
  page: number;
  pageSize: number;
}
