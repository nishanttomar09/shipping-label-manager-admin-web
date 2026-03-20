# Shipping Label Manager - Project Overview (Frontend Guide)

## What Is This App?

An internal warehouse tool that replaces manual data entry from paper delivery notes. The user flow is:

1. A warehouse team creates **purchase orders** (POs) with expected items.
2. When goods arrive, a **delivery** is created under a PO.
3. The operator **uploads a photo/scan** of the paper delivery note.
4. The system **automatically extracts** supplier, receiver, dates, and line items from the document using OCR + AI.
5. A reviewer **checks** the extracted data against the document image — clicking on any extracted fact highlights where it was found on the document.
6. The reviewer **approves** the delivery.

The app has two main domains: **Purchase Order Management** and **Delivery Processing with AI-powered document extraction**.

---

## Users and Roles

| Role | Access | Notes |
| ---- | ------ | ----- |
| `ADMIN` | Full access to all features | Default role for all users |
| `USER` | Full access to all features | No functional difference from ADMIN currently |

There are no role-based restrictions in the current backend. All authenticated users see everything. The frontend should not gate any features behind roles for now.

---

## Pages and UX Flow

### Authentication

```
/login ──> /dashboard (or /purchase-orders)
```

**Login Page**
- Email + password form.
- On success, store the JWT access token and user profile.
- Redirect to the main dashboard/landing page.
- No 2FA, no password reset, no registration — users are seeded or created server-side.

**Session Behavior**
- Attach `Authorization: Bearer <token>` to every API call.
- On any `401` response, clear the session and redirect to `/login`.
- On app load, call `GET /auth/me` to validate the stored token is still valid.
- There is no refresh token — when the JWT expires (default `1d`), the user must log in again.

---

### Purchase Orders

```
/purchase-orders (list) ──> /purchase-orders/:id (detail)
                                    |
                                    +--> Create delivery
                                    +--> Edit PO / line items
```

**Purchase Orders List Page**
- Filterable table showing all POs.
- Filters: status dropdown (`OPEN`, `PARTIALLY_RECEIVED`, `COMPLETED`, `CANCELLED`), supplier name text input, and a general search box (searches PO number, supplier name, supplier email).
- Each row shows: PO number, supplier name, status, order date, delivery count, line item count.
- Sorted by newest first (server-side, no client sorting needed).
- No pagination — backend returns full array. If the list grows large, pagination can be added later.

**Purchase Order Detail Page**
- Header: PO number, supplier info, dates, status, currency, total value.
- Two sections:
  1. **Line Items table**: SKU, description, ordered qty, received qty, unit price, status. Status badges: `PENDING` (gray), `PARTIAL` (yellow), `COMPLETED` (green), `CANCELLED` (red).
  2. **Deliveries table**: List of deliveries linked to this PO. Each row: delivery number, status, carrier, tracking number, dates. Clicking a delivery navigates to the delivery detail page.
- Actions: Edit PO, Add delivery.

**Create/Edit Purchase Order**
- Form with: PO number, supplier name, supplier email, warehouse location, order date, expected date, currency code, total value, notes.
- Inline line items editor (add/remove rows). When saving, the entire line items array is replaced.
- Total value auto-calculates from line items if not manually set.
- On edit, pre-fill all fields from existing data.

**Create Delivery (from PO context)**
- Form within PO detail or a modal.
- Required: delivery number (unique within this PO).
- Optional: carrier, tracking number, reference, origin, destination, sender/recipient names, service type, weight, dimensions, dates, notes.
- Optional line items with: SKU, description, expected qty, received qty.
- Default status: `PENDING`. New deliveries almost always start as PENDING.

---

### Deliveries

```
/deliveries (list) ──> /deliveries/:id (detail + extraction review)
                              |
                              +--> Upload document image
                              +--> Process (trigger OCR + AI)
                              +--> Review extracted info with bounding box highlights
                              +--> Approve
```

**Deliveries List Page**
- Filterable table showing all deliveries across all POs.
- Filters: status dropdown (`PENDING`, `IN_REVIEW`, `PROCESSED`, `APPROVED`, `CANCELLED`), purchase order filter.
- Each row shows: delivery number, PO number (linked), status, carrier, document uploaded (yes/no), extraction status, dates.
- Status badges with colors: `PENDING` (gray), `IN_REVIEW` (blue), `PROCESSED` (orange), `APPROVED` (green), `CANCELLED` (red).
- Thumbnail of the document image if uploaded (use `documentImageUrl` from the response).

**Delivery Detail Page**
This is the most complex page. It has several sections and changes based on delivery status:

