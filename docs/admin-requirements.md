# Shipping Label Manager - Admin Requirements and Tests

## How to Use This Document

Each requirement maps to a specific admin feature area. A requirement is passed when all listed tests pass. The project is complete when all P0 requirements pass and all P1 requirements pass, or explicit deferrals are approved.

---

## REQ-A1.01 - Admin Login (ADMIN-AUTH-001) `P0`

**Description**: Admin submits email and password via the admin login endpoint, receives a JWT access token and user profile. Non-ADMIN users are rejected.

### Tests

| # | Test | Type | Pass Criteria |
| --- | --- | --- | --- |
| A1.01.1 | `POST /api/v1/auth/admin/login` with valid ADMIN credentials returns `200` | API | Response includes `data.accessToken`, `data.tokenType: "Bearer"`, `data.expiresIn`, and `data.user` object |
| A1.01.2 | Login response user object has correct shape | API | `data.user` includes `id`, `email`, `name`, `role`, `isActive`, `createdAt`, `updatedAt` |
| A1.01.3 | Login response user role is `ADMIN` | API | `data.user.role` is `"ADMIN"` |
| A1.01.4 | Login with OPERATOR credentials returns `401` | API | Message is `"Invalid email or password."` — no role leakage |
| A1.01.5 | Login with VIEWER credentials returns `401` | API | Message is `"Invalid email or password."` — no role leakage |
| A1.01.6 | Login with wrong password returns `401` | API | Message is `"Invalid email or password."` |
| A1.01.7 | Login with non-existent email returns `401` | API | Same generic `"Invalid email or password."` message |
| A1.01.8 | Login with inactive ADMIN account returns `403` | API | Message is `"User account is inactive."` |
| A1.01.9 | Login with invalid email format returns `400` | API | Validation error returned |
| A1.01.10 | Login with password under 8 chars returns `400` | API | Validation error returned |
| A1.01.11 | Login with unknown fields returns `400` | API | `forbidNonWhitelisted` rejects extra properties |
| A1.01.12 | Frontend submits to `/auth/admin/login`, NOT `/auth/login` | UI | Admin login form targets correct endpoint |

---

## REQ-A1.02 - Admin Session Management (ADMIN-AUTH-002) `P0`

**Description**: Admin frontend attaches JWT to requests and handles session expiry. Session validation uses the same `/auth/me` endpoint.

### Tests

| # | Test | Type | Pass Criteria |
| --- | --- | --- | --- |
| A1.02.1 | `GET /api/v1/auth/me` with valid admin Bearer token returns `200` | API | Response includes user profile with `role: "ADMIN"` |
| A1.02.2 | Request without Authorization header returns `401` | API | Message is `"Authorization token is missing."` |
| A1.02.3 | Request with expired JWT returns `401` | API | Message is `"JWT token has expired."` |
| A1.02.4 | Request with malformed JWT returns `401` | API | Message is `"Invalid or missing authorization token."` |
| A1.02.5 | `GET /auth/me` for deactivated admin returns `403` | API | Message is `"User account is inactive."` |
| A1.02.6 | Frontend redirects to admin login on `401` response | UI | Auth state cleared, admin sees login screen |
| A1.02.7 | Frontend uses `GET /auth/me` on app load to validate session | UI | Stale tokens are detected and handled |
| A1.02.8 | Frontend verifies `role === "ADMIN"` from `/auth/me` response | UI | Non-ADMIN token detected and rejected client-side |

---

## REQ-A1.03 - Admin Navigation & Layout (ADMIN-INFRA-001) `P0`

**Description**: Authenticated admin sees the admin app shell with navigation to user management and audit logs.

### Tests

| # | Test | Type | Pass Criteria |
| --- | --- | --- | --- |
| A1.03.1 | Authenticated admin sees sidebar with Users and Audit Logs links | UI | Navigation items render correctly |
| A1.03.2 | Unauthenticated access to admin routes redirects to admin login | UI | No flash of protected content |
| A1.03.3 | Logout clears session and redirects to admin login | UI | Token removed, admin routes inaccessible |
| A1.03.4 | Admin dashboard shows overview/summary information | UI | Dashboard renders without errors |

---

## REQ-A2.01 - List Users (ADMIN-USER-001) `P0`

