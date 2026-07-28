import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import CustomersList from './pages/admin/customers/CustomersList';
import AddCustomer from './pages/admin/customers/AddCustomer';
import EditCustomer from './pages/admin/customers/EditCustomer';

// Measurements
import MeasurementsList from './pages/admin/customers/measurements/MeasurementsList';
import AddMeasurement from './pages/admin/customers/measurements/AddMeasurement';
import EditMeasurement from './pages/admin/customers/measurements/EditMeasurement';

// Orders
import OrdersList from './pages/admin/orders/OrdersList';
import AddOrder from './pages/admin/orders/AddOrder';
import EditOrder from './pages/admin/orders/EditOrder';
import ViewOrder from './pages/admin/orders/ViewOrder';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="customers" element={<CustomersList />} />
              <Route path="customers/add" element={<AddCustomer />} />
              <Route path="customers/edit/:id" element={<EditCustomer />} />
              <Route path="customers/:customerId/measurements" element={<MeasurementsList />} />
              <Route path="customers/:customerId/measurements/add" element={<AddMeasurement />} />
              <Route path="customers/:customerId/measurements/:id/edit" element={<EditMeasurement />} />
              
              <Route path="orders" element={<OrdersList />} />
              <Route path="orders/add" element={<AddOrder />} />
              <Route path="orders/edit/:orderId" element={<EditOrder />} />
              <Route path="orders/view/:orderId" element={<ViewOrder />} />
            </Route>
          </Route>
          
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