**Section 1: Delivery Info**
- Header with delivery number, status badge, PO reference (linked).
- Fields: carrier, tracking, reference, origin/destination, sender/recipient, dates, weight, dimensions, notes.
- Edit button (opens edit form).

**Section 2: Line Items**
- Table of expected delivery line items: SKU, description, expected qty, received qty.

**Section 3: Document Image**
- If no image uploaded: show upload dropzone/button.
- If image uploaded: render the document image from `documentImageUrl` (signed S3 URL).
- Upload replaces any existing image and resets status to `IN_REVIEW`.
- Upload constraints shown to user: JPEG/PNG/WEBP only, max 5MB.

**Section 4: Extraction Status and Actions**
- Show extraction status: `PROCESSING` (spinner), `COMPLETED` (green), `FAILED` (red with error message).
- Action buttons based on status:

| Delivery Status | Extraction Status | Available Actions |
| --------------- | ----------------- | ----------------- |
| `PENDING` | N/A | Upload document image |
| `IN_REVIEW` | N/A or `FAILED` | Process (trigger extraction) |
| `IN_REVIEW` | `PROCESSING` | Show loading spinner, disable actions |
| `PROCESSED` | `COMPLETED` | Approve, Re-process (move back to IN_REVIEW) |
| `APPROVED` | `COMPLETED` | None (read-only) |
| `CANCELLED` | Any | None (read-only) |

**Section 5: Extracted Information (the main review area)**
Visible when extraction exists (`COMPLETED` or `FAILED`).

For `COMPLETED` extractions, show a **side-by-side layout**:

```
+----------------------------------+----------------------------------+
|        Document Image            |        Extracted Facts           |
|                                  |                                  |
|   [image with bounding box       |   Supplier: Acme Corp       [*] |
|    highlight overlays]           |   Receiver: Warehouse B     [*] |
|                                  |   Date: 18/03/2026          [*] |
|                                  |   DN Number: DN-12345       [*] |
|                                  |                                  |
|                                  |   --- Extracted Line Items ---   |
|                                  |   #1: Widget A, Qty: 100        |
|                                  |   #2: Widget B, Qty: 50         |
+----------------------------------+----------------------------------+
```

**Bounding Box Highlighting Interaction:**
- Each extracted fact (supplier, receiver, documentDate, deliveryNoteNumber) has a clickable indicator `[*]`.
- When the user clicks/hovers on a fact, the corresponding bounding box is highlighted on the document image.
- The bounding box data comes from `extractedInformation.factBoundingBoxesJson`.
- If a fact's bounding box is `null`, the indicator is hidden or grayed out (fact could not be located on the document).

**How to render bounding boxes:**

```typescript
// factBoundingBoxesJson structure:
// {
//   "supplier": { "boundingBox": { left, top, width, height }, "polygon": [...] } | null,
//   "receiver": ...,
//   "documentDate": ...,
//   "deliveryNoteNumber": ...
// }

// All coordinates are 0-1 normalized (Textract format).
// Multiply by the rendered image dimensions to get pixel positions.

const imageElement = document.getElementById('document-image');
const imageWidth = imageElement.clientWidth;
const imageHeight = imageElement.clientHeight;

const bbox = factBoundingBoxesJson.supplier?.boundingBox;
if (bbox) {
  const overlay = {
    left:   bbox.left * imageWidth,
    top:    bbox.top * imageHeight,
    width:  bbox.width * imageWidth,
    height: bbox.height * imageHeight,
  };
  // Render a semi-transparent colored rectangle at this position
  // Positioned absolutely over the image container
}
```

**For `FAILED` extractions:**
- Show the error message from `extractedInformation.aiRawResponseJson.error`.
- Common errors: "No readable text extracted from document." (blank image), Textract/Claude API failures.
- Show a "Retry" button that calls `POST /deliveries/:id/review` then redirects user to trigger `POST /deliveries/:id/process` again.

**Extracted Line Items Table:**
- Columns: Sr No, Description, SAP No, Quantity, Qty Config, Remarks.
- All fields are strings (or null). Display `—` for null values.
- These are AI-extracted and may not perfectly match the delivery's expected line items. The review step is for the human to verify.

---

### Navigation Structure

```
Sidebar:
  - Dashboard (optional landing page)
  - Purchase Orders
  - Deliveries

Header:
  - User name/email (from auth session)
  - Logout button
```

---

## Status Workflow Visual Guide

### Delivery Statuses (what the user sees)

```
 PENDING          IN_REVIEW         PROCESSED         APPROVED
 [gray]           [blue]            [orange]          [green]
    |                |                  |                 |
    | Upload image   | Process doc      | Approve         | (done)
    +------>---------+-------->---------+-------->--------+
                     ^                  |
                     |   Re-process     |
                     +--------<---------+
                     ^
    Upload new image |
    +------>---------+
```

