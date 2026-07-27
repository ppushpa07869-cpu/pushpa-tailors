import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { measurementService } from '../../../../services/measurementService';
import MeasurementForm from '../../../../components/admin/customers/measurements/MeasurementForm';
import type { MeasurementFormData } from '../../../../types/measurement';

export default function EditMeasurement() {
  const navigate = useNavigate();
  const { customerId, id: measurementId } = useParams<{ customerId: string, id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [initialData, setInitialData] = useState<MeasurementFormData | null>(null);

  useEffect(() => {
    const fetchMeasurement = async () => {
      if (!customerId || !measurementId) return;
      try {
        const data = await measurementService.getMeasurement(customerId, measurementId);
        if (data) {
          // Remove ID and timestamps for the form data
          const { id, customerId: _, createdAt, updatedAt, ...formData } = data;
          setInitialData(formData as MeasurementFormData);
        } else {
          setError('Measurement not found');
        }
      } catch (err: any) {
        console.error('Error fetching measurement:', err);
        setError('Failed to load measurement data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeasurement();
  }, [customerId, measurementId]);

  const handleSubmit = async (data: MeasurementFormData) => {
    if (!customerId || !measurementId) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await measurementService.updateMeasurement(customerId, measurementId, data);
      navigate(`/admin/customers/${customerId}/measurements`);
    } catch (err: any) {
      console.error('Error updating measurement:', err);
      setError(err.message || 'Failed to update measurement');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={`/admin/customers/${customerId}/measurements`}
            className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-sm transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-gray-900">Edit Measurement</h1>
            <p className="text-gray-500 text-sm mt-1">Update measurement details</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {initialData && !error && (
        <MeasurementForm 
          initialData={initialData} 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting} 
        />
      )}
    </div>
  );
}
