import { X } from 'lucide-react';
import type { Measurement } from '../../../../types/measurement';

interface MeasurementViewDialogProps {
  measurement: Measurement;
  onClose: () => void;
}

export default function MeasurementViewDialog({ measurement, onClose }: MeasurementViewDialogProps) {
  const fields = [
    { label: 'Bust', value: measurement.bust },
    { label: 'Waist', value: measurement.waist },
    { label: 'Shoulder', value: measurement.shoulder },
    { label: 'Front Neck', value: measurement.frontNeck },
    { label: 'Back Neck', value: measurement.backNeck },
    { label: 'Sleeve Length', value: measurement.sleeveLength },
    { label: 'Sleeve Round', value: measurement.sleeveRound },
    { label: 'Blouse Length', value: measurement.blouseLength },
    { label: 'Arm Hole', value: measurement.armHole },
    { label: 'Chest Round', value: measurement.chestRound },
    { label: 'Margin', value: measurement.margin },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-sm shadow-xl max-w-lg w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-serif font-semibold text-gray-900">Measurement Details</h2>
            <span className="inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
              {measurement.measurementType}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            {fields.map((field) => (
              <div key={field.label} className="border-b border-gray-50 pb-2">
                <span className="block text-xs text-gray-500 uppercase tracking-wider">{field.label}</span>
                <span className="text-sm font-medium text-gray-900 mt-1">{field.value}</span>
              </div>
            ))}
          </div>
          
          {measurement.notes && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <span className="block text-xs text-gray-500 uppercase tracking-wider">Notes</span>
              <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{measurement.notes}</p>
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
