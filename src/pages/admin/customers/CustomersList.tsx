import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { customerService } from '../../../services/customerService';
import type { Customer } from '../../../types/customer';
import CustomerTable from '../../../components/admin/customers/CustomerTable';
import CustomerCard from '../../../components/admin/customers/CustomerCard';
import SearchBar from '../../../components/admin/customers/SearchBar';
import DeleteDialog from '../../../components/admin/customers/DeleteDialog';

export default function CustomersList() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Delete Dialog state
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
      console.error("Error fetching customers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = customers.filter((customer) => 
        customer.customerName.toLowerCase().includes(lowercasedSearch) ||
        customer.mobileNumber.includes(lowercasedSearch) ||
        customer.customerId.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);

  const handleEdit = (id: string) => {
    navigate(`/admin/customers/edit/${id}`);
  };

  const confirmDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!customerToDelete?.id) return;
    
    setIsDeleting(true);
    try {
      await customerService.deleteCustomer(customerToDelete.id);
      await fetchCustomers(); // Refresh the list
      setIsDeleteDialogOpen(false);
      setCustomerToDelete(null);
    } catch (error) {
      console.error("Error deleting customer:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-serif text-gray-900">Customers</h1>
        <button
          onClick={() => navigate('/admin/customers/add')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-sm shadow-sm hover:bg-gray-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </button>
      </div>

      <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-200">
        <div className="max-w-md">
          <SearchBar 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm} 
            placeholder="Search by name, mobile, or ID..."
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden md:block">
            <CustomerTable 
              customers={filteredCustomers} 
              onEdit={handleEdit} 
              onDelete={confirmDelete} 
            />
          </div>

          {/* Mobile View */}
          <div className="md:hidden grid grid-cols-1 gap-4">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-sm border border-gray-200">
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
