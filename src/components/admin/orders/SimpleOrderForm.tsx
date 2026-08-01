import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Camera, Upload, Trash2, IndianRupee, Calendar, User, Phone, Package, Tag, Hash, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { customerService } from '../../../services/customerService';
import { orderService } from '../../../services/orderService';
import type { Customer } from '../../../types/customer';
import type { OrderFormData, OrderStatus, OrderType } from '../../../types/order';

const PRIMARY_ORDER_TYPES: { type: OrderType; label: string; icon: string }[] = [
  { type: '👚 Blouse', label: 'Blouse', icon: '👚' },
  { type: '🧵 Saree Fall (Pico & Fall)', label: 'Saree Fall', icon: '🧵' },
  { type: '🎀 Saree Kuchulu (Tassels)', label: 'Saree Kuchulu', icon: '🎀' },
  { type: '👗 Dress', label: 'Dress', icon: '👗' },
  { type: '👶 Kids Wear', label: 'Kids Wear', icon: '👶' },
  { type: '✂️ Alteration', label: 'Alteration', icon: '✂️' },
];

const MORE_ORDER_TYPES: { type: OrderType; label: string; icon: string }[] = [
  { type: '🛍️ Custom Order', label: 'Custom Order', icon: '🛍️' },
  { type: '➕ Other', label: 'Other', icon: '➕' },
];

