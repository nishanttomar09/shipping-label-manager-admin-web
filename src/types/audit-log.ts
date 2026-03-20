export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: string | null;
  route: string;
  statusCode: number;
  duration: number;
  requestBody: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditLogFilters {
  search?: string;
  action?: string;
  entityType?: string;
  outcome?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