### Extraction Statuses

| Status | Visual | Meaning |
| ------ | ------ | ------- |
| `PROCESSING` | Spinner/loading | OCR + AI extraction in progress. Typically takes 5-15 seconds. |
| `COMPLETED` | Green checkmark | Extraction successful. Facts and line items available for review. |
| `FAILED` | Red error | Extraction failed. Error message available. User can retry. |
| (not yet created) | Empty state | No extraction has been run yet. |

---

## Key Data Concepts for Frontend

### Purchase Order

A record of what was ordered from a supplier. Contains:
- Basic info: PO number (unique), supplier name/email, warehouse, dates.
- **PO Line Items**: What items were ordered (SKU, description, ordered qty, unit price). These represent the *expected* items.
- **Deliveries**: Physical shipments that arrive against this PO. A single PO can have multiple deliveries (partial shipments).

### Delivery

A single shipment/arrival of goods. Contains:
- Tracking info: carrier, tracking number, origin/destination, dates.
- **Delivery Line Items**: What items were *expected* in this specific delivery (may differ from PO line items).
- **Document Image**: A scan/photo of the paper delivery note that came with the shipment.
- **Extracted Information**: AI-extracted data from the document image.

### Extracted Information

The result of running OCR + AI on a delivery document. Contains:
- **Header facts**: supplier, receiver, document date, delivery note number — extracted as key-value pairs.
- **Extracted line items**: Table rows extracted from the document (sr no, description, SAP no, quantity, etc.).
- **Bounding boxes**: For each header fact, the pixel location on the document where it was found. Enables the "click fact to highlight on image" feature.
- **Status**: PROCESSING / COMPLETED / FAILED.
- **Raw data**: Full OCR text, OCR blocks (with geometry for all text), raw AI response (for debugging).

### The Difference Between Line Items

| Type | Source | Purpose |
| ---- | ------ | ------- |
| **PO Line Items** | Manually entered | What was ordered from supplier |
| **Delivery Line Items** | Manually entered | What was expected in this shipment |
| **Extracted Line Items** | AI-extracted from document | What the delivery note actually says |

The review step is where the user compares **Extracted Line Items** (from AI) against **Delivery Line Items** (manually entered expectations) to verify accuracy.

---

## Document Image Handling

### Upload Flow
1. User selects a file (JPEG, PNG, or WEBP, max 5MB).
2. Frontend sends as `multipart/form-data` to `POST /deliveries/:id/document-image`.
3. Backend uploads to S3, returns the delivery with a signed URL.
4. Frontend renders the image from the signed URL.
5. Delivery status automatically becomes `IN_REVIEW`.
6. Any previous extraction data is deleted.

### Signed URLs
- Document images are stored in private S3. The backend returns **pre-signed URLs** with limited expiry.
- The `documentImageUrl` field on delivery responses is a signed URL (included automatically on list/detail responses from `/deliveries` endpoints).
- For explicit URL refresh: `GET /deliveries/:id/document-image-url?expiresIn=3600`.
- Signed URLs expire. If an image fails to load, re-fetch the delivery to get a fresh URL.
- Deliveries returned from `/purchase-orders/:id/deliveries` do **NOT** include `documentImageUrl`. Use the `/deliveries` endpoints instead.

### Re-upload
- User can upload a new image at any time (except APPROVED/CANCELLED deliveries).
- Re-uploading deletes the old S3 image, deletes all extraction data, and resets status to `IN_REVIEW`.
- The user must re-process after re-uploading.

---

## Processing Flow (What Happens When User Clicks "Process")

```
User clicks "Process"
        |
        v
Frontend calls POST /deliveries/:id/process
        |
        v
Backend sets extraction status to PROCESSING
        |
        v
[~5-15 seconds - show loading spinner]
        |
        v
Backend returns full delivery with PROCESSED status
and extractedInformation with COMPLETED status
        |
        v
Frontend renders extracted facts + line items
with bounding box highlight capability
```

**Error case:**
```
User clicks "Process"
        |
        v
Frontend calls POST /deliveries/:id/process
        |
        v
Backend returns error (400 or 500)
        |
        v
Extraction status is FAILED with error message
        |
        v
Frontend shows error message + "Retry" option
```

**Important timing note:** Processing typically takes 5-15 seconds (Textract OCR + Claude AI call). The API call is synchronous — the frontend should show a loading state and not timeout too early. Consider setting an HTTP timeout of at least 60 seconds for this endpoint.

---

## Approval Flow

