import { AlertTriangle, X } from 'lucide-react';
import type { Measurement } from '../../../../types/measurement';

interface DeleteMeasurementDialogProps {
  measurement: Measurement;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export default function DeleteMeasurementDialog({ 
  measurement, 
  onConfirm, 
  onCancel,
  isDeleting = false 
}: DeleteMeasurementDialogProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-sm shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle className="h-6 w-6" />
            <h2 className="text-xl font-serif font-semibold">Delete Measurement</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500 transition-colors"
            disabled={isDeleting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600">
            Are you sure you want to delete the <span className="font-medium text-gray-900">{measurement.measurementType}</span> measurement? 
            This action cannot be undone.
          </p>
        </div>
        
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-sm hover:bg-red-700 disabled:opacity-50 disabled:bg-red-400 flex items-center gap-2"
          >
            {isDeleting ? 'Deleting...' : 'Delete Measurement'}
          </button>
        </div>
      </div>
    </div>
  );
}
