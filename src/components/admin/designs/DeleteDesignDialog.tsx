import { AlertTriangle, X, Trash2, EyeOff, Loader2 } from 'lucide-react';
import type { Design } from '../../../types/design';

interface DeleteDesignDialogProps {
  isOpen: boolean;
  design: Design | null;
  onClose: () => void;
  onDeactivate: (design: Design) => Promise<void>;
  onPermanentDelete: (design: Design) => Promise<void>;
  isProcessing: boolean;
}

export default function DeleteDesignDialog({
  isOpen,
  design,
  onClose,
  onDeactivate,
  onPermanentDelete,
  isProcessing,
}: DeleteDesignDialogProps) {
  if (!isOpen || !design) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-lg font-serif font-bold text-gray-900 mb-1">
          Manage Design: #{design.designCode}
        </h3>
        <p className="text-sm font-medium text-gray-700 mb-3">
          "{design.name}"
        </p>
        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
          Would you like to softly deactivate this design or permanently delete it from the catalog?
          Deactivation keeps the design in your records while hiding it from customers.
        </p>

        <div className="space-y-2.5">
          {/* Option 1: Soft Deactivate (Recommended) */}
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onDeactivate(design)}
            className="w-full py-3 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-300/60 font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
            ) : (
              <EyeOff className="w-4 h-4 text-amber-700" />
            )}
            <span>Deactivate Design (హైడ్ చేయండి)</span>
          </button>

          {/* Option 2: Permanent Delete */}
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onPermanentDelete(design)}
            className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm shadow-red-200 disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span>Delete Permanently (పూర్తిగా తొలగించు)</span>
          </button>

          {/* Cancel */}
          <button
            type="button"
            disabled={isProcessing}
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl text-gray-500 hover:text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel (రద్దు చేయండి)
          </button>
        </div>
      </div>
    </div>
  );
}
