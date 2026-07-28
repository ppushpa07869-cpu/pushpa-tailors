import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Calculator } from 'lucide-react';
import { customerService } from '../../../services/customerService';
import { measurementService } from '../../../services/measurementService';
import type { Customer } from '../../../types/customer';
import type { Measurement } from '../../../types/measurement';
import type { OrderFormData, OrderStatus } from '../../../types/order';

interface OrderFormProps {
  initialData?: OrderFormData;
  onSubmit: (data: OrderFormData) => Promise<void>;
  isLoading?: boolean;
}

const STATUS_OPTIONS: OrderStatus[] = [
  'New (కొత్తది)',
  'Cutting (కటింగ్)',
  'Stitching (కుట్టుతున్నారు)',
  'Ready (సిద్ధంగా ఉంది)',
  'Delivered (డెలివరీ అయింది)',
  'Cancelled (రద్దు)',
];

export default function OrderForm({ initialData, onSubmit, isLoading }: OrderFormProps) {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingMeasurements, setLoadingMeasurements] = useState(false);

  const [formData, setFormData] = useState<OrderFormData>(
    initialData || {
      customerId: '',
      customerName: '',
      mobileNumber: '',
      measurementId: '',
      measurementType: '',
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      status: 'New (కొత్తది)',
      advanceAmount: 0,
      totalAmount: 0,
      notes: '',
    }
  );

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await customerService.getCustomers();
        setCustomers(data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoadingCustomers(false);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (formData.customerId) {
      const fetchMeasurements = async () => {
        setLoadingMeasurements(true);
        try {
          const data = await measurementService.getMeasurements(formData.customerId);
          setMeasurements(data);
        } catch (error) {
          console.error("Error fetching measurements:", error);
        } finally {
          setLoadingMeasurements(false);
        }
      };
      fetchMeasurements();
    } else {
      setMeasurements([]);
    }
  }, [formData.customerId]);

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const customerId = e.target.value;
    const selectedCustomer = customers.find(c => c.id === customerId);
    
    setFormData(prev => ({
      ...prev,
      customerId,
      customerName: selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : '',
      mobileNumber: selectedCustomer ? selectedCustomer.mobileNumber : '',
      measurementId: '', // Reset measurement when customer changes
      measurementType: '',
    }));
  };

  const handleMeasurementChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const measurementId = e.target.value;
    const selectedMeasurement = measurements.find(m => m.id === measurementId);
    
    setFormData(prev => ({
      ...prev,
      measurementId,
      measurementType: selectedMeasurement ? selectedMeasurement.measurementType : '',
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value
    }));
  };

  const remainingAmount = Math.max(0, formData.totalAmount - formData.advanceAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.advanceAmount > formData.totalAmount) {
      alert("Advance amount cannot exceed total amount.");
      return;
    }
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 shadow-sm border border-gray-100 rounded-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Selection */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Customer (కస్టమర్) <span className="text-red-500">*</span>
          </label>
          <select
            name="customerId"
            value={formData.customerId}
            onChange={handleCustomerChange}
            required
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
            disabled={loadingCustomers}
          >
            <option value="">Select a Customer</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.firstName} {customer.lastName} ({customer.mobileNumber})
              </option>
            ))}
          </select>
        </div>

        {/* Measurement Selection */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Measurement (కొలత) <span className="text-red-500">*</span>
          </label>
          <select
            name="measurementId"
            value={formData.measurementId}
            onChange={handleMeasurementChange}
            required
            disabled={!formData.customerId || loadingMeasurements}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">
              {!formData.customerId 
                ? 'Please select a customer first' 
                : loadingMeasurements 
                  ? 'Loading...' 
                  : 'Select a Measurement'}
            </option>
            {measurements.map(m => (
              <option key={m.id} value={m.id}>
                {m.measurementType} - {new Date(m.createdAt?.toDate ? m.createdAt.toDate() : Date.now()).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {/* Order Date */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Order Date (ఆర్డర్ తేదీ) <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="orderDate"
            value={formData.orderDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
          />
        </div>

        {/* Delivery Date */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Delivery Date (డెలివరీ తేదీ) <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="deliveryDate"
            value={formData.deliveryDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
          />
        </div>

        {/* Status */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Status (స్థితి) <span className="text-red-500">*</span>
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
          >
            {STATUS_OPTIONS.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-serif text-gray-900">Payment Details (చెల్లింపు వివరాలు)</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Total Amount (మొత్తం) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="totalAmount"
              value={formData.totalAmount || ''}
              onChange={handleChange}
              min="0"
              required
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Advance Amount (అడ్వాన్స్)
            </label>
            <input
              type="number"
              name="advanceAmount"
              value={formData.advanceAmount || ''}
              onChange={handleChange}
              min="0"
              max={formData.totalAmount}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Remaining Amount (మిగిలినది)
            </label>
            <div className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-sm text-gray-700 font-semibold">
              ₹ {remainingAmount}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Notes (గమనికలు)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
            placeholder="Any special instructions..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={() => navigate('/admin/orders')}
          className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 transition-colors"
        >
          <X className="h-4 w-4" />
          <span>Cancel</span>
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-sm hover:bg-secondary transition-colors disabled:bg-gray-400"
        >
          <Save className="h-4 w-4" />
          <span>{isLoading ? 'Saving...' : 'Save Order'}</span>
        </button>
      </div>
    </form>
  );
}
