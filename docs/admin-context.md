# Shipping Label Manager - Admin Frontend Context

## Overview

| Field | Value |
| ----- | ----- |
| Focus | User management, audit log viewing, admin-only authentication |
| API Prefix | `/api/v1` |
| Auth Model | Bearer JWT access token (single token, no refresh rotation) |
| Role Requirement | All endpoints below require `UserRole.ADMIN` unless marked otherwise |
| Goal | Admin frontend can implement all admin flows end-to-end without guessing request/response shapes |

## Global API Rules

All global rules from [`context.md`](./context.md) apply identically:

- Base path `/api/v1/...`, URI-based versioning, CORS enabled.
- Validation: `whitelist: true`, `forbidNonWhitelisted: true`, `stopAtFirstError: true`.
- JWT auth globally applied; `@Public()` endpoints skip auth.
- Standard success/error envelope format.
- Auth error responses (401/403) are identical.

### Admin-Specific Differences

| Difference | Detail |
| ---------- | ------ |
| Login endpoint | Admin uses `POST /auth/admin/login`, NOT `/auth/login` |
| Login rejection | `/auth/admin/login` rejects non-ADMIN users with `401 "Invalid email or password."` |
| Regular login rejection | `/auth/login` rejects ADMIN users with `401 "Invalid email or password."` |
| Role guard | All `/users` and `/audit-logs` endpoints are decorated `@Roles(UserRole.ADMIN)` — non-ADMIN users receive `403 "You do not have permission to perform this action."` |

---

## Domain Enums

### UserRole

```
ADMIN | OPERATOR | VIEWER
```

---

## Domain Entities

### User

| Field | Type | Notes |
| ----- | ---- | ----- |
| `id` | `string` (UUID) | |
| `email` | `string` | Unique |
| `name` | `string` | |
| `role` | `UserRole` | Default `OPERATOR` when created via admin |
| `isActive` | `boolean` | Default `true` |
| `createdAt` | `ISO date string` | |
| `updatedAt` | `ISO date string` | |

> **Note:** `passwordHash` is never returned in any API response. The service uses a Prisma `select` that explicitly excludes it.

### AuditLog

| Field | Type | Notes |
| ----- | ---- | ----- |
| `id` | `string` (UUID) | |
| `userId` | `string` (UUID) | User who performed the action |
| `userEmail` | `string` | Max 255 |
| `action` | `string` | HTTP method: `POST`, `PATCH`, `PUT`, `DELETE` |
| `entityType` | `string` | PascalCase, derived from route (e.g., `PurchaseOrders`, `Deliveries`, `Users`) |
| `entityId` | `string \| null` | UUID of affected entity, if present in route |
| `route` | `string` | Full request path (e.g., `/api/v1/users`) |
| `requestBody` | `JSON \| null` | Request body with sensitive fields redacted |
| `statusCode` | `integer` | HTTP response status code |
| `success` | `boolean` | `true` if status 200-399 |
| `errorMessage` | `string \| null` | Error message for failed requests |
| `ipAddress` | `string \| null` | Max 45 |
| `userAgent` | `string \| null` | Max 500 |
| `durationMs` | `integer \| null` | Request duration in milliseconds |
| `createdAt` | `ISO date string` | |

---

## Endpoint Contract Matrix

### Admin Auth

| Endpoint | Method | Auth | Purpose |
| -------- | ------ | ---- | ------- |
| `/auth/admin/login` | `POST` | No | Admin login, rejects non-ADMIN users |

### User Management (all `@Roles(UserRole.ADMIN)`)

| Endpoint | Method | Auth | Purpose |
| -------- | ------ | ---- | ------- |
| `/users` | `GET` | Yes (ADMIN) | List all users with optional filters |
| `/users/:id` | `GET` | Yes (ADMIN) | Get single user by ID |
| `/users` | `POST` | Yes (ADMIN) | Create a new user |
| `/users/:id/role` | `PATCH` | Yes (ADMIN) | Update user role and/or active status |

### Audit Logs (all `@Roles(UserRole.ADMIN)`)

| Endpoint | Method | Auth | Purpose |
| -------- | ------ | ---- | ------- |
| `/audit-logs` | `GET` | Yes (ADMIN) | List audit logs with filters and pagination |

