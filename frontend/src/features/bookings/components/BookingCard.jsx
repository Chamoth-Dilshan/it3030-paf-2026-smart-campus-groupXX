import { Calendar, Clock, Eye, Hash, Users } from 'lucide-react';
import BookingStatusBadge from './BookingStatusBadge';

const formatTime = (time) => (time ? time.slice(0, 5) : '--:--');

const BookingCard = ({ booking, onView, children }) => (
  <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <BookingStatusBadge status={booking.status} />
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
            <Hash size={13} />
            {booking.id}
          </span>
        </div>

        <div>
          <h3 className="truncate text-lg font-semibold text-slate-900">{booking.purpose}</h3>
          <p className="mt-1 text-sm text-slate-500">Resource ID: {booking.resourceId}</p>
        </div>

        <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
          <span className="inline-flex items-center gap-2">
            <Calendar size={16} className="text-indigo-600" />
            {booking.date}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock size={16} className="text-indigo-600" />
            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
          </span>
          <span className="inline-flex items-center gap-2">
            <Users size={16} className="text-indigo-600" />
            {booking.expectedAttendees} attendees
          </span>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onView?.(booking)}
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Eye size={16} />
          View
        </button>
      </div>
    </div>
    {children && <div className="mt-4">{children}</div>}
  </article>
);

export default BookingCard;
