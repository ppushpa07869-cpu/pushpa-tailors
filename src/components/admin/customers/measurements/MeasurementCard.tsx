import { Edit, Trash2, Eye } from 'lucide-react';
import type { Measurement } from '../../../../types/measurement';

interface MeasurementCardProps {
  measurement: Measurement;
  onView: (measurement: Measurement) => void;
  onEdit: (id: string) => void;
  onDelete: (measurement: Measurement) => void;
}

export default function MeasurementCard({ measurement, onView, onEdit, onDelete }: MeasurementCardProps) {
  const formatDate = (dateValue: any) => {
    if (!dateValue) return 'N/A';
    if (typeof dateValue === 'string') return dateValue;
    if (dateValue.toDate) {
      return dateValue.toDate().toLocaleDateString();
    }
    return new Date(dateValue).toLocaleDateString();
  };

  return (
    <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-200 flex flex-col gap-3 md:hidden">
      <div className="flex justify-between items-start">
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
          {measurement.measurementType}
        </span>
        <span className="text-xs text-gray-500 font-mono">
          {formatDate(measurement.createdAt)}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
        <div>
          <span className="block text-xs text-gray-400">Bust / Waist</span>
          {measurement.bust} / {measurement.waist}
        </div>
        <div>
          <span className="block text-xs text-gray-400">Shoulder / Arm Hole</span>
          {measurement.shoulder} / {measurement.armHole}
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end gap-2">
        <button 
          onClick={() => onView(measurement)}
          className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-sm transition-colors"
          title="View"
        >
          <Eye className="h-4 w-4" />
        </button>
        <button 
          onClick={() => onEdit(measurement.id!)}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-sm transition-colors"
          title="Edit"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button 
          onClick={() => onDelete(measurement)}
          className="p-1.5 text-red-600 hover:bg-red-50 rounded-sm transition-colors"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
