import axios from 'axios';
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  User,
  CreateUserRequest,
  UpdateUserRoleRequest,
  UserFilters,
  AuditLog,
  AuditLogFilters,
  PaginationMeta,
} from '@/types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  adminLogin: async (data: LoginRequest) => {
    const res = await api.post<ApiResponse<LoginResponse>>('/auth/admin/login', data);
    return res.data.data;
  },
  getMe: async () => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },
};

export const usersApi = {
  list: async (filters?: UserFilters) => {
    const params = new URLSearchParams();
    if (filters?.search) params.set('search', filters.search);
    if (filters?.role) params.set('role', filters.role);
    if (filters?.isActive) params.set('isActive', filters.isActive);
    const res = await api.get<ApiResponse<User[]>>('/users', { params });
    return res.data.data;
  },
  get: async (id: string) => {
    const res = await api.get<ApiResponse<User>>(`/users/${id}`);
    return res.data.data;
  },
  create: async (data: CreateUserRequest) => {
    const res = await api.post<ApiResponse<User>>('/users', data);
    return res.data.data;
  },
  updateRole: async (id: string, data: UpdateUserRoleRequest) => {
    const res = await api.patch<ApiResponse<User>>(`/users/${id}/role`, data);
    return res.data.data;
  },
};

export const auditLogsApi = {
  list: async (filters?: AuditLogFilters) => {
    const params = new URLSearchParams();
    if (filters?.search) params.set('search', filters.search);
    if (filters?.action) params.set('action', filters.action);
    if (filters?.entityType) params.set('entityType', filters.entityType);
    if (filters?.outcome) params.set('outcome', filters.outcome);
    if (filters?.startDate) params.set('startDate', filters.startDate);
    if (filters?.endDate) params.set('endDate', filters.endDate);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));
    const res = await api.get<ApiResponse<AuditLog[]> & { meta: PaginationMeta }>('/audit-logs', { params });
    return { data: res.data.data, meta: res.data.meta as PaginationMeta };
  },
};

export default api;
