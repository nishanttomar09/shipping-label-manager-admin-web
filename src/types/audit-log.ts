export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: string | null;
  route: string;
  requestBody: Record<string, unknown> | null;
  statusCode: number;
  success: boolean;
  errorMessage: string | null;
  ipAddress: string;
  userAgent: string;
  durationMs: number;
  createdAt: string;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  success?: boolean;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  perPage?: number;
}
