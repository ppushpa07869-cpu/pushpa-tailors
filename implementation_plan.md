# Phase 7: Reports Dashboard Redesign Implementation Plan

This plan details the process of completely overhauling the Dashboard to a premium, boutique-style layout while removing all visual charts in favor of actionable, data-driven lists and summaries.

## User Review Required

> [!IMPORTANT]
> - All `recharts` graphs (Monthly Revenue, Orders Per Month, Status Pie Charts) will be entirely removed from `Dashboard.tsx`.
> - The new Dashboard will feature 5 distinct sections displaying actionable table rows and list items instead of standalone metrics.
> - For the **Receive Payment** quick action on the dashboard, clicking it will navigate to the `ViewOrder` page and seamlessly open the `ReceivePaymentModal` automatically by checking a URL query parameter (e.g., `?action=pay`).

## Proposed Changes

### 1. Dashboard Redesign (`src/pages/admin/Dashboard.tsx`)
- Completely rewrite the Dashboard component to match the premium boutique aesthetics (rounded corners, large spacing, glassmorphism).
- **Top Summary**: Display only 4 key metrics: Today's Collection, New Orders, Deliveries Today, Pending Collection.
- **Section 1: Orders by Status**: A vertically stacked, clickable list of statuses showing the count for each. Clicking them navigates to the Orders or Reports tab with the status filter applied.
- **Section 2: Collection Summary**: A clean list/card displaying collections for Today, This Week, This Month, and Pending.
- **Section 3: Recent Orders**: A modern responsive table listing the latest orders.
- **Section 4: Pending Payments**: A table listing orders that are Partially Paid or Unpaid. Rows will have a **Receive Payment** action.
- **Section 5: Today's Deliveries**: A table listing orders due today (or overdue). Overdue rows will be highlighted visually.
- **Professional Tip Card**: Added at the bottom of the dashboard with English and Telugu text.

### 2. View Order Updates (`src/pages/admin/orders/ViewOrder.tsx`)
- Add a `useEffect` hook to parse URL search parameters. If `?action=pay` is detected in the URL, automatically open the `ReceivePaymentModal` without requiring an additional click from the user.

### 3. Service Adjustments (`src/services/dashboardService.ts`)
- Ensure the `getDashboardData` function provides the necessary detailed arrays (recent orders, deliveries today, pending payments, collections for this week) to populate the new dashboard tables without duplicating logic in the component.

## Verification Plan

### Automated Tests
- `npm run build` and `npx tsc --noEmit` will be run to verify the absence of TypeScript errors.

### Manual Verification
- View the redesigned Dashboard and verify the charts are gone.
- Check the 5 specific sections for data accuracy.
- Click the "Receive Payment" action on a pending payment row and verify it correctly routes to the Order Details page and opens the Payment Modal instantly.