**Description**: Admin can view a list of all users with optional filters.

### Tests

| # | Test | Type | Pass Criteria |
| --- | --- | --- | --- |
| A2.01.1 | `GET /api/v1/users` returns array of users | API | Each item includes `id`, `email`, `name`, `role`, `isActive`, `createdAt`, `updatedAt` |
| A2.01.2 | `passwordHash` is never included in response | API | No `passwordHash` field in any user object |
| A2.01.3 | Filter by `role` works | API | `?role=OPERATOR` returns only OPERATOR users |
| A2.01.4 | Filter by `isActive` works | API | `?isActive=true` returns only active users |
| A2.01.5 | `search` param searches across `name` and `email` (case-insensitive) | API | `?search=john` matches "John Doe" name or "john@example.com" email |
| A2.01.6 | Results ordered by `createdAt` descending | API | Most recent user first |
| A2.01.7 | Returns all users (no pagination) | API | Full list returned in single response |
| A2.01.8 | Non-ADMIN user receives `403` | API | Message is `"You do not have permission to perform this action."` |
| A2.01.9 | Frontend displays user list with role badges and active status indicators | UI | Table shows all user data with visual indicators |
| A2.01.10 | Frontend provides filter controls for role, active status, and search | UI | Filters update the user list dynamically |

---

## REQ-A2.02 - Create User (ADMIN-USER-002) `P0`

**Description**: Admin can create a new user account.

### Tests

| # | Test | Type | Pass Criteria |
| --- | --- | --- | --- |
| A2.02.1 | `POST /api/v1/users` with valid data returns `201` | API | Response has `status: "success"` and includes full user object |
| A2.02.2 | Created user has correct default role | API | `role` is `"OPERATOR"` when `role` field is omitted |
| A2.02.3 | Created user with explicit role is respected | API | `role: "VIEWER"` creates a VIEWER user |
| A2.02.4 | Email is trimmed and lowercased | API | `" Admin@Example.COM "` stored as `"admin@example.com"` |
| A2.02.5 | Name is trimmed | API | `" John Doe "` stored as `"John Doe"` |
| A2.02.6 | Duplicate email returns `409` | API | Message is `"A user with this email already exists."` |
| A2.02.7 | Missing required fields returns `400` | API | Validation errors for `email`, `password`, `name` |
| A2.02.8 | Password under 8 characters returns `400` | API | Validation error returned |
| A2.02.9 | Invalid role enum value returns `400` | API | Validation error returned |
| A2.02.10 | Unknown fields returns `400` | API | `forbidNonWhitelisted` rejects extra properties |
| A2.02.11 | Non-ADMIN user receives `403` | API | Role guard blocks access |
| A2.02.12 | Frontend create form submits and refreshes list on success | UI | New user appears without full page reload |

---

## REQ-A2.03 - View User (ADMIN-USER-003) `P1`

**Description**: Admin can view a single user's details.

### Tests

| # | Test | Type | Pass Criteria |
| --- | --- | --- | --- |
| A2.03.1 | `GET /api/v1/users/:id` returns user object | API | Includes `id`, `email`, `name`, `role`, `isActive`, `createdAt`, `updatedAt` |
| A2.03.2 | Non-existent user returns `404` | API | Message is `"User not found."` |
| A2.03.3 | Invalid UUID returns `400` | API | ParseUUIDPipe validation error |
| A2.03.4 | `passwordHash` is not included | API | No `passwordHash` field in response |
| A2.03.5 | Non-ADMIN user receives `403` | API | Role guard blocks access |
| A2.03.6 | Frontend detail view shows all user fields | UI | All data rendered correctly |

---

## REQ-A2.04 - Update User Role/Status (ADMIN-USER-004) `P0`

**Description**: Admin can update another user's role and/or active status. Self-modification and last-admin demotion are prevented.

### Tests

