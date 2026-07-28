# Phase 5 – Order & Stitching Management

This plan details the implementation of the Order Management module for the PUSHPA TAILORS application, fulfilling all requirements outlined for Phase 5.

## Proposed Changes

### Types

#### [NEW] `src/types/order.ts`
Define interfaces for `Order` and `OrderFormData`.
Fields: `id`, `orderId`, `customerId`, `customerName`, `measurementId`, `measurementType`, `orderDate`, `deliveryDate`, `status`, `advanceAmount`, `remainingAmount`, `totalAmount`, `notes`, `createdAt`, `updatedAt`.
Status enum: `New (కొత్తది)`, `Cutting (కటింగ్)`, `Stitching (కుట్టుతున్నారు)`, `Ready (సిద్ధంగా ఉంది)`, `Delivered (డెలివరీ అయింది)`, `Cancelled (రద్దు)`.

### Services

#### [NEW] `src/services/orderService.ts`
Implement Firestore CRUD operations for the `orders` collection:
- `addOrder`: Generate sequential/random `orderId`, calculate `remainingAmount`, add timestamps.
- `updateOrder`: Update fields, recalculate `remainingAmount`, update timestamps.
- `deleteOrder`: Remove document.
- `getOrder`: Fetch single document.
- `getOrders`: Fetch all documents, ordered by `createdAt` descending.
- `getDashboardStats`: Aggregate counts for Dashboard (Total, Today's Deliveries, Pending, Delivered).

### Components

#### [NEW] `src/components/admin/orders/OrderForm.tsx`
Reusable form component for Add/Edit orders.
- Customer Dropdown (fetch from `customerService`).
- Measurement Dropdown (fetch from `measurementService` based on selected customer).
- Order Date (default today).
- Delivery Date (Date picker).
- Amount inputs (Total, Advance) with automatic Remaining Amount calculation.
- Status Dropdown.
- Notes textarea.
- Validation: Customer, Measurement, Delivery Date required. Advance <= Total.

#### [NEW] `src/components/admin/orders/OrderTable.tsx`
Desktop view for the order list. Columns: Order ID, Customer, Delivery Date, Status, Remaining Amount, Actions (View, Edit, Delete).

#### [NEW] `src/components/admin/orders/OrderCard.tsx`
Mobile view for the order list. Displays the same data as the table but in a card format for responsive design.

#### [NEW] `src/components/admin/orders/OrderViewDialog.tsx`
Modal dialog to view all details of a selected order.

#### [NEW] `src/components/admin/orders/DeleteOrderDialog.tsx`
Confirmation modal before deleting an order.

#### [NEW] `src/components/admin/orders/OrderFilters.tsx`
Component for status filtering (All, Today's Deliveries, Pending Orders, Delivered Orders) and search bar (Order ID, Customer Name).

### Pages

#### [NEW] `src/pages/admin/orders/OrdersList.tsx`
Main page for `/admin/orders`. Fetches orders, applies search/filters, and renders `OrderTable` or `OrderCard` based on viewport.

#### [NEW] `src/pages/admin/orders/AddOrder.tsx`
Page wrapper for creating a new order using `OrderForm`.

#### [NEW] `src/pages/admin/orders/EditOrder.tsx`
Page wrapper for editing an existing order using `OrderForm`.

### Route & Navigation Updates

#### [MODIFY] `src/App.tsx`
Add routes:
- `/admin/orders` -> `OrdersList`
- `/admin/orders/add` -> `AddOrder`
- `/admin/orders/edit/:orderId` -> `EditOrder`

#### [MODIFY] `src/components/admin/Sidebar.tsx`
Add "Orders" link below "Customers" in the sidebar navigation. Use `ClipboardList` or `ShoppingBag` icon.

#### [MODIFY] `src/pages/admin/Dashboard.tsx`
Replace dummy stats with live data fetched via `orderService`.
Cards to update: Total Orders, Today's Deliveries, Pending Orders, Delivered Orders.

## Verification Plan

### Automated Tests
N/A - the project does not currently have automated tests configured.

### Manual Verification
1.  **Add Order**: Ensure form validates properly (amount constraints, required fields). Verify cascading dropdowns (Customer -> Measurements).
2.  **Edit Order**: Ensure existing data populates correctly and updates are saved to Firestore.
3.  **Delete Order**: Verify confirmation dialog and successful deletion.
4.  **Order List**: Test responsive design (Table on desktop, Cards on mobile). Test search by Order ID/Customer Name. Test status filters.
5.  **Dashboard**: Verify stats match the actual data in Firestore.
6.  **Compilation**: Verify zero TypeScript errors using `npm run build` or `npx tsc --noEmit`.
