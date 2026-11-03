import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Customer-facing website
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Gallery from './pages/Gallery';
import NotFound from './pages/NotFound';

// Admin framework
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import Login from './pages/admin/Login';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import Settings from './pages/admin/Settings';

// Customer management
import CustomersList from './pages/admin/customers/CustomersList';
import EditCustomer from './pages/admin/customers/EditCustomer';
import CustomerDetail from './pages/admin/customers/CustomerDetail';

// Customer-scoped order pages
import AddOrder from './pages/admin/customers/orders/AddOrder';
import EditOrder from './pages/admin/customers/orders/EditOrder';

// Standalone order view (accessible from notifications etc.)
import ViewOrder from './pages/admin/orders/ViewOrder';

// Payments (keep for direct payment routes)
import OrderPayments from './pages/admin/payments/OrderPayments';

// Reports
import ReportsModule from './pages/admin/reports/ReportsModule';

// Design Catalog
import DesignCatalog from './pages/admin/designs/DesignCatalog';
import DesignImport from './pages/admin/tools/DesignImport';
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Admin Login (public) */}
          <Route path="/admin/login" element={<Login />} />

          {/* Admin Protected Routes */}
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              {/* Default redirect */}
              <Route index element={<Navigate to="dashboard" replace />} />

              {/* Dashboard */}
              <Route path="dashboard" element={<Dashboard />} />

              {/* Customers & Orders unified workflow */}
              <Route path="customers" element={<CustomersList />} />
              <Route path="customers/add" element={<AddOrder />} />
              <Route path="orders/new" element={<AddOrder />} />
              <Route path="customers/edit/:id" element={<EditCustomer />} />
              <Route path="customers/:customerId" element={<CustomerDetail />} />

              {/* Design Catalog */}
              <Route path="designs" element={<DesignCatalog />} />
              <Route path="design-import" element={<DesignImport />} />

              {/* Customer-scoped orders */}
              <Route path="customers/:customerId/orders/add" element={<AddOrder />} />
              <Route path="customers/:customerId/orders/edit/:orderId" element={<EditOrder />} />


              {/* Standalone order view (from notifications/dashboard links) */}
              <Route path="orders/view/:orderId" element={<ViewOrder />} />

              {/* Payments (still reachable for direct links) */}
              <Route path="orders/:orderId/payments" element={<OrderPayments />} />

              {/* Reports */}
              <Route path="reports" element={<ReportsModule />} />

              {/* Settings */}
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Customer-facing website (completely unchanged) */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