---

## Detailed API Contracts

### 1) Admin Login

`POST /api/v1/auth/admin/login`

Auth: None (`@Public()`)

Request:

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

Validation:
- `email`: required, must be valid email, trimmed and lowercased
- `password`: required, string, minimum 8 characters

Success `200`:

```json
{
  "status": "success",
  "message": "Login successful.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "tokenType": "Bearer",
    "expiresIn": "1d",
    "user": {
      "id": "uuid",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "ADMIN",
      "isActive": true,
      "createdAt": "2026-03-18T10:00:00.000Z",
      "updatedAt": "2026-03-18T10:00:00.000Z"
    }
  }
}
```

Errors:

- `401` `"Invalid email or password."` — wrong credentials, user not found, or **user is not an ADMIN**
- `403` `"User account is inactive."` — account deactivated
- `400` — validation errors (invalid email format, password under 8 chars, unknown fields)

---

### 2) List Users

`GET /api/v1/users`

Auth: Bearer JWT required, ADMIN role required

Query Parameters:

| Param | Type | Required | Notes |
| ----- | ---- | -------- | ----- |
| `role` | `UserRole` | No | Filter by role: `ADMIN`, `OPERATOR`, `VIEWER` |
| `isActive` | `boolean` | No | Filter by active status (query string `"true"` / `"false"`) |
| `search` | `string` | No | Case-insensitive search across `name` and `email`, max 255, trimmed |

Success `200`:

```json
{
  "status": "success",
  "message": "Users retrieved successfully.",
  "data": [
    {
      "id": "uuid",
      "email": "operator@example.com",
      "name": "Operator User",
      "role": "OPERATOR",
      "isActive": true,
      "createdAt": "2026-03-18T10:00:00.000Z",
      "updatedAt": "2026-03-18T10:00:00.000Z"
    }
  ]
}
```

Notes:
- Returns **all** matching users (no pagination).
- Ordered by `createdAt` descending.
- `passwordHash` is never included.

Errors:

- `400` — validation errors (invalid `role` enum, invalid `isActive` value)
- `401` — missing/invalid token
- `403` `"You do not have permission to perform this action."` — non-ADMIN user

---

### 3) Get User

`GET /api/v1/users/:id`

Auth: Bearer JWT required, ADMIN role required

Path Parameters:
- `id`: UUID (validated by `ParseUUIDPipe`)

Success `200`:

```json
{
  "status": "success",
  "message": "User retrieved successfully.",
  "data": {
    "id": "uuid",
    "email": "operator@example.com",
    "name": "Operator User",
    "role": "OPERATOR",
    "isActive": true,
    "createdAt": "2026-03-18T10:00:00.000Z",
    "updatedAt": "2026-03-18T10:00:00.000Z"
  }
}
```

Errors:

- `400` — invalid UUID format
- `404` `"User not found."` — no user with given ID
- `401` — missing/invalid token
- `403` — non-ADMIN user

---

### 4) Create User

`POST /api/v1/users`

Auth: Bearer JWT required, ADMIN role required

Request:

```json
{
  "email": "newuser@example.com",
  "password": "securepass123",
  "name": "New User",
  "role": "OPERATOR"
}
```

Validation:
- `email`: required, must be valid email, trimmed and lowercased
- `password`: required, string, minimum 8 characters
- `name`: required, string, trimmed
- `role`: optional, must be valid `UserRole` enum. **Defaults to `OPERATOR`** if omitted.

Success `201`:

```json
{
  "status": "success",
  "message": "User created successfully.",
  "data": {
    "id": "uuid",
    "email": "newuser@example.com",
    "name": "New User",
    "role": "OPERATOR",
    "isActive": true,
    "createdAt": "2026-03-18T10:00:00.000Z",
    "updatedAt": "2026-03-18T10:00:00.000Z"
  }
}
```

Errors:

- `400` — validation errors
- `409` `"A user with this email already exists."` — duplicate email
- `401` — missing/invalid token
- `403` — non-ADMIN user

---

### 5) Update User Role/Status

`PATCH /api/v1/users/:id/role`

Auth: Bearer JWT required, ADMIN role required

