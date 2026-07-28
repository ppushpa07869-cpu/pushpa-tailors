# Phase 6 – Billing & Payment Management

This plan details the implementation of the Billing & Payment Management module, as requested.

## Proposed Changes

### Types

#### [NEW] `src/types/payment.ts`
Define interfaces for `Payment` and `PaymentFormData`.
Fields: `id`, `paymentId`, `receiptNumber`, `orderId`, `customerId`, `customerName`, `paymentDate`, `paymentMethod`, `amountPaid`, `paymentType`, `remarks`, `createdAt`, `updatedAt`.
Enums:
- PaymentMethod: Cash (నగదు), UPI (యూపీఐ), PhonePe, Google Pay, Paytm, Bank Transfer, Other
- PaymentType: Advance, Partial Payment, Final Payment, Refund

#### [MODIFY] `src/types/order.ts`
Add `paymentStatus` to the `Order` interface with values: `Unpaid`, `Partially Paid`, `Fully Paid`.
Update `OrderStatus` if necessary (but it seems we just need a new `paymentStatus` field).

### Services

#### [NEW] `src/services/paymentService.ts`
Implement Firestore CRUD operations for the `orders/{orderId}/payments` subcollection.
- `addPayment`: 
  1. Generate `receiptNumber` (`RCPT-YYYY-XXXX`).
  2. Add the payment document.
  3. Fetch the parent order, update its `remainingAmount`.
  4. Automatically update the order's `paymentStatus` based on the new remaining amount.
- `updatePayment` (Edit Payment):
  1. Fetch old payment.
  2. Adjust order `remainingAmount` and `paymentStatus` by reverting old payment amount and applying the new one.
  3. Update the payment document.
- `deletePayment`:
  1. Restore the `amountPaid` to the order's `remainingAmount` and recalculate `paymentStatus`.
  2. Delete payment document.
- `getPaymentsByOrder`: Fetch all payments for a specific order.
- `getAllPayments`: Fetch all payments across all orders using a Firestore Collection Group query on `payments`.
- `getDashboardStats`: Aggregate Today's Collection, Monthly Collection, Pending Collection (from orders), Fully Paid Orders (from orders).

### Components

#### [NEW] `src/components/admin/payments/PaymentForm.tsx`
Form for adding/editing payments.
- Amount validation: `> 0` and `<= remainingAmount`.
- Date picker for `paymentDate`.

#### [NEW] `src/components/admin/payments/PaymentTable.tsx` & `PaymentCard.tsx`
Responsive views for payment history.

#### [NEW] `src/components/admin/payments/PaymentFilters.tsx`
Filters for Today, This Month, Payment Method, Payment Status.

#### [NEW] `src/components/admin/payments/PaymentHistoryDialog.tsx` & `DeletePaymentDialog.tsx`
Modals for viewing history and deleting entries.

### Pages

#### [NEW] `src/pages/admin/payments/PaymentsList.tsx`
`/admin/payments` - Global view of all payments across all orders.

#### [NEW] `src/pages/admin/payments/OrderPayments.tsx`
`/admin/orders/:orderId/payments` - View and manage payments for a specific order.

#### [MODIFY] `src/pages/admin/orders/ViewOrder.tsx`
Add Payment Status badge.
Add a button/link to "Manage Payments".

### Route & Navigation Updates

#### [MODIFY] `src/App.tsx`
Add routes:
- `/admin/payments` -> `PaymentsList`
- `/admin/orders/:orderId/payments` -> `OrderPayments`

#### [MODIFY] `src/components/admin/Sidebar.tsx`
Add "Payments" link to the sidebar (using `CreditCard` or `IndianRupee` icon).

#### [MODIFY] `src/pages/admin/Dashboard.tsx`
Replace existing dummy payment stats with live data from `paymentService`.
Cards: Today's Collection, Monthly Collection, Pending Collection, Fully Paid Orders.

## Verification Plan

### Automated Tests
1. `npm run build` will be executed to guarantee 0 TypeScript errors.
2. `npm run dev` will be executed to verify localhost runs successfully.

### Manual Verification
1.  **Add Payment**: Ensure amount validation works. Ensure `remainingAmount` decreases and `paymentStatus` updates on the Order.
2.  **Edit Payment**: Ensure adjusting amount recalibrates the order's `remainingAmount`.
3.  **Dashboard**: Verify collections show the correct sums.
