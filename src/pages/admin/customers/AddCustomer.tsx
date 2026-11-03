import { Navigate } from 'react-router-dom';

export default function AddCustomer() {
  return <Navigate to="/admin/orders/new" replace />;
}