| # | Test | Type | Pass Criteria |
| --- | --- | --- | --- |
| A2.04.1 | `PATCH /api/v1/users/:id/role` with valid data returns `200` | API | Response has updated user object |
| A2.04.2 | Updating `role` only changes role | API | Other fields remain unchanged |
| A2.04.3 | Updating `isActive` only changes active status | API | Other fields remain unchanged |
| A2.04.4 | Updating both `role` and `isActive` works | API | Both fields updated |
| A2.04.5 | Self-modification returns `400` | API | Message is `"You cannot modify your own role or status."` |
| A2.04.6 | Demoting the last active admin returns `400` | API | Message is `"Cannot remove the last active admin. Promote another user to admin first."` |
| A2.04.7 | Deactivating the last active admin returns `400` | API | Same last-admin protection message |
| A2.04.8 | Non-existent user returns `404` | API | Message is `"User not found."` |
| A2.04.9 | Invalid UUID returns `400` | API | ParseUUIDPipe validation error |
| A2.04.10 | Invalid role enum value returns `400` | API | Validation error returned |
| A2.04.11 | Non-ADMIN user receives `403` | API | Role guard blocks access |
| A2.04.12 | Frontend disables edit controls on current user's row | UI | Admin cannot attempt self-modification |
| A2.04.13 | Frontend shows confirmation before demoting/deactivating an admin | UI | Warning dialog shown |
| A2.04.14 | Frontend handles last-admin error gracefully | UI | Error message displayed, form state preserved |

---

## REQ-A3.01 - List Audit Logs (ADMIN-AUDIT-001) `P0`

**Description**: Admin can view a paginated list of audit logs.

### Tests

| # | Test | Type | Pass Criteria |
| --- | --- | --- | --- |
| A3.01.1 | `GET /api/v1/audit-logs` returns paginated array of audit logs | API | Response includes `data` array and `meta` with `total`, `limit`, `offset` |
| A3.01.2 | Default pagination is `limit: 50, offset: 0` | API | Without params, returns up to 50 records |
| A3.01.3 | Custom `limit` and `offset` work | API | `?limit=10&offset=20` returns correct slice |
| A3.01.4 | `limit` max is 500 | API | `?limit=501` returns `400` validation error |
| A3.01.5 | `limit` min is 1 | API | `?limit=0` returns `400` validation error |
| A3.01.6 | `offset` min is 0 | API | `?offset=-1` returns `400` validation error |
| A3.01.7 | Results ordered by `createdAt` descending | API | Most recent log first |
| A3.01.8 | Each log includes all fields | API | `id`, `userId`, `userEmail`, `action`, `entityType`, `entityId`, `route`, `requestBody`, `statusCode`, `success`, `errorMessage`, `ipAddress`, `userAgent`, `durationMs`, `createdAt` |
| A3.01.9 | Sensitive fields in `requestBody` are redacted | API | `password` shows as `"[REDACTED]"`, not the actual value |
| A3.01.10 | Non-ADMIN user receives `403` | API | Role guard blocks access |
| A3.01.11 | Frontend displays audit log table with pagination controls | UI | Table renders with page navigation |
| A3.01.12 | Frontend shows `meta.total` for record count | UI | Total count displayed |

---

## REQ-A3.02 - Audit Log Filters (ADMIN-AUDIT-002) `P0`

**Description**: Admin can filter audit logs by various criteria.

### Tests

| # | Test | Type | Pass Criteria |
| --- | --- | --- | --- |
| A3.02.1 | Filter by `userId` works | API | `?userId=uuid` returns only that user's logs |
| A3.02.2 | Filter by `action` works | API | `?action=POST` returns only POST logs; value is trimmed and uppercased |
| A3.02.3 | Filter by `entityType` works | API | `?entityType=Users` returns only User-related logs |
| A3.02.4 | Filter by `entityId` works | API | `?entityId=uuid` returns only logs for that entity |
| A3.02.5 | Filter by `success` works | API | `?success=false` returns only failed requests |
| A3.02.6 | Filter by `search` works (case-insensitive) | API | Searches across `userEmail` and `route` |
| A3.02.7 | Filter by `startDate` works | API | `?startDate=2026-03-01` returns logs from March 1st onward |
| A3.02.8 | Filter by `endDate` works | API | `?endDate=2026-03-31` returns logs up to March 31st |
| A3.02.9 | Combined `startDate` and `endDate` works | API | Date range filter applied correctly |
| A3.02.10 | Multiple filters combine with AND logic | API | `?action=POST&success=false` returns only failed POST requests |
| A3.02.11 | Invalid `userId` UUID returns `400` | API | Validation error |
| A3.02.12 | Invalid date format returns `400` | API | Validation error for non-ISO date strings |
| A3.02.13 | Frontend provides filter panel with all filter options | UI | All filter inputs render and work |
| A3.02.14 | Frontend resets pagination when filters change | UI | Offset resets to 0 on filter change |

