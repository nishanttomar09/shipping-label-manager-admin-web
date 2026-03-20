export interface ApiResponse<T> {
  status: 'success';
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  status: 'error';
  message: string;
  error: {
    code: string;
    details: string | string[] | Record<string, unknown>;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