Path Parameters:
- `id`: UUID (validated by `ParseUUIDPipe`)

Request:

```json
{
  "role": "VIEWER",
  "isActive": false
}
```

Validation:
- `role`: optional, must be valid `UserRole` enum
- `isActive`: optional, boolean

Both fields are optional, but at least one should be provided for the request to be meaningful.

Success `200`:

```json
{
  "status": "success",
  "message": "User updated successfully.",
  "data": {
    "id": "uuid",
    "email": "operator@example.com",
    "name": "Operator User",
    "role": "VIEWER",
    "isActive": false,
    "createdAt": "2026-03-18T10:00:00.000Z",
    "updatedAt": "2026-03-19T08:30:00.000Z"
  }
}
```

Errors:

- `400` `"You cannot modify your own role or status."` — admin tried to update themselves
- `400` `"Cannot remove the last active admin. Promote another user to admin first."` — demoting or deactivating the last active ADMIN
- `400` — validation errors
- `404` `"User not found."` — no user with given ID
- `401` — missing/invalid token
- `403` — non-ADMIN user

---

### 6) List Audit Logs

`GET /api/v1/audit-logs`

Auth: Bearer JWT required, ADMIN role required

Query Parameters:

| Param | Type | Required | Default | Notes |
| ----- | ---- | -------- | ------- | ----- |
| `userId` | `string` (UUID) | No | — | Filter by user ID |
| `action` | `string` | No | — | Filter by HTTP method (e.g., `POST`), max 10 chars, trimmed and uppercased |
| `entityType` | `string` | No | — | Filter by entity type (e.g., `Users`), max 100, trimmed |
| `entityId` | `string` (UUID) | No | — | Filter by entity ID |
| `success` | `boolean` | No | — | Filter by success status (`"true"` / `"false"`) |
| `search` | `string` | No | — | Case-insensitive search across `userEmail` and `route`, max 255, trimmed |
| `startDate` | `ISO date string` | No | — | Filter logs created on or after this date |
| `endDate` | `ISO date string` | No | — | Filter logs created on or before this date |
| `limit` | `integer` | No | `50` | Results per page, min 1, max 500 |
| `offset` | `integer` | No | `0` | Number of results to skip, min 0 |

Success `200`:

```json
{
  "status": "success",
  "message": "Audit logs retrieved successfully.",
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "userEmail": "admin@example.com",
      "action": "POST",
      "entityType": "Users",
      "entityId": "uuid",
      "route": "/api/v1/users",
      "requestBody": {
        "email": "newuser@example.com",
        "password": "[REDACTED]",
        "name": "New User",
        "role": "OPERATOR"
      },
      "statusCode": 201,
      "success": true,
      "errorMessage": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 ...",
      "durationMs": 142,
      "createdAt": "2026-03-18T12:00:00.000Z"
    }
  ],
  "meta": {
    "total": 156,
    "limit": 50,
    "offset": 0
  }
}
```

Notes:
- Ordered by `createdAt` descending.
- `requestBody` has sensitive fields redacted (see below).

Errors:

- `400` — validation errors (invalid UUID, invalid date, limit/offset out of range)
- `401` — missing/invalid token
- `403` — non-ADMIN user

---

## Audit Log Interceptor Behavior

The `AuditLogInterceptor` automatically captures audit logs. Key behaviors:

### What Is Logged

- **Only write methods**: `POST`, `PATCH`, `PUT`, `DELETE`
- **Only authenticated routes**: routes decorated with `@Public()` are skipped
- **Only when a user is authenticated**: unauthenticated requests are skipped

### What Is NOT Logged

- `GET` requests
- Public routes (e.g., `/auth/login`, `/auth/admin/login`)
- Requests without an authenticated user

### Sensitive Field Redaction

The following fields are replaced with `"[REDACTED]"` in `requestBody`:

- `password`
- `passwordHash`
- `token`
- `accessToken`
- `refreshToken`
- `secret`

Redaction is case-insensitive and applied recursively to nested objects and arrays.

### Entity Type Derivation

The `entityType` is derived from the first path segment after `/api/v1/`, converted from kebab-case to PascalCase:

