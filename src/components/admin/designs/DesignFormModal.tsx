import { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Plus,
  Check,
  AlertCircle,
  Loader2,
  FileCode,
  FolderOpen
} from 'lucide-react';
import {
  WORK_TYPES,
  DESIGN_CATEGORIES,
  type Design,
  type DesignFormData
} from '../../../types/design';

interface DesignFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DesignFormData) => Promise<void>;
  initialData?: Design | null;
}

const COMMON_MACHINE_FILES = [
  'frount.DST',
  'sleeves.DST',
  'butta.DST',
  'full.DST',
  'neck.DST',
  'motive.DST',
  'back.DST',
];

export default function DesignFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: DesignFormModalProps) {
  const [formData, setFormData] = useState<DesignFormData>({
    designCode: '',
    name: '',
    category: DESIGN_CATEGORIES[0],
    workType: WORK_TYPES[0],
    price: 500,
    description: '',
    previewImageUrl: '',
    machineFiles: [],
    active: true,
  });

  const [customCategory, setCustomCategory] = useState('');
  const [newMachineFile, setNewMachineFile] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageLoadError, setImageLoadError] = useState(false);

  useEffect(() => {
    if (initialData) {
      const isPresetCategory = DESIGN_CATEGORIES.includes(initialData.category as any);
      setFormData({
        designCode: initialData.designCode || '',
        name: initialData.name || '',
        category: isPresetCategory ? initialData.category : 'Other / Custom',
        workType: initialData.workType || WORK_TYPES[0],
        price: initialData.price || 0,
        description: initialData.description || '',
        previewImageUrl: initialData.previewImageUrl || '',
        machineFiles: initialData.machineFiles || [],
        active: initialData.active ?? true,
      });
      if (!isPresetCategory) {
        setCustomCategory(initialData.category);
      } else {
        setCustomCategory('');
      }
    } else {
      setFormData({
        designCode: '',
        name: '',
        category: DESIGN_CATEGORIES[0],
        workType: WORK_TYPES[0],
        price: 500,
        description: '',
        previewImageUrl: '',
        machineFiles: [],
        active: true,
      });
      setCustomCategory('');
    }
    setErrors({});
    setImageLoadError(false);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (name === 'previewImageUrl') {
      setImageLoadError(false);
    }
  };

  // Helper to format design code to 3-digit folder (e.g. "1" -> "001", "45" -> "045")
  const getPaddedCode = (code: string) => {
    const trimmed = code.trim();
    const num = parseInt(trimmed, 10);
    if (!isNaN(num) && num > 0) {
      return num.toString().padStart(3, '0');
    }
    return trimmed.toLowerCase();
  };

  const handleApplySuggestedPath = (subpath: string) => {
    const folder = getPaddedCode(formData.designCode) || '001';
    const generatedPath = `/designs/${folder}/${subpath}`;
    setFormData((prev) => ({
      ...prev,
      previewImageUrl: generatedPath,
    }));
    setImageLoadError(false);
    if (errors.previewImageUrl) {
      setErrors((prev) => ({ ...prev, previewImageUrl: '' }));
    }
  };

  const handleAddMachineFile = (fileName: string) => {
    const trimmed = fileName.trim();
    if (!trimmed) return;
    const formatted = trimmed.endsWith('.DST') || trimmed.endsWith('.dst') ? trimmed : `${trimmed}.DST`;
    if (!formData.machineFiles.includes(formatted)) {
      setFormData((prev) => ({
        ...prev,
        machineFiles: [...prev.machineFiles, formatted],
      }));
    }
    setNewMachineFile('');
  };

  const handleRemoveMachineFile = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      machineFiles: prev.machineFiles.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.designCode.trim()) {
      errs.designCode = 'Design Code is required (à°¡à°¿à°œà±ˆà°¨à± à°•à±‹à°¡à± à°¤à°ªà±à°ªà°¨à°¿à°¸à°°à°¿)';
    }
    if (!formData.name.trim()) {
      errs.name = 'Design Name is required (à°¡à°¿à°œà±ˆà°¨à± à°ªà±‡à°°à± à°¤à°ªà±à°ªà°¨à°¿à°¸à°°à°¿)';
    }
    if (formData.category === 'Other / Custom' && !customCategory.trim()) {
      errs.category = 'Please enter custom category name';
    }
    if (formData.price < 0 || isNaN(formData.price)) {
      errs.price = 'Price must be a non-negative number';
    }
    if (!formData.previewImageUrl.trim()) {
      errs.previewImageUrl = 'Preview image path is required (à°ªà±à°°à°¿à°µà±à°¯à±‚ à°‡à°®à±‡à°œà± à°ªà°¾à°¤à± à°¤à°ªà±à°ªà°¨à°¿à°¸à°°à°¿)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const finalCategory =
        formData.category === 'Other / Custom' ? customCategory.trim() : formData.category;

      const submitPayload: DesignFormData = {
        ...formData,
        category: finalCategory,
        previewImageUrl: formData.previewImageUrl.trim(),
      };

      await onSubmit(submitPayload);
      onClose();
    } catch (err: any) {
      console.error('Error saving design:', err);
      setErrors((prev) => ({
        ...prev,
        general: err.message || 'Failed to save design. Please check your connection.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = (hasError: boolean) =>
    `w-full rounded-xl border px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
      hasError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
    }`;

  const currentFolder = getPaddedCode(formData.designCode) || '001';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-xl font-serif font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {initialData ? 'Edit Design' : 'Add New Design'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {initialData ? 'à°¡à°¿à°œà±ˆà°¨à± à°µà°¿à°µà°°à°¾à°²à± à°¸à°µà°°à°¿à°‚à°šà°‚à°¡à°¿' : 'à°•à±‡à°Ÿà°²à°¾à°—à±â€Œà°²à±‹ à°•à±Šà°¤à±à°¤ à°Žà°‚à°¬à±à°°à°¾à°¯à°¿à°¡à°°à±€ à°¡à°¿à°œà±ˆà°¨à± à°œà±‹à°¡à°¿à°‚à°šà°‚à°¡à°¿'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {errors.general && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Basic Information / à°ªà±à°°à°¾à°¥à°®à°¿à°• à°µà°¿à°µà°°à°¾à°²à±
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Design Code */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Design Code (à°¡à°¿à°œà±ˆà°¨à± à°•à±‹à°¡à±) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="designCode"
                  value={formData.designCode}
                  onChange={handleInputChange}
                  placeholder="e.g. 001 or 045"
                  className={inputStyle(!!errors.designCode)}
                />
                {errors.designCode && <p className="text-xs text-red-500 mt-1">{errors.designCode}</p>}
              </div>

              {/* Design Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Design Name (à°¡à°¿à°œà±ˆà°¨à± à°ªà±‡à°°à±) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Peacock Neck Embroidery"
                  className={inputStyle(!!errors.name)}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Category (à°•à±‡à°Ÿà°—à°¿à°°à±€) <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={inputStyle(!!errors.category)}
                >
                  {DESIGN_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {formData.category === 'Other / Custom' && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter custom category"
                    className={`${inputStyle(!!errors.category)} mt-2`}
                  />
                )}
                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
              </div>

              {/* Work Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Work Type (à°µà°°à±à°•à± à°°à°•à°‚) <span className="text-red-500">*</span>
                </label>
                <select
                  name="workType"
                  value={formData.workType}
                  onChange={handleInputChange}
                  className={inputStyle(!!errors.workType)}
                >
                  {WORK_TYPES.map((wt) => (
                    <option key={wt} value={wt}>
                      {wt}
                    </option>
                  ))}
                </select>
                {errors.workType && <p className="text-xs text-red-500 mt-1">{errors.workType}</p>}
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Price / à°§à°° (â‚¹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm font-semibold text-gray-400">â‚¹</span>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="50"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="500"
                    className={`${inputStyle(!!errors.price)} pl-8 font-semibold`}
                  />
                </div>
                {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Description / à°¡à°¿à°œà±ˆà°¨à± à°µà°¿à°µà°°à°£ <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea
                name="description"
                rows={2}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Details about thread colors, stitch style, fabric recommendation..."
                className={inputStyle(false)}
              />
            </div>
          </div>

          {/* Section 2: Preview Image Path (Static Assets) */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Preview Image Path (à°ªà±à°°à°¿à°µà±à°¯à±‚ à°‡à°®à±‡à°œà± à°ªà°¾à°¤à±) <span className="text-red-500">*</span>
              </label>
              <p className="text-[11px] text-gray-500 mb-2">
                Static JPG path located in <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">public/designs/</code>. Example: <code className="text-primary font-mono font-semibold">/designs/{currentFolder}/frount.jpg</code>
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                name="previewImageUrl"
                value={formData.previewImageUrl}
                onChange={handleInputChange}
                placeholder={`/designs/${currentFolder}/frount.jpg`}
                className={inputStyle(!!errors.previewImageUrl)}
              />
            </div>
            {errors.previewImageUrl && (
              <p className="text-xs text-red-500">{errors.previewImageUrl}</p>
            )}

            {/* Quick-fill suggestions based on Design Code */}
            <div className="flex flex-wrap gap-1.5 items-center pt-1">
              <span className="text-xs text-gray-400 mr-1 flex items-center gap-1">
                <FolderOpen className="w-3.5 h-3.5" /> Quick Auto-Fill:
              </span>
              <button
                type="button"
                onClick={() => handleApplySuggestedPath('frount.jpg')}
                className="px-2.5 py-1 bg-gray-100 hover:bg-primary/10 hover:text-primary rounded-lg text-xs font-mono transition-colors"
              >
                /designs/{currentFolder}/frount.jpg
              </button>
              <button
                type="button"
                onClick={() => handleApplySuggestedPath('full.jpg')}
                className="px-2.5 py-1 bg-gray-100 hover:bg-primary/10 hover:text-primary rounded-lg text-xs font-mono transition-colors"
              >
                /designs/{currentFolder}/full.jpg
              </button>
              <button
                type="button"
                onClick={() => handleApplySuggestedPath('sleeves.jpg')}
                className="px-2.5 py-1 bg-gray-100 hover:bg-primary/10 hover:text-primary rounded-lg text-xs font-mono transition-colors"
              >
                /designs/{currentFolder}/sleeves.jpg
              </button>
            </div>

            {/* Live Preview Box */}
            {formData.previewImageUrl && (
              <div className="mt-3 p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0 relative border border-gray-300">
                  <img
                    src={formData.previewImageUrl}
                    alt="Live Preview"
                    className="w-full h-full object-cover"
                    onLoad={() => setImageLoadError(false)}
                    onError={() => setImageLoadError(true)}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800">
                    Live Preview: <span className="font-mono text-primary">{formData.previewImageUrl}</span>
                  </p>
                  {imageLoadError ? (
                    <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      Image not yet copied to <code className="font-mono font-semibold">public{formData.previewImageUrl}</code>. It will appear once the JPG file is placed in that folder.
                    </p>
                  ) : (
                    <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 flex-shrink-0" />
                      Image preview loaded successfully!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Machine Files Metadata */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Machine File Names (.DST Metadata)
              </label>
              <p className="text-[11px] text-gray-500">
                Stores machine embroidery filenames for workshop reference. Original .DST files remain private on your computer.
              </p>
            </div>

            {/* Common quick add presets */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs text-gray-400 mr-1">Quick Add:</span>
              {COMMON_MACHINE_FILES.map((fn) => (
                <button
                  key={fn}
                  type="button"
                  onClick={() => handleAddMachineFile(fn)}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-primary/10 hover:text-primary rounded-lg text-xs font-medium text-gray-700 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  {fn}
                </button>
              ))}
            </div>

            {/* Custom file entry */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newMachineFile}
                onChange={(e) => setNewMachineFile(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMachineFile(newMachineFile);
                  }
                }}
                placeholder="e.g. frount.DST or butta.DST"
                className={inputStyle(false)}
              />
              <button
                type="button"
                onClick={() => handleAddMachineFile(newMachineFile)}
                className="px-4 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1 flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add File
              </button>
            </div>

            {/* List of currently linked files */}
            {formData.machineFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                {formData.machineFiles.map((file, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 text-gray-800 rounded-lg text-xs font-mono shadow-sm"
                  >
                    <FileCode className="w-3.5 h-3.5 text-primary" />
                    {file}
                    <button
                      type="button"
                      onClick={() => handleRemoveMachineFile(idx)}
                      className="text-gray-400 hover:text-red-500 ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Active Toggle */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-gray-800 block">
                Catalog Active Status (à°¯à°¾à°•à±à°Ÿà°¿à°µà± à°¸à±à°Ÿà±‡à°Ÿà°¸à±)
              </span>
              <span className="text-xs text-gray-400">
                When active, design is available in workshop and customer gallery.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData((prev) => ({ ...prev, active: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel (à°°à°¦à±à°¦à± à°šà±‡à°¯à°‚à°¡à°¿)
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Design...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {initialData ? 'Update Design' : 'Save Design (à°¸à±‡à°µà± à°šà±‡à°¯à°‚à°¡à°¿)'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
