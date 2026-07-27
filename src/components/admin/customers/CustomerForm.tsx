import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { customerSchema } from '../../../types/customer';
import type { CustomerFormData } from '../../../types/customer';

interface CustomerFormProps {
  initialData?: CustomerFormData;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  isSubmitting: boolean;
}

export default function CustomerForm({ initialData, onSubmit, isSubmitting }: CustomerFormProps) {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema as any),
    defaultValues: initialData || {
      customerName: '',
      mobileNumber: '',
      alternateNumber: '',
      address: '',
      measurementType: 'Standard',
      blouseType: 'Normal',
      deliveryDate: '',
      totalAmount: 0,
      advanceAmount: 0,
      remainingAmount: 0,
      status: 'Pending',
    },
  });

  const totalAmount = watch('totalAmount');
  const advanceAmount = watch('advanceAmount');

  // Auto calculate remaining amount
  useEffect(() => {
    const total = Number(totalAmount) || 0;
    const advance = Number(advanceAmount) || 0;
    setValue('remainingAmount', Math.max(0, total - advance));
  }, [totalAmount, advanceAmount, setValue]);

  const handleReset = () => {
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 border border-gray-100 rounded-sm shadow-sm">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="space-y-6">
          <h3 className="text-lg font-serif font-medium text-gray-900 border-b pb-2">Personal Details</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Customer Name *</label>
            <input
              type="text"
              {...register('customerName')}
              className={`mt-1 block w-full rounded-sm border ${errors.customerName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'} shadow-sm py-2 px-3 sm:text-sm`}
            />
            {errors.customerName && <p className="mt-1 text-xs text-red-500">{errors.customerName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile Number *</label>
            <input
              type="text"
              {...register('mobileNumber')}
              placeholder="10 digits"
              className={`mt-1 block w-full rounded-sm border ${errors.mobileNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'} shadow-sm py-2 px-3 sm:text-sm`}
            />
            {errors.mobileNumber && <p className="mt-1 text-xs text-red-500">{errors.mobileNumber.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Alternate Number</label>
            <input
              type="text"
              {...register('alternateNumber')}
              placeholder="10 digits (Optional)"
              className={`mt-1 block w-full rounded-sm border ${errors.alternateNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'} shadow-sm py-2 px-3 sm:text-sm`}
            />
            {errors.alternateNumber && <p className="mt-1 text-xs text-red-500">{errors.alternateNumber.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              {...register('address')}
              rows={3}
              className="mt-1 block w-full rounded-sm border border-gray-300 shadow-sm py-2 px-3 focus:border-black focus:ring-black sm:text-sm"
            />
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-6">
          <h3 className="text-lg font-serif font-medium text-gray-900 border-b pb-2">Order Details</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Measurement Type</label>
              <select
                {...register('measurementType')}
                className="mt-1 block w-full rounded-sm border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
              >
                <option value="Standard">Standard</option>
                <option value="Custom">Custom</option>
                <option value="Measurement Dress">Measurement Dress</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Blouse Type</label>
              <select
                {...register('blouseType')}
                className="mt-1 block w-full rounded-sm border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
              >
                <option value="Normal">Normal</option>
                <option value="Lining">Lining</option>
                <option value="Boat Neck">Boat Neck</option>
                <option value="Princess Cut">Princess Cut</option>
                <option value="Katori">Katori</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Delivery Date *</label>
            <input
              type="date"
              {...register('deliveryDate')}
              className={`mt-1 block w-full rounded-sm border ${errors.deliveryDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'} shadow-sm py-2 px-3 sm:text-sm`}
            />
            {errors.deliveryDate && <p className="mt-1 text-xs text-red-500">{errors.deliveryDate.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              {...register('status')}
              className="mt-1 block w-full rounded-sm border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        </div>

        {/* Payment Details */}
        <div className="space-y-6 md:col-span-2">
          <h3 className="text-lg font-serif font-medium text-gray-900 border-b pb-2">Payment Details</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Amount *</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">₹</span>
                </div>
                <input
                  type="number"
                  {...register('totalAmount', { valueAsNumber: true })}
                  className={`block w-full rounded-sm border ${errors.totalAmount ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'} pl-7 py-2 sm:text-sm`}
                />
              </div>
              {errors.totalAmount && <p className="mt-1 text-xs text-red-500">{errors.totalAmount.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Advance Amount</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">₹</span>
                </div>
                <input
                  type="number"
                  {...register('advanceAmount', { valueAsNumber: true })}
                  className={`block w-full rounded-sm border ${errors.advanceAmount ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'} pl-7 py-2 sm:text-sm`}
                />
              </div>
              {errors.advanceAmount && <p className="mt-1 text-xs text-red-500">{errors.advanceAmount.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Remaining Amount</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">₹</span>
                </div>
                <input
                  type="number"
                  readOnly
                  {...register('remainingAmount', { valueAsNumber: true })}
                  className="block w-full rounded-sm border border-gray-300 bg-gray-50 pl-7 py-2 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => navigate('/admin/customers')}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-sm shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:bg-gray-400"
        >
          {isSubmitting ? 'Saving...' : 'Save Customer'}
        </button>
      </div>
    </form>
  );
}
