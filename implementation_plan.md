# Phase 6.5: Payment Experience & UI Redesign

This plan outlines the complete UX redesign for the Order Details view and Payment Collection flow, aiming to achieve an ultra-fast, premium experience.

## User Review Required

> [!IMPORTANT]
> - I will completely redesign `ViewOrder.tsx` removing the previous layout and integrating the 3 large premium metric cards.
> - A new inline `ReceivePaymentModal` and a sliding `PaymentHistoryDrawer` will be added directly into `ViewOrder.tsx` to prevent unnecessary navigation.
> - The standalone "Payments" page and sidebar link will be removed. Does this mean you also want `src/pages/admin/payments/PaymentsList.tsx` deleted, or just hidden from the sidebar? I will just hide it from the sidebar for now to preserve the code if needed.
> - Ensure you are satisfied with removing edit/delete from the Payment History.

## Proposed Changes

### 1. Sidebar Updates
- **File**: `src/components/admin/Sidebar.tsx`
- **Changes**: Remove `Payments` link. Add a placeholder `Settings` link. The final sidebar list: Dashboard, Customers, Orders, Reports, Settings.

### 2. Status Badge Utilities
- **File**: `src/utils/orderUtils.ts`
- **Changes**: Update `getStatusColor` mapping to match precisely:
  - New (Blue), Cutting (Yellow), Stitching (Orange), Ready (Purple), Delivered (Green), Cancelled (Red).

### 3. Order Details UI Redesign
- **File**: `src/pages/admin/orders/ViewOrder.tsx`
- **Changes**:
  - Replace the entire existing layout with a Premium Boutique design.
  - **Top Section**: Customer Name, Mobile, Order ID, Status, Delivery Date, decorated with glassmorphism and soft shadows.
  - **Middle Section**: 3 distinct, large metric cards for Total Amount (Neutral), Paid Amount (Green), Remaining Amount (Orange).
  - **Payment Progress Bar**: A sleek horizontal progress bar visualizing Paid vs Total amount percentage.
  - **Primary Actions**: Large prominent action buttons: `💰 Receive Payment`, `✔ Mark Delivered`, `✏ Edit Order`.

### 4. Receive Payment Modal & History Drawer
- **File**: `src/pages/admin/orders/ViewOrder.tsx`
- **Changes**:
  - Embed a sleek, glass-effect modal for taking payments.
  - **Fields**: Amount, Payment Method (Cash, UPI, PhonePe, Google Pay, Paytm, Bank Transfer, Other), Remarks.
  - Submitting will invoke `paymentService.addPayment()`, which inherently updates the order totals and payment status, followed by a beautiful success toast.
  - Add a "View Payment History" button that opens a side drawer/dialog showing the immutable payment timeline (newest first).

## Verification Plan

### Automated Tests
- Run `npm run build` and `npx tsc --noEmit` to ensure perfect compilation and zero TypeScript errors.

### Manual Verification
- Verify the Sidebar navigation.
- Load an order and confirm the new boutique layout, progress bar, and the large metrics cards look impeccable.
- Submit a new payment and watch the total update instantly on the page.
- Open the Payment History Drawer to ensure the timeline matches the history correctly.
