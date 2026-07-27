import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { customerService } from '../../../services/customerService';
import type { CustomerFormData } from '../../../types/customer';
import CustomerForm from '../../../components/admin/customers/CustomerForm';

export default function AddCustomer() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true);
    try {
      await customerService.addCustomer(data);
      navigate('/admin/customers');
    } catch (error) {
      console.error("Error adding customer:", error);
      // In a real app, you would show a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/customers')}
          className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-serif text-gray-900">Add New Customer</h1>
      </div>

      <CustomerForm 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
      />
    </div>
  );
}