---

## REQ-A3.03 - Audit Log Automatic Capture (ADMIN-AUDIT-003) `P1`

**Description**: The audit log interceptor automatically records write operations with correct metadata.

### Tests

| # | Test | Type | Pass Criteria |
| --- | --- | --- | --- |
| A3.03.1 | `POST` request creates an audit log entry | Integration | Log entry exists with `action: "POST"` |
| A3.03.2 | `PATCH` request creates an audit log entry | Integration | Log entry exists with `action: "PATCH"` |
| A3.03.3 | `DELETE` request creates an audit log entry | Integration | Log entry exists with `action: "DELETE"` |
| A3.03.4 | `GET` request does NOT create an audit log | Integration | No log entry for GET requests |
| A3.03.5 | Public route (`@Public()`) does NOT create an audit log | Integration | No log entry for login endpoints |
| A3.03.6 | Unauthenticated request does NOT create an audit log | Integration | No log entry when no user on request |
| A3.03.7 | `entityType` is correctly derived from route | Integration | `/api/v1/users` -> `"Users"`, `/api/v1/purchase-orders/:id` -> `"PurchaseOrders"` |
| A3.03.8 | `entityId` is correctly extracted from route UUID | Integration | UUID in path is captured as `entityId` |
| A3.03.9 | `success` is `true` for 2xx/3xx responses | Integration | `statusCode` 200-399 maps to `success: true` |
| A3.03.10 | `success` is `false` for 4xx/5xx responses | Integration | Error responses map to `success: false` |
| A3.03.11 | `errorMessage` is populated for failed requests | Integration | Contains the response error message |
| A3.03.12 | `requestBody` has sensitive fields redacted | Integration | `password`, `passwordHash`, `token`, `accessToken`, `refreshToken`, `secret` replaced with `"[REDACTED]"` |
| A3.03.13 | `durationMs` is populated | Integration | Non-null integer value |
| A3.03.14 | Audit log creation failure does not break the original request | Integration | Errors in `AuditLogsService.create()` are caught and logged, not propagated |

---

## Exit Criteria

The admin project is complete when all are true:

1. All P0 requirements pass (`REQ-A1.01` through `REQ-A1.03`, `REQ-A2.01`, `REQ-A2.02`, `REQ-A2.04`, `REQ-A3.01`, `REQ-A3.02`).
2. All P1 requirements pass (`REQ-A2.03`, `REQ-A3.03`), or deferred items are explicitly approved.
3. End-to-end integration passes: admin logs in via admin endpoint, creates a user, views user list, updates a user's role, views audit logs showing their actions, and filters/paginates through audit history.
4. Frontend token management matches current backend reality (single JWT, no refresh rotation).
5. Frontend handles all error states: validation errors, 404s, 403 role guard rejections, self-modification blocks, last-admin protection, and auth errors.
6. Admin login correctly rejects non-ADMIN users without leaking role information.
7. Audit log entries are created automatically for all write operations and sensitive data is properly redacted.

---

## Test Summary

| Requirement | Story ID | Priority | Test Count |
| ----------- | -------- | -------- | ---------- |
| REQ-A1.01 | ADMIN-AUTH-001 | P0 | 12 |
| REQ-A1.02 | ADMIN-AUTH-002 | P0 | 8 |
| REQ-A1.03 | ADMIN-INFRA-001 | P0 | 4 |
| REQ-A2.01 | ADMIN-USER-001 | P0 | 10 |
| REQ-A2.02 | ADMIN-USER-002 | P0 | 12 |
| REQ-A2.03 | ADMIN-USER-003 | P1 | 6 |
| REQ-A2.04 | ADMIN-USER-004 | P0 | 14 |
| REQ-A3.01 | ADMIN-AUDIT-001 | P0 | 12 |
| REQ-A3.02 | ADMIN-AUDIT-002 | P0 | 14 |
| REQ-A3.03 | ADMIN-AUDIT-003 | P1 | 14 |
| **Total** | | | **106** |
