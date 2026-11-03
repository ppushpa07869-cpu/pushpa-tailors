import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { customerSchema } from '../../../types/customer';
import type { CustomerFormData } from '../../../types/customer';
import { User, Phone, MapPin, X, Save } from 'lucide-react';

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
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema as any),
    defaultValues: initialData || {
      customerName: '',
      mobileNumber: '',
      alternateNumber: '',
      address: '',
    },
  });

  const inputClass = (hasError: boolean) =>
    `mt-1 block w-full rounded-xl border px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
      hasError
        ? 'border-red-400 bg-red-50'
        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
    }`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 border border-gray-100 rounded-2xl shadow-sm">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Customer Name */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-gray-400" />
            Customer Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('customerName')}
            placeholder="Enter full name"
            className={inputClass(!!errors.customerName)}
          />
          {errors.customerName && <p className="mt-1 text-xs text-red-500">{errors.customerName.message}</p>}
        </div>

        {/* Mobile Number */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-gray-400" />
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('mobileNumber')}
            placeholder="10-digit number"
            className={inputClass(!!errors.mobileNumber)}
          />
          {errors.mobileNumber && <p className="mt-1 text-xs text-red-500">{errors.mobileNumber.message}</p>}
        </div>

        {/* Alternate Number */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-gray-400" />
            Alternate Number <span className="text-gray-400 font-normal text-xs">(Optional)</span>
          </label>
          <input
            type="text"
            {...register('alternateNumber')}
            placeholder="10-digit number"
            className={inputClass(!!errors.alternateNumber)}
          />
          {errors.alternateNumber && <p className="mt-1 text-xs text-red-500">{errors.alternateNumber.message}</p>}
        </div>

        {/* Address */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-gray-400" />
            Address <span className="text-gray-400 font-normal text-xs">(Optional)</span>
          </label>
          <input
            type="text"
            {...register('address')}
            placeholder="Street, area..."
            className={inputClass(false)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-primary rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:bg-gray-400 disabled:shadow-none"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? 'Saving...' : 'Save Customer'}
        </button>
      </div>
    </form>
  );
}
