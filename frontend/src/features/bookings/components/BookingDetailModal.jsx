import { Calendar, Clock, Hash, User, Users, X } from 'lucide-react';
import BookingStatusBadge from './BookingStatusBadge';

const formatTime = (time) => (time ? time.slice(0, 5) : '--:--');
const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : 'Not recorded');

const BookingDetailModal = ({ booking, isOpen, onClose }) => {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 p-6">
          <div>
            <BookingStatusBadge status={booking.status} />
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">{booking.purpose}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close booking details"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <Detail icon={Hash} label="Booking ID" value={booking.id} />
          <Detail icon={Hash} label="Resource ID" value={booking.resourceId} />
          <Detail icon={User} label="User ID" value={booking.userId} />
          <Detail icon={Users} label="Expected Attendees" value={booking.expectedAttendees} />
          <Detail icon={Calendar} label="Date" value={booking.date} />
          <Detail icon={Clock} label="Time" value={`${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`} />
        </div>

        {(booking.reviewReason || booking.reviewedBy) && (
          <div className="border-t border-slate-200 px-6 py-5">
            <h3 className="text-sm font-semibold text-slate-900">Review</h3>
            {booking.reviewedBy && <p className="mt-2 text-sm text-slate-600">Reviewed by: {booking.reviewedBy}</p>}
            {booking.reviewReason && <p className="mt-2 text-sm text-slate-600">Reason: {booking.reviewReason}</p>}
          </div>
        )}

        <div className="border-t border-slate-200 px-6 py-4 text-xs text-slate-500">
          Created: {formatDateTime(booking.createdAt)} | Updated: {formatDateTime(booking.updatedAt)}
        </div>
      </div>
    </div>
  );
};

const Detail = ({ icon: Icon, label, value }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
      <Icon size={15} />
      {label}
    </div>
    <p className="mt-2 break-words text-sm font-semibold text-slate-900">{value || 'Not provided'}</p>
  </div>
);

export default BookingDetailModal;
