import { CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { BOOKING_STATUS } from '../constants/bookingStatus';

const BookingReviewPanel = ({ booking, onApprove, onReject, disabled }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (booking.status !== BOOKING_STATUS.PENDING) {
    return null;
  }

  const handleReject = () => {
    if (!reason.trim()) {
      setError('Reason is required.');
      return;
    }
    setError('');
    onReject?.(booking, reason.trim());
  };

  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3">
        <textarea
          value={reason}
          onChange={(event) => {
            setReason(event.target.value);
            setError('');
          }}
          rows={3}
          maxLength={300}
          placeholder="Rejection reason"
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
        {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onApprove?.(booking)}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircle2 size={16} />
            Approve
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={handleReject}
            className="inline-flex items-center gap-2 rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <XCircle size={16} />
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingReviewPanel;
