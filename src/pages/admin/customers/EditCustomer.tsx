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
    const fetchCustomer = async () => {
      if (!id) return;
      
      try {
        const customer = await customerService.getCustomer(id);
        if (customer) {
          // Format date for the input type="date"
          let formattedDate = '';
          if (customer.deliveryDate) {
            const dDate = typeof customer.deliveryDate === 'string' 
              ? new Date(customer.deliveryDate)
              : (customer.deliveryDate as any).toDate ? (customer.deliveryDate as any).toDate() : new Date(customer.deliveryDate as any);
            
            if (!isNaN(dDate.getTime())) {
              formattedDate = dDate.toISOString().split('T')[0];
            }
          }
          
          setInitialData({
            customerName: customer.customerName,
            mobileNumber: customer.mobileNumber,
            alternateNumber: customer.alternateNumber || '',
            address: customer.address || '',
            measurementType: customer.measurementType || 'Standard',
            blouseType: customer.blouseType || 'Normal',
            deliveryDate: formattedDate,
            totalAmount: customer.totalAmount,
            advanceAmount: customer.advanceAmount,
            remainingAmount: customer.remainingAmount,
            status: customer.status,
          });
        } else {
          navigate('/admin/customers');
        }
      } catch (error) {
        console.error("Error fetching customer:", error);
        navigate('/admin/customers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomer();
  }, [id, navigate]);

  const handleSubmit = async (data: CustomerFormData) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      await customerService.updateCustomer(id, data);
      navigate('/admin/customers');
    } catch (error) {
      console.error("Error updating customer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/customers')}
          className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-serif text-gray-900">Edit Customer</h1>
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
