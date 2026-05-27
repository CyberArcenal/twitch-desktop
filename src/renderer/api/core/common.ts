// src/renderer/api/common.ts
export interface BaseResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}