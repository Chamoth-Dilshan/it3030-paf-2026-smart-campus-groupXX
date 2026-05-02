import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, X } from 'lucide-react';
import BookingForm from './BookingForm';
import bookingService from '../services/bookingService';
import resourceService from '../../resources/services/resourceService';

const fallbackResource = (booking) => ({
  id: booking?.resourceId || '',
  name: booking?.resourceId ? `Resource ${booking.resourceId}` : 'Selected campus resource',
  availableTimes: { start: '08:00', end: '18:00' },
});

const BookingEditModal = ({ booking, isOpen, onClose, onSaved }) => {
  const [resource, setResource] = useState(null);
  const [resourceWarning, setResourceWarning] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (!isOpen || !booking) return;

    let cancelled = false;
    setResource(fallbackResource(booking));
    setResourceWarning('');
    setServerError('');

    resourceService.getResourceById(booking.resourceId)
      .then((data) => {
        if (!cancelled) setResource(data || fallbackResource(booking));
      })
      .catch(() => {
        if (!cancelled) setResourceWarning('Resource details could not be loaded. Default slot hours are shown.');
      });

    return () => {
      cancelled = true;
    };
  }, [booking, isOpen]);

  const initialValues = useMemo(() => ({
    resourceId: booking?.resourceId || '',
    date: booking?.date || '',
    startTime: booking?.startTime?.slice(0, 5) || '',
    endTime: booking?.endTime?.slice(0, 5) || '',
    purpose: booking?.purpose || '',
    expectedAttendees: booking?.expectedAttendees || 1,
  }), [booking]);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setServerError('');

    try {
      const updated = await bookingService.updateBooking(booking.id, payload);
      onSaved?.(updated);
      return true;
    } catch (error) {
      setServerError(error.message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropMouseDown = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div
      role="presentation"
      onMouseDown={handleBackdropMouseDown}
      className="fixed inset-0 z-[230] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-booking-title"
        className="my-8 w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-normal text-indigo-700 ring-1 ring-indigo-100">
              <CalendarClock size={15} />
              Edit Pending Booking
            </div>
            <h2 id="edit-booking-title" className="text-2xl font-black tracking-normal text-slate-950">
              Update booking request
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Changes are allowed only while the booking is pending.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close edit booking modal"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-4 sm:p-6">
          {resourceWarning && (
            <p className="mb-4 rounded-md bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
              {resourceWarning}
            </p>
          )}
          <BookingForm
            key={`${booking.id}-${initialValues.date}-${initialValues.startTime}-${initialValues.endTime}`}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            submitting={submitting}
            serverError={serverError}
            successMessage=""
            selectedResource={resource || fallbackResource(booking)}
            submitLabel="Update Booking"
            submittingLabel="Updating..."
          />
        </div>
      </section>
    </div>
  );
};

export default BookingEditModal;
