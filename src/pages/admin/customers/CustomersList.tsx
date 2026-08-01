import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users } from 'lucide-react';
import { customerService } from '../../../services/customerService';
import type { Customer } from '../../../types/customer';
import CustomerTable from '../../../components/admin/customers/CustomerTable';
import CustomerCard from '../../../components/admin/customers/CustomerCard';
import DeleteDialog from '../../../components/admin/customers/DeleteDialog';

export default function CustomersList() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await customerService.getCustomers();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
    } else {
      const q = searchTerm.toLowerCase();
      setFilteredCustomers(
        customers.filter(c =>
          c.customerName.toLowerCase().includes(q) ||
          c.mobileNumber.includes(q) ||
          c.customerId.toLowerCase().includes(q)
        )
      );
    }
  }, [searchTerm, customers]);

  const handleEdit = (id: string) => navigate(`/admin/customers/edit/${id}`);

  const confirmDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!customerToDelete?.id) return;
    setIsDeleting(true);
    try {
      await customerService.deleteCustomer(customerToDelete.id);
      await fetchCustomers();
      setIsDeleteDialogOpen(false);
      setCustomerToDelete(null);
    } catch (error) {
      console.error('Error deleting customer:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 tracking-wide flex items-center gap-3">
            <Users className="h-7 w-7 text-primary" />
            Customers
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            {customers.length} customer{customers.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/orders/new')}
          className="flex items-center gap-2 px-5 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5 transition-all text-sm"
        >
          <Plus className="h-5 w-5" />
          New Order
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search by name, mobile, or ID..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <CustomerTable
              customers={filteredCustomers}
              onEdit={handleEdit}
              onDelete={confirmDelete}
            />
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-gray-500">No customers found.</p>
              </div>
            ) : (
              filteredCustomers.map(customer => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  onEdit={handleEdit}
                  onDelete={confirmDelete}
                />
              ))
            )}
          </div>
        </>
      )}

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => !isDeleting && setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        customerName={customerToDelete?.customerName || ''}
        isDeleting={isDeleting}
      />
    </div>
  );
}
