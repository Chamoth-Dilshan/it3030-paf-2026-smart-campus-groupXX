import { Ban, CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { BOOKING_STATUS } from '../constants/bookingStatus';

const styles = {
  [BOOKING_STATUS.PENDING]: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock3,
  },
  [BOOKING_STATUS.APPROVED]: {
    label: 'Approved',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  [BOOKING_STATUS.REJECTED]: {
    label: 'Rejected',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: XCircle,
  },
  [BOOKING_STATUS.CANCELLED]: {
    label: 'Cancelled',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: Ban,
  },
};

const BookingStatusBadge = ({ status }) => {
  const config = styles[status] || styles[BOOKING_STATUS.PENDING];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${config.className}`}>
      <Icon size={14} />
      {config.label}
    </span>
  );
};

export default BookingStatusBadge;