```
Reviewer sees PROCESSED delivery with COMPLETED extraction
        |
        v
Reviews extracted facts against document image
(clicks facts to see bounding box highlights)
        |
        v
Clicks "Approve"
        |
        v
Frontend calls POST /deliveries/:id/approve
        |
        v
Delivery status becomes APPROVED
approvedAt and approvedBy are set automatically
        |
        v
Delivery becomes read-only
```

The approver's identity is taken from the JWT — `approvedBy` is set to the user's name (or email if name is empty). The frontend does not need to send any approval metadata.

---

## Error Handling Guide

### API Error Shape

All errors follow this envelope:

```json
{
  "status": "error",
  "message": "Human-readable summary for toast/alert.",
  "error": {
    "code": "400",
    "details": "Detailed error info (string or array)"
  }
}
```

### How to Handle by Status Code

| Code | Meaning | Frontend Action |
| ---- | ------- | --------------- |
| `400` | Validation error or business rule violation | Show `message` in form error or toast. If `details` is an array, show field-level errors. |
| `401` | Authentication failed / token expired | Clear session, redirect to `/login`. |
| `403` | Account inactive | Show message, redirect to `/login`. |
| `404` | Resource not found | Show "not found" state or redirect to list page. |
| `409` | Duplicate/conflict (e.g., duplicate PO number) | Show `message` in form error. |
| `500` | Server error (Textract/Claude failure, etc.) | Show generic error with `message`. For extraction failures, show retry option. |

### Common Error Messages to Handle

| Message | Context | UX |
| ------- | ------- | -- |
| `"Invalid email or password."` | Login | Show on login form |
| `"User account is inactive."` | Login or any request | Redirect to login with message |
| `"Delivery not found."` | Any delivery endpoint | Show 404 page |
| `"Purchase order not found."` | Any PO endpoint | Show 404 page |
| `"A delivery document image is required before processing."` | Process without image | Prompt user to upload |
| `"Only deliveries in review can be processed."` | Process wrong status | Disable process button for non-IN_REVIEW |
| `"No readable text extracted from document."` | Blank/unreadable image | Show clear message, suggest re-uploading a better image |
| `"Only processed deliveries can be approved."` | Approve wrong status | Disable approve button for non-PROCESSED |
| `"Document image upload is not allowed for approved or cancelled deliveries."` | Upload on terminal status | Hide upload for APPROVED/CANCELLED |
| `"An image file is required."` | Upload without file | Client-side validation should prevent this |
| `"Only JPEG, PNG, and WEBP images are allowed."` | Wrong file type | Client-side validation + show error |
| `"Image size must not exceed 5MB."` | File too large | Client-side validation + show error |
| `"Validation failed."` | Any bad input | `error.details` will have the field-level messages |

---

## Suggested Component Structure

```
pages/
  login.tsx
  purchase-orders/
    index.tsx                    # PO list with filters
    [id].tsx                     # PO detail (info + line items + deliveries)
  deliveries/
    index.tsx                    # Delivery list with filters
    [id].tsx                     # Delivery detail (the big page)

components/
  layout/
    sidebar.tsx                  # Navigation sidebar
    header.tsx                   # Top bar with user info + logout
    auth-guard.tsx               # Route protection wrapper

  purchase-orders/
    po-form.tsx                  # Create/edit PO form with line items
    po-line-items-editor.tsx     # Inline add/remove line item rows
    po-status-badge.tsx          # Status badge with color

  deliveries/
    delivery-form.tsx            # Create/edit delivery form
    delivery-status-badge.tsx    # Status badge with color
    delivery-action-bar.tsx      # Context-sensitive action buttons
    document-upload.tsx          # File dropzone with validation
    document-viewer.tsx          # Image display with bounding box overlay
    bounding-box-overlay.tsx     # Positioned highlight rectangle
    extraction-panel.tsx         # Extracted facts display with click handlers
    extraction-status.tsx        # PROCESSING/COMPLETED/FAILED states
    extracted-line-items.tsx     # Table of AI-extracted line items
    extraction-error.tsx         # Error display with retry button

hooks/
  use-auth.ts                    # Login, logout, token management, /me check
  use-api.ts                     # API client with Bearer token injection + 401 handling
  use-purchase-orders.ts         # PO CRUD + list with filters
  use-deliveries.ts              # Delivery CRUD + list with filters
  use-delivery-processing.ts     # Upload, process, approve workflow
  use-document-image.ts          # Signed URL management + refresh
```

---

## Related Documents

| Document | What It Contains |
| -------- | --------------- |
| [context.md](./context.md) | Every API endpoint with exact request bodies, response shapes, query params, validation rules, and error codes. Use this when writing API integration code. |
| [requirements.md](./requirements.md) | 130 test cases across 18 requirements. Use this for QA and to verify feature completeness. |