interface SimpleOrderFormProps {
  initialData?: Partial<OrderFormData>;
  initialCustomerName?: string;
  initialMobileNumber?: string;
  onSubmit: (data: OrderFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function SimpleOrderForm({
  initialData,
  initialCustomerName = '',
  initialMobileNumber = '',
  onSubmit,
  isLoading = false,
}: SimpleOrderFormProps) {
  const navigate = useNavigate();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<OrderFormData>({
    customerId: initialData?.customerId || '',
    customerName: initialCustomerName || initialData?.customerName || '',
    mobileNumber: initialMobileNumber || initialData?.mobileNumber || '',
    orderType: (initialData?.orderType as OrderType) || '👚 Blouse',
    quantity: initialData?.quantity || 1,
    orderDate: initialData?.orderDate || new Date().toISOString().split('T')[0],
    deliveryDate: initialData?.deliveryDate || '',
    status: (initialData?.status as OrderStatus) || 'Pending',
    advanceAmount: initialData?.advanceAmount || 0,
    totalAmount: initialData?.totalAmount || 0,
    referencePhotoUrl: initialData?.referencePhotoUrl || '',
    designRemarks: initialData?.designRemarks || '',
    notes: initialData?.notes || '',
  });

  const [showMoreTypes, setShowMoreTypes] = useState(false);
  const [existingCustomer, setExistingCustomer] = useState<{ customer: Customer; lastOrderDate: string } | null>(null);
  const [searchingCustomer, setSearchingCustomer] = useState(false);

  const [photoPreview, setPhotoPreview] = useState<string>(initialData?.referencePhotoUrl || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 1. Auto-focus Customer Name on mount
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // Live Firestore Search on Mobile Number Input
  useEffect(() => {
    const mobile = formData.mobileNumber.trim();
    if (mobile.length === 10 && /^\d{10}$/.test(mobile)) {
      setSearchingCustomer(true);
      customerService.findCustomerByMobile(mobile)
        .then(async (c) => {
          if (c) {
            let lastDate = 'No prior orders';
            try {
              const orders = await orderService.getOrdersByCustomer(c.id!);
              if (orders.length > 0) {
                lastDate = new Date(orders[0].orderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
              }
            } catch (e) {
              console.error(e);
            }
            setExistingCustomer({ customer: c, lastOrderDate: lastDate });
          } else {
            setExistingCustomer(null);
          }
        })
        .finally(() => setSearchingCustomer(false));
    } else {
      setExistingCustomer(null);
    }
  }, [formData.mobileNumber]);

  const remainingAmount = Math.max(0, (formData.totalAmount || 0) - (formData.advanceAmount || 0));

  // 2. Keyboard Navigation using Enter Key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      if (e.currentTarget.tagName === 'TEXTAREA') return;
      e.preventDefault();
      const form = e.currentTarget.closest('form');
      const formElements = Array.from(
        form?.querySelectorAll('input, select, textarea') || []
      ) as HTMLElement[];
      const index = formElements.indexOf(e.currentTarget);
      if (index > -1 && index < formElements.length - 1) {
        formElements[index + 1].focus();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value,
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleUseExistingCustomer = () => {
    if (!existingCustomer) return;
    setFormData(prev => ({
      ...prev,
      customerId: existingCustomer.customer.id!,
      customerName: existingCustomer.customer.customerName,
      mobileNumber: existingCustomer.customer.mobileNumber,
    }));
  };

  const handlePhotoFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPhotoPreview(base64);
      setFormData(prev => ({ ...prev, referencePhotoUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePhotoFile(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview('');
    setFormData(prev => ({ ...prev, referencePhotoUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer Name is required';
    }
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile Number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNumber.trim())) {
      newErrors.mobileNumber = 'Mobile Number must be 10 digits';
    }

    if (!formData.orderType) {
      newErrors.orderType = 'Please select an Order Type';
    }

    if (!formData.deliveryDate) {
      newErrors.deliveryDate = 'Delivery date is required';
    }

    if (!formData.totalAmount || formData.totalAmount <= 0) {
      newErrors.totalAmount = 'Total amount is required';
    }

    if ((formData.advanceAmount || 0) > (formData.totalAmount || 0)) {
      newErrors.advanceAmount = 'Advance cannot exceed total amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-900 font-medium ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200'
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* 1. Customer Information Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="font-serif font-bold text-gray-900 flex items-center gap-2 text-base border-b pb-3">
          <User className="h-5 w-5 text-primary" />
          Customer Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer Name (Auto-focused) */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={nameInputRef}
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter customer full name..."
              className={inputClass('customerName')}
            />
            {errors.customerName && <p className="text-xs text-red-500">{errors.customerName}</p>}
          </div>

          {/* Mobile Number with Live Firestore Lookup */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 flex items-center justify-between">
              <span>Mobile Number (10 digits) <span className="text-red-500">*</span></span>
              {searchingCustomer && <span className="text-xs text-primary animate-pulse">Searching Firestore...</span>}
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                maxLength={10}
                placeholder="9876543210"
                className={`${inputClass('mobileNumber')} pl-11 font-mono`}
              />
            </div>
            {errors.mobileNumber && <p className="text-xs text-red-500">{errors.mobileNumber}</p>}
          </div>
        </div>

        {/* Existing Customer Auto-Match Banner */}
        {existingCustomer && (
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in shadow-sm">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <span>{existingCustomer.customer.customerName}</span>
                  <span className="text-[10px] font-mono bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                    {existingCustomer.customer.customerId}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-0.5">
                  Last Order: <span className="font-semibold text-gray-800">{existingCustomer.lastOrderDate}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleUseExistingCustomer}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex-shrink-0"
            >
              Use {existingCustomer.customer.customerName}
            </button>
          </div>
        )}
      </div>

      {/* 2. Order Information Section with Quick Selection Buttons */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h3 className="font-serif font-bold text-gray-900 flex items-center gap-2 text-base border-b pb-3">
          <Package className="h-5 w-5 text-primary" />
          Order Specifications
        </h3>

        {/* Quick Selection Order Type Buttons */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Tag className="h-4 w-4 text-primary" />
            Select Order Type <span className="text-red-500">*</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {PRIMARY_ORDER_TYPES.map((item) => {
              const isSelected = formData.orderType === item.type;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, orderType: item.type }))}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl font-bold text-sm text-left transition-all border ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-[1.02]'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Toggle More Order Types */}
          <div>
            <button
              type="button"
              onClick={() => setShowMoreTypes(!showMoreTypes)}
              className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors pt-1"
            >
              {showMoreTypes ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {showMoreTypes ? 'Show Less Options' : 'More Services (Custom / Other)...'}
            </button>

            {showMoreTypes && (
              <div className="grid grid-cols-2 gap-2.5 pt-2 animate-fade-in">
                {MORE_ORDER_TYPES.map((item) => {
                  const isSelected = formData.orderType === item.type;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, orderType: item.type }))}
                      className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl font-bold text-sm text-left transition-all border ${
                        isSelected
                          ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-[1.02]'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {errors.orderType && <p className="text-xs text-red-500">{errors.orderType}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Quantity */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <Hash className="h-4 w-4 text-gray-500" />
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              min="1"
              className={inputClass('quantity')}
            />
          </div>

          {/* Order Date */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Order Date</label>
            <input
              type="date"
              name="orderDate"
              value={formData.orderDate}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={inputClass('orderDate')}
            />
          </div>

          {/* Delivery Date */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary" />
              Delivery Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="deliveryDate"
              value={formData.deliveryDate}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              min={formData.orderDate}
              className={inputClass('deliveryDate')}
            />
            {errors.deliveryDate && <p className="text-xs text-red-500">{errors.deliveryDate}</p>}
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="space-y-1.5 pt-2">
          <label className="block text-sm font-semibold text-gray-700">Initial Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={inputClass('status')}
          >
            <option value="Pending">🟡 Pending</option>
            <option value="In Progress">🟠 In Progress</option>
            <option value="Ready">🟢 Ready</option>
            <option value="Delivered">✔ Delivered</option>
          </select>
        </div>
      </div>

      {/* 3. Payment Details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h3 className="font-serif font-bold text-gray-900 flex items-center gap-2 text-base border-b pb-3">
          <IndianRupee className="h-5 w-5 text-green-600" />
          Payment Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Amount */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              Total Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount || ''}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                min="0"
                placeholder="0"
                className={`${inputClass('totalAmount')} pl-8`}
              />
            </div>
            {errors.totalAmount && <p className="text-xs text-red-500">{errors.totalAmount}</p>}
          </div>

          {/* Advance Amount */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Advance Paid</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
              <input
                type="number"
                name="advanceAmount"
                value={formData.advanceAmount || ''}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                min="0"
                max={formData.totalAmount}
                placeholder="0"
                className={`${inputClass('advanceAmount')} pl-8`}
              />
            </div>
            {errors.advanceAmount && <p className="text-xs text-red-500">{errors.advanceAmount}</p>}
          </div>

          {/* Remaining (computed) */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Remaining Balance</label>
            <div className={`px-4 py-3 rounded-xl border font-bold text-lg ${
              remainingAmount > 0
                ? 'bg-orange-50 border-orange-200 text-orange-600'
                : 'bg-green-50 border-green-200 text-green-600'
            }`}>
              ₹{remainingAmount}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Optional Photo Upload */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="font-serif font-bold text-gray-900 text-base border-b pb-3">
          📸 Reference Photo <span className="text-gray-400 font-normal text-sm">(Optional)</span>
        </h3>
        <p className="text-xs text-gray-500">Upload handwritten measurements, old blouse photo, reference design or sketch</p>

        {photoPreview ? (
          <div className="relative inline-block">
            <img
              src={photoPreview}
              alt="Reference"
              className="w-48 h-48 object-cover rounded-xl border-2 border-gray-200 shadow-sm"
            />
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="absolute -top-2 -right-2 h-7 w-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all font-medium text-sm"
            >
              <Upload className="h-5 w-5" />
              Upload Image
            </button>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all font-medium text-sm"
            >
              <Camera className="h-5 w-5" />
              Take Photo
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* 5. Optional Design Remarks */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
        <h3 className="font-serif font-bold text-gray-900 text-base border-b pb-3">
          ✏️ Design Remarks <span className="text-gray-400 font-normal text-sm">(Optional)</span>
        </h3>
        <textarea
          name="designRemarks"
          value={formData.designRemarks || ''}
          onChange={handleChange}
          rows={3}
          placeholder="Design style, special stitching instructions, neck pattern, lining details..."
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-900 resize-none font-medium text-sm"
        />
      </div>

      {/* Primary Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 border-2 border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-colors text-base"
        >
          <X className="h-5 w-5" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/30 hover:bg-primary/90 hover:scale-[1.01] transition-all text-base disabled:bg-gray-300 disabled:shadow-none"
        >
          <Save className="h-5 w-5" />
          {isLoading ? 'Saving Order & Customer...' : 'Save Order'}
        </button>
      </div>
    </form>
  );
}


