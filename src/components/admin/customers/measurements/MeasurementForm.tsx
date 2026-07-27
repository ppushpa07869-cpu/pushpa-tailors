import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { measurementSchema, MeasurementTypes } from '../../../../types/measurement';
import type { MeasurementFormData } from '../../../../types/measurement';

interface MeasurementFormProps {
  initialData?: MeasurementFormData;
  onSubmit: (data: MeasurementFormData) => Promise<void>;
  isSubmitting: boolean;
}

export default function MeasurementForm({ initialData, onSubmit, isSubmitting }: MeasurementFormProps) {
  const navigate = useNavigate();
  const { customerId } = useParams();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MeasurementFormData>({
    resolver: zodResolver(measurementSchema as any),
    defaultValues: initialData || {
      measurementType: 'Standard (సాధారణం)',
      bust: undefined,
      waist: undefined,
      shoulder: undefined,
      frontNeck: undefined,
      backNeck: undefined,
      sleeveLength: undefined,
      sleeveRound: undefined,
      blouseLength: undefined,
      armHole: undefined,
      chestRound: undefined,
      margin: undefined,
      notes: '',
    },
  });

  const numericFields = [
    { name: 'bust', label: 'Bust (ఛాతి)' },
    { name: 'waist', label: 'Waist (నడుము)' },
    { name: 'shoulder', label: 'Shoulder (భుజం)' },
    { name: 'frontNeck', label: 'Front Neck (ముందు మెడ)' },
    { name: 'backNeck', label: 'Back Neck (వెనుక మెడ)' },
    { name: 'sleeveLength', label: 'Sleeve Length (చేతి పొడవు)' },
    { name: 'sleeveRound', label: 'Sleeve Round (చేతి చుట్టు)' },
    { name: 'blouseLength', label: 'Blouse Length (బ్లౌజ్ పొడవు)' },
    { name: 'armHole', label: 'Arm Hole (చంక కొలత)' },
    { name: 'chestRound', label: 'Chest Round (ఛాతి చుట్టు)' },
    { name: 'margin', label: 'Margin / Loose (మార్జిన్)' },
  ] as const;

  const handleReset = () => {
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 border border-gray-100 rounded-sm shadow-sm">
      <div className="space-y-6">
        <h3 className="text-lg font-serif font-medium text-gray-900 border-b pb-2">Measurement Details</h3>
        
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <p className="text-sm text-blue-700">
            Fill only the measurements that are needed.<br/>
            <span className="font-medium mt-1 inline-block">అవసరమైన కొలతలు మాత్రమే నమోదు చేయండి.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Measurement Type (కొలత రకం)</label>
            <select
              {...register('measurementType')}
              className={`mt-1 block w-full rounded-sm border ${errors.measurementType ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'} bg-white py-2 px-3 shadow-sm sm:text-sm`}
            >
              {MeasurementTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.measurementType && <p className="mt-1 text-xs text-red-500">{errors.measurementType.message}</p>}
          </div>

          {numericFields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700">{field.label}</label>
              <input
                type="number"
                step="0.01"
                placeholder="Enter value (విలువ నమోదు చేయండి)"
                {...register(field.name, { valueAsNumber: true })}
                className={`mt-1 block w-full rounded-sm border ${errors[field.name] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'} shadow-sm py-2 px-3 sm:text-sm`}
              />
              {errors[field.name] && <p className="mt-1 text-xs text-red-500">{errors[field.name]?.message}</p>}
            </div>
          ))}

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Notes (గమనికలు)</label>
            <textarea
              {...register('notes')}
              rows={4}
              className="mt-1 block w-full rounded-sm border border-gray-300 shadow-sm py-2 px-3 focus:border-black focus:ring-black sm:text-sm"
              placeholder="Any special instructions... (ప్రత్యేక సూచనలు...)"
            />
            {errors.notes && <p className="mt-1 text-xs text-red-500">{errors.notes.message}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => navigate(`/admin/customers/${customerId}/measurements`)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          Back (వెనక్కి)
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          Reset (రిసెట్)
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-sm shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:bg-gray-400"
        >
          {isSubmitting ? 'Saving...' : 'Save Measurement (కొలత సేవ్ చేయండి)'}
        </button>
      </div>
    </form>
  );
}
