import { Ban, Plus, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BookingDetailModal from '../components/BookingDetailModal';
import BookingList from '../components/BookingList';
import { BOOKING_STATUS, BOOKING_STATUS_FILTERS } from '../constants/bookingStatus';
import bookingService from '../services/bookingService';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      setBookings(await bookingService.getMyBookings());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    if (statusFilter === 'ALL') return bookings;
    return bookings.filter((booking) => booking.status === statusFilter);
  }, [bookings, statusFilter]);

  const handleCancel = async (booking) => {
    if (!window.confirm('Cancel this approved booking?')) return;
    setActionLoading(booking.id);
    setError('');
    try {
      await bookingService.cancelBooking(booking.id);
      setSelectedBooking(null);
      await fetchBookings();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">My Bookings</h1>
            <p className="mt-1 text-sm text-slate-500">Track your booking requests and approved reservations.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={fetchBookings}
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <Link
              to="/bookings"
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Plus size={16} />
              New Booking
            </Link>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {BOOKING_STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                statusFilter === status
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {error && <p className="mb-5 rounded-md bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}

        <BookingList
          bookings={filteredBookings}
          loading={loading}
          emptyMessage="No bookings match this view."
          onView={setSelectedBooking}
          renderActions={(booking) =>
            booking.status === BOOKING_STATUS.APPROVED ? (
              <button
                type="button"
                disabled={actionLoading === booking.id}
                onClick={() => handleCancel(booking)}
                className="inline-flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Ban size={16} />
                {actionLoading === booking.id ? 'Cancelling...' : 'Cancel'}
              </button>
            ) : null
          }
        />
      </div>

      <BookingDetailModal
        booking={selectedBooking}
        isOpen={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
      />
    </div>
  );
};

export default MyBookingsPage;
