import { Edit, Trash2, Eye } from 'lucide-react';
import type { Measurement } from '../../../../types/measurement';

interface MeasurementTableProps {
  measurements: Measurement[];
  onView: (measurement: Measurement) => void;
  onEdit: (id: string) => void;
  onDelete: (measurement: Measurement) => void;
}

export default function MeasurementTable({ measurements, onView, onEdit, onDelete }: MeasurementTableProps) {
  const formatDate = (dateValue: any) => {
    if (!dateValue) return 'N/A';
    if (typeof dateValue === 'string') return dateValue;
    if (dateValue.toDate) {
      return dateValue.toDate().toLocaleDateString();
    }
    return new Date(dateValue).toLocaleDateString();
  };

  if (measurements.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-sm border border-gray-200">
        <p className="text-gray-500">No measurements found for this customer.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-sm shadow-sm border border-gray-200 hidden md:block">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date Added
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Bust / Waist
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Shoulder / Arm Hole
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {measurements.map((measurement) => (
            <tr key={measurement.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                  {measurement.measurementType}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(measurement.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {measurement.bust} / {measurement.waist}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {measurement.shoulder} / {measurement.armHole}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => onView(measurement)}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => onEdit(measurement.id!)}
                    className="text-blue-600 hover:text-blue-900 transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(measurement)}
                    className="text-red-600 hover:text-red-900 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
