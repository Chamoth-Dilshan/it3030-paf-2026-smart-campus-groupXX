import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Lock,
  MapPin,
  Package,
  Search,
  Users
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import availabilityService from '../services/availabilityService';
import resourceService from '../services/resourceService';
import ResourceBookingModal from '../components/ResourceBookingModal';

const todayString = () => {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().slice(0, 10);
};

const formatTime = (value) => {
  if (!value) return '--:--';
  if (value.includes('T')) return value.split('T')[1].slice(0, 5);
  return value.slice(0, 5);
};

const isAvailableSlot = (slot) => slot.status === 'AVAILABLE';

const AvailabilityView = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const minDate = useMemo(() => todayString(), []);

  const [resourceId, setResourceId] = useState(searchParams.get('resourceId') || '');
  const [date, setDate] = useState(minDate);
  const [resources, setResources] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [bookingRequest, setBookingRequest] = useState(null);

  const selectedResource = useMemo(
    () => resources.find((resource) => resource.id === resourceId),
    [resourceId, resources]
  );

  const availabilitySummary = useMemo(() => {
    const available = availability.filter(isAvailableSlot).length;
    return {
      available,
      booked: availability.length - available,
      total: availability.length
    };
  }, [availability]);

  const fetchResources = useCallback(async () => {
    setResourcesLoading(true);
    try {
      const data = await resourceService.getAllResources();
      setResources(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Resource inventory sync failure:', error);
      toast.error('Failed to load resource list.');
    } finally {
      setResourcesLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async (event) => {
    event?.preventDefault();

    if (!resourceId || !date) {
      toast.error('Please select a resource and date.');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const data = await availabilityService.getAvailability(resourceId, date);
      setAvailability(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching availability:', error);
      setAvailability([]);
      toast.error('Failed to load availability.');
    } finally {
      setLoading(false);
    }
  }, [date, resourceId]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  useEffect(() => {
    if (resourceId) handleSearch();
  }, [handleSearch, resourceId]);

  const handleSlotClick = (slot) => {
    if (!isAvailableSlot(slot)) {
      toast.error('This time slot is already booked.');
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedResource) {
      toast.error('Selected resource is still loading. Please try again.');
      return;
    }

    setBookingRequest({
      resource: selectedResource,
      initialValues: {
        date,
        startTime: formatTime(slot.startTime),
        endTime: formatTime(slot.endTime)
      }
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#eff6ff_0,#f8fafc_38%,#f8fafc_100%)] px-4 pb-16 pt-24 sm:px-6">
      <main className="mx-auto max-w-7xl py-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">
              Check resource availability
            </h1>
            <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-slate-600">
              Select a campus resource and date to view open booking slots.
            </p>
          </div>

          {hasSearched && availabilitySummary.total > 0 && (
            <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-slate-200 bg-white text-center shadow-sm">
              <SummaryItem label="Available" value={availabilitySummary.available} accent="text-emerald-600" />
              <SummaryItem label="Booked" value={availabilitySummary.booked} accent="text-rose-600" />
              <SummaryItem label="Total" value={availabilitySummary.total} accent="text-blue-700" />
            </div>
          )}
        </div>

        <Motion.form
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSearch}
          className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-end">
            <label className="mb-0">
              <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-normal text-slate-600">
                <Package size={15} />
                Resource
              </span>
              <div className="relative">
                <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={resourceId}
                  onChange={(event) => setResourceId(event.target.value)}
                  disabled={resourcesLoading}
                  className="!h-12 !rounded-xl !border-slate-300 !bg-white !py-0 !pl-11 !pr-10 !text-sm !font-semibold !text-slate-900 shadow-sm focus:!border-blue-500 focus:!bg-white focus:!shadow-sm disabled:!bg-slate-100 disabled:!text-slate-400"
                >
                  <option value="">{resourcesLoading ? 'Loading resources...' : 'Select a resource'}</option>
                  {resources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name} - {resource.category || 'Resource'}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label className="mb-0">
              <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-normal text-slate-600">
                <CalendarDays size={15} />
                Date
              </span>
              <input
                type="date"
                min={minDate}
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="!h-12 !rounded-xl !border-slate-300 !bg-white !py-0 !px-4 !text-sm !font-semibold !text-slate-900 shadow-sm focus:!border-blue-500 focus:!bg-white focus:!shadow-sm"
              />
            </label>

            <button
              type="submit"
              disabled={loading || resourcesLoading}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Checking
                </>
              ) : (
                <>
                  Check Availability
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </div>

          {selectedResource && (
            <div className="mt-5 grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm font-semibold text-slate-600 sm:grid-cols-3">
              <span className="inline-flex items-center gap-2">
                <MapPin size={16} className="text-blue-700" />
                {selectedResource.location || 'Location not assigned'}
              </span>
              <span className="inline-flex items-center gap-2">
                <Users size={16} className="text-emerald-700" />
                Capacity {selectedResource.capacity || 'N/A'}
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={16} className="text-slate-500" />
                {(selectedResource.status || 'UNKNOWN').replaceAll('_', ' ')}
              </span>
            </div>
          )}
        </Motion.form>

        <section className="min-h-[320px]">
          {loading ? (
            <LoadingState />
          ) : availability.length > 0 ? (
            <>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-black tracking-normal text-slate-950">Time slots</h2>
                  <p className="mt-1 text-sm font-medium text-slate-600">
                    {selectedResource?.name || 'Selected resource'} on {date}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs font-black uppercase tracking-normal">
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-emerald-700 ring-1 ring-emerald-100">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Available
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-2 text-rose-700 ring-1 ring-rose-100">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    Booked
                  </span>
                </div>
              </div>

              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
              >
                {availability.map((slot, index) => (
                  <AvailabilitySlotCard
                    key={`${slot.startTime}-${slot.endTime}-${index}`}
                    slot={slot}
                    index={index}
                    onClick={handleSlotClick}
                  />
                ))}
              </Motion.div>
            </>
          ) : hasSearched ? (
            <EmptyState
              icon={AlertCircle}
              title="No slots found"
              message="No availability entries were returned for this resource and date."
            />
          ) : (
            <EmptyState
              icon={CalendarCheck}
              title="Choose a resource"
              message="Select a resource and date, then check availability to see booking slots."
            />
          )}
        </section>
      </main>

      {bookingRequest && (
        <ResourceBookingModal
          resource={bookingRequest.resource}
          initialBookingValues={bookingRequest.initialValues}
          onClose={() => setBookingRequest(null)}
        />
      )}
    </div>
  );
};

const SummaryItem = ({ label, value, accent }) => (
  <div className="min-w-24 border-r border-slate-100 px-4 py-3 last:border-r-0">
    <p className={`text-2xl font-black leading-none ${accent}`}>{value}</p>
    <p className="mt-1 text-[10px] font-black uppercase tracking-normal text-slate-500">{label}</p>
  </div>
);

const AvailabilitySlotCard = ({ slot, index, onClick }) => {
  const available = isAvailableSlot(slot);
  const statusLabel = (slot.status || 'UNKNOWN').replaceAll('_', ' ');

  return (
    <Motion.button
      type="button"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.025 }}
      whileHover={available ? { y: -3 } : undefined}
      onClick={() => onClick(slot)}
      className={`group min-h-40 rounded-2xl border p-4 text-left shadow-sm transition ${
        available
          ? 'border-emerald-100 bg-white hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/10'
          : 'cursor-not-allowed border-slate-200 bg-slate-100/80 opacity-75'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          available ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-500'
        }`}>
          {available ? <CheckCircle2 size={21} /> : <Lock size={20} />}
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-normal ${
          available ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-slate-200 text-slate-500'
        }`}>
          {statusLabel}
        </span>
      </div>

      <div className="mt-5">
        <p className="mb-1 flex items-center gap-1.5 text-xs font-black uppercase tracking-normal text-slate-400">
          <Clock size={13} />
          Time slot
        </p>
        <h3 className={`text-2xl font-black tracking-normal ${available ? 'text-slate-950' : 'text-slate-500'}`}>
          {formatTime(slot.startTime)}
          <span className="mx-2 text-slate-300">-</span>
          {formatTime(slot.endTime)}
        </h3>
      </div>

      <div className={`mt-5 inline-flex items-center gap-2 text-sm font-bold ${
        available ? 'text-blue-700' : 'text-slate-400'
      }`}>
        {available ? 'Book this slot' : 'Already booked'}
        {available && <ArrowRight size={16} className="transition group-hover:translate-x-1" />}
      </div>
    </Motion.button>
  );
};

const LoadingState = () => (
  <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
    <div className="mb-5 h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
    <p className="text-sm font-black uppercase tracking-normal text-slate-500">Checking availability</p>
  </div>
);

const EmptyState = ({ icon, title, message }) => {
  const EmptyIcon = icon;

  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        <EmptyIcon size={28} />
      </div>
      <h3 className="text-2xl font-black tracking-normal text-slate-950">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-6 text-slate-600">{message}</p>
    </div>
  );
};

export default AvailabilityView;
