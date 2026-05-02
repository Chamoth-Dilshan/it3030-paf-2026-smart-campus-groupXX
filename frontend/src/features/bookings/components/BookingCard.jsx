import { Building2, Calendar, Clock, Eye, Users } from 'lucide-react';
import BookingStatusBadge from './BookingStatusBadge';

const formatTime = (time) => (time ? time.slice(0, 5) : '--:--');

const getResourceName = (booking) =>
  booking.resourceName || booking.resource?.name || 'Resource name unavailable';

const BookingCard = ({ booking, onView, children }) => {
  const resourceName = getResourceName(booking);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <BookingStatusBadge status={booking.status} />
            <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 sm:max-w-xs">
              <Building2 size={13} className="shrink-0" />
              <span className="truncate">{resourceName}</span>
            </span>
          </div>

          <div>
            <h3 className="truncate text-lg font-semibold text-slate-900">{booking.purpose}</h3>
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
};

export default BookingCard;
