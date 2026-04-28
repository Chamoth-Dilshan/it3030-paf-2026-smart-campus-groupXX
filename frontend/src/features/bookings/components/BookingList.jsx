import BookingCard from './BookingCard';

const BookingList = ({
  bookings,
  loading,
  emptyMessage = 'No bookings found.',
  onView,
  renderActions,
}) => {
  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-500">
        Loading bookings...
      </div>
    );
  }

  if (!bookings.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm font-medium text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} onView={onView}>
          {renderActions?.(booking)}
        </BookingCard>
      ))}
    </div>
  );
};

export default BookingList;
