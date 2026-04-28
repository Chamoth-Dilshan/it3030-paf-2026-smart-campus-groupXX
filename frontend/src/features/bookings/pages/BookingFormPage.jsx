import { ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BookingForm from '../components/BookingForm';
import bookingService from '../services/bookingService';
import { normalizeTime } from '../utils/bookingValidation';

const BookingFormPage = () => {
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const initialValues = useMemo(() => {
    const state = location.state || {};
    return {
      resourceId: state.resourceId || '',
      date: state.date || state.bookingDate || state.startTime?.split('T')[0] || '',
      startTime: normalizeTime(state.startTime),
      endTime: normalizeTime(state.endTime),
      purpose: '',
      expectedAttendees: 1,
    };
  }, [location.state]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const created = await bookingService.createBooking(payload);
      setSuccess(`Booking request ${created.id} submitted for review.`);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Request a Booking</h1>
            <p className="mt-1 text-sm text-slate-500">Submit a resource booking request for admin review.</p>
          </div>
          <Link
            to="/my-bookings"
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            My Bookings
          </Link>
        </div>

        <BookingForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          submitting={submitting}
          serverError={error}
          successMessage={success}
        />
      </div>
    </div>
  );
};

export default BookingFormPage;
