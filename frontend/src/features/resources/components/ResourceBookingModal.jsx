import { useEffect, useMemo, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { CalendarCheck, CheckCircle2, Clock, MapPin, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BookingForm from '../../bookings/components/BookingForm';
import bookingService from '../../bookings/services/bookingService';

const ResourceBookingModal = ({ resource, onClose, initialBookingValues = {} }) => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdBooking, setCreatedBooking] = useState(null);
  const initialDate = initialBookingValues.date || initialBookingValues.bookingDate || '';
  const initialStartTime = initialBookingValues.startTime || '';
  const initialEndTime = initialBookingValues.endTime || '';
  const initialPurpose = initialBookingValues.purpose || '';
  const initialExpectedAttendees = initialBookingValues.expectedAttendees || 1;

  const initialValues = useMemo(() => ({
    resourceId: resource?.id || '',
    date: initialDate,
    startTime: initialStartTime,
    endTime: initialEndTime,
    purpose: initialPurpose,
    expectedAttendees: initialExpectedAttendees,
  }), [
    initialDate,
    initialEndTime,
    initialExpectedAttendees,
    initialPurpose,
    initialStartTime,
    resource?.id
  ]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!resource) return null;

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError('');
    setCreatedBooking(null);

    try {
      const created = await bookingService.createBooking(payload);
      setCreatedBooking(created);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropMouseDown = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  const openMyBookings = () => {
    onClose();
    navigate('/my-bookings');
  };

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="presentation"
      onMouseDown={handleBackdropMouseDown}
      className="fixed inset-0 z-[220] flex items-center justify-center overflow-y-auto bg-slate-950/65 p-4 backdrop-blur-md sm:p-6"
    >
      <Motion.section
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 28, scale: 0.96 }}
        transition={{ duration: 0.18 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="resource-booking-modal-title"
        className="my-8 w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-2xl"
      >
        <div className="relative overflow-hidden bg-slate-950 px-6 py-7 text-white sm:px-8">
          {resource.imageUrl && (
            <img
              src={resource.imageUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover opacity-20"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/95 via-slate-950/90 to-blue-700/70" />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking modal"
            className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
          >
            <X size={18} />
          </button>

          <div className="relative z-10 max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-normal text-blue-100">
              <CalendarCheck size={15} />
              Book Resource
            </div>
            <h2 id="resource-booking-modal-title" className="text-3xl font-black leading-tight tracking-normal sm:text-4xl">
              {resource.name}
            </h2>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-slate-100">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                <MapPin size={15} />
                {resource.location || 'Location not assigned'}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                <Users size={15} />
                Capacity {resource.capacity || 'N/A'}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                <Clock size={15} />
                {(resource.status || 'UNKNOWN').replaceAll('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto bg-slate-50 p-4 sm:p-6">
          {createdBooking ? (
            <div className="rounded-2xl border border-emerald-100 bg-white p-6 text-center shadow-sm sm:p-8">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={34} />
              </div>
              <h3 className="text-2xl font-black tracking-normal text-slate-950">Booking request submitted</h3>
              <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-6 text-slate-600">
                Your request for {resource.name} has been sent for review.
                {createdBooking.id ? ` Reference: ${createdBooking.id}.` : ''}
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={openMyBookings}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
                >
                  View My Bookings
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <BookingForm
              key={`${resource.id}-${initialValues.date}-${initialValues.startTime}-${initialValues.endTime}`}
              initialValues={initialValues}
              onSubmit={handleSubmit}
              submitting={submitting}
              serverError={error}
              successMessage=""
              selectedResource={resource}
            />
          )}
        </div>
      </Motion.section>
    </Motion.div>
  );
};

export default ResourceBookingModal;
