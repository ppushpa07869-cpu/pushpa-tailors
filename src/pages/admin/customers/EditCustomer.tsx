import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { customerService } from '../../../services/customerService';
import type { CustomerFormData } from '../../../types/customer';
import CustomerForm from '../../../components/admin/customers/CustomerForm';

export default function EditCustomer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState<CustomerFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    customerService.getCustomer(id)
      .then(customer => {
        if (!customer) {
          navigate('/admin/customers');
          return;
        }
        setInitialData({
          customerName: customer.customerName,
          mobileNumber: customer.mobileNumber,
          alternateNumber: customer.alternateNumber || '',
          address: customer.address || '',
        });
      })
      .catch(() => navigate('/admin/customers'))
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (data: CustomerFormData) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await customerService.updateCustomer(id, data);
      navigate(`/admin/customers/${id}`);
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Failed to update customer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/admin/customers/${id}`)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Customer
        </button>
      </div>

      <div>
        <h1 className="text-3xl font-serif text-gray-900">Edit Customer</h1>
        <p className="text-gray-500 mt-1">Update customer contact details.</p>
      </div>

      {initialData && (
        <CustomerForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
