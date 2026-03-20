import type { UserRole } from './enums';

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface UpdateUserRoleRequest {
  role: UserRole;
  isActive: boolean;
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  isActive?: string;
}