| Route | entityType |
| ----- | ---------- |
| `/api/v1/users` | `Users` |
| `/api/v1/purchase-orders/:id` | `PurchaseOrders` |
| `/api/v1/deliveries/:id/approve` | `Deliveries` |
| `/api/v1/audit-logs` | `AuditLogs` |

The `entityId` is the first UUID found in the path segments after the entity type.

---

## Frontend State Contracts (TypeScript Types)

```typescript
// Enums
type UserRole = 'ADMIN' | 'OPERATOR' | 'VIEWER';

// Entities
interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuditLog {
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
  ipAddress: string | null;
  userAgent: string | null;
  durationMs: number | null;
  createdAt: string;
}

// Auth
interface AdminLoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: User;
}

// User Management
interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

interface UpdateUserRoleRequest {
  role?: UserRole;
  isActive?: boolean;
}

interface QueryUsersParams {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
}

// Audit Logs
interface QueryAuditLogsParams {
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  success?: boolean;
  search?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
}

// API Envelope
interface ApiSuccessResponse<T> {
  status: 'success';
  message: string;
  data: T;
  meta?: PaginationMeta;
}

interface ApiErrorResponse {
  status: 'error';
  message: string;
  error: {
    code: string;
    details: string | string[] | Record<string, unknown>;
  };
}
```

---

## Frontend Integration Blueprint

### Admin Login Flow

1. Admin enters credentials on admin login page.
2. `POST /api/v1/auth/admin/login` with `{ email, password }`.
3. On success: store `accessToken`, redirect to admin dashboard.
4. On `401`: show "Invalid email or password." (covers wrong creds AND non-admin accounts).
5. On `403`: show "User account is inactive."
6. On `400`: show validation errors.
7. Use `GET /api/v1/auth/me` on app load to validate session (same as operator frontend).

### User Management Flow

1. **List Users**: `GET /api/v1/users` on page load. Apply filters via query params.
2. **Create User**: form submits `POST /api/v1/users`. Handle `409` for duplicate email. Refresh list on success.
3. **View User**: `GET /api/v1/users/:id` for detail view.
4. **Update Role/Status**: `PATCH /api/v1/users/:id/role` with `{ role?, isActive? }`.
   - Disable self-modification (compare `user.id` from JWT with target user ID).
   - Show warning before demoting/deactivating an admin.
   - Handle `400` for last-admin protection.

### Audit Log Flow

1. **List Logs**: `GET /api/v1/audit-logs` with default pagination (`limit=50, offset=0`).
2. **Filter**: apply filter params via query string. All filters are optional and combinable.
3. **Paginate**: use `meta.total` to compute page count. Update `offset` for navigation.
4. **Date Range**: use `startDate` and `endDate` for time-based filtering.
5. **Search**: free-text search filters across `userEmail` and `route`.

---

## Critical Edge Cases

### Admin Login

- Non-ADMIN user attempting admin login gets the same `401 "Invalid email or password."` as wrong credentials — no role information is leaked.
- ADMIN user attempting regular login (`/auth/login`) is also rejected with `401` — admins must use the admin login endpoint.

### User Management

- **Self-modification blocked**: `PATCH /users/:id/role` returns `400` if `id` matches the authenticated user's ID. The frontend should proactively hide/disable the edit controls on the current user's row.
- **Last admin protection**: demoting or deactivating the last active admin returns `400 "Cannot remove the last active admin. Promote another user to admin first."`. This check considers both role change AND deactivation.
- **No pagination**: `findAll` returns all users. For orgs with many users, expect the full list in a single response.
- **Email uniqueness**: enforced at both application level (explicit check, `409`) and database level (unique constraint).

### Audit Logs

- **Read-only**: there is no endpoint to create, update, or delete audit logs manually. They are created automatically by the interceptor.
- **Pagination bounds**: `limit` is clamped to 1-500, `offset` minimum 0. Values outside range return `400`.
- **Sensitive data**: `requestBody` in audit logs has passwords and tokens redacted. The frontend never sees raw credentials.
- **Date filtering**: `startDate` and `endDate` must be valid ISO date strings. The filter uses `>=` for start and `<=` for end.
- **Action values**: only `POST`, `PATCH`, `PUT`, `DELETE` appear since GET requests are not logged.
