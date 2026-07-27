import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Search, ArrowLeft } from 'lucide-react';
import { measurementService } from '../../../../services/measurementService';
import { customerService } from '../../../../services/customerService';
import type { Measurement } from '../../../../types/measurement';
import type { Customer } from '../../../../types/customer';
import MeasurementTable from '../../../../components/admin/customers/measurements/MeasurementTable';
import MeasurementCard from '../../../../components/admin/customers/measurements/MeasurementCard';
import MeasurementViewDialog from '../../../../components/admin/customers/measurements/MeasurementViewDialog';
import DeleteMeasurementDialog from '../../../../components/admin/customers/measurements/DeleteMeasurementDialog';

export default function MeasurementsList() {
  const { customerId } = useParams<{ customerId: string }>();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [filteredMeasurements, setFilteredMeasurements] = useState<Measurement[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [viewMeasurement, setViewMeasurement] = useState<Measurement | null>(null);
  const [deleteMeasurement, setDeleteMeasurement] = useState<Measurement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!customerId) return;
      try {
        const [customerData, measurementsData] = await Promise.all([
          customerService.getCustomer(customerId),
          measurementService.getMeasurements(customerId)
        ]);
        setCustomer(customerData);
        setMeasurements(measurementsData);
        setFilteredMeasurements(measurementsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [customerId]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = measurements.filter(m => 
      m.measurementType.toLowerCase().includes(query) ||
      m.notes?.toLowerCase().includes(query)
    );
    setFilteredMeasurements(filtered);
  }, [searchQuery, measurements]);

  const handleDelete = async () => {
    if (!deleteMeasurement || !deleteMeasurement.id || !customerId) return;
    
    setIsDeleting(true);
    try {
      await measurementService.deleteMeasurement(customerId, deleteMeasurement.id);
      setMeasurements(measurements.filter(m => m.id !== deleteMeasurement.id));
      setDeleteMeasurement(null);
    } catch (error) {
      console.error('Error deleting measurement:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Customer not found.</p>
        <Link to="/admin/customers" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to Customers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/admin/customers" className="text-gray-500 hover:text-black transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-serif font-bold text-gray-900">Measurements</h1>
          </div>
          <p className="text-gray-500">
            Managing measurements for <span className="font-medium text-gray-900">{customer.customerName}</span> ({customer.customerId})
          </p>
        </div>
        
        <Link
          to={`/admin/customers/${customerId}/measurements/add`}
          className="inline-flex items-center justify-center gap-2 bg-black text-white px-4 py-2 text-sm font-medium rounded-sm hover:bg-gray-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Measurement
        </Link>
      </div>

      <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-200">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search measurements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-sm leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-black focus:border-black sm:text-sm"
          />
        </div>
      </div>

      <MeasurementTable 
        measurements={filteredMeasurements}
        onView={setViewMeasurement}
        onEdit={(id) => window.location.href = `/admin/customers/${customerId}/measurements/${id}/edit`}
        onDelete={setDeleteMeasurement}
      />
      
      <div className="md:hidden space-y-4">
        {filteredMeasurements.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-sm border border-gray-200">
            <p className="text-gray-500">No measurements found.</p>
          </div>
        ) : (
          filteredMeasurements.map((measurement) => (
            <MeasurementCard 
              key={measurement.id}
              measurement={measurement}
              onView={setViewMeasurement}
              onEdit={(id) => window.location.href = `/admin/customers/${customerId}/measurements/${id}/edit`}
              onDelete={setDeleteMeasurement}
            />
          ))
        )}
      </div>

      {viewMeasurement && (
        <MeasurementViewDialog 
          measurement={viewMeasurement} 
          onClose={() => setViewMeasurement(null)} 
        />
      )}

      {deleteMeasurement && (
        <DeleteMeasurementDialog
          measurement={deleteMeasurement}
          onConfirm={handleDelete}
          onCancel={() => setDeleteMeasurement(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
