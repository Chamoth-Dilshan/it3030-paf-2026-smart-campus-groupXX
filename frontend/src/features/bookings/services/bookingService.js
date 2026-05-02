import API from '../../../services/api';
import { normalizeBookingPayload } from '../utils/bookingValidation';

const getErrorMessage = (error) => {
  const data = error.response?.data;
  if (!data) return error.message || 'Booking request failed.';
  if (typeof data === 'string') return data;
  if (data.message) return data.message;
  if (data.error) return data.error;
  if (typeof data === 'object') return Object.values(data).join(', ');
  return 'Booking request failed.';
};

const request = async (apiCall) => {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

const normalizeResourceId = (resourceId) =>
  typeof resourceId === 'string' ? resourceId.trim() : '';

const hasResourceName = (booking) =>
  Boolean(booking?.resourceName || booking?.resource?.name);

const enrichBookingsWithResourceNames = async (data) => {
  const bookings = Array.isArray(data) ? data : data ? [data] : [];
  const missingResourceIds = [
    ...new Set(
      bookings
        .filter((booking) => !hasResourceName(booking))
        .map((booking) => normalizeResourceId(booking.resourceId))
        .filter(Boolean)
    )
  ];

  if (missingResourceIds.length === 0) return data;

  const resourceNamesById = new Map();
  await Promise.all(
    missingResourceIds.map(async (resourceId) => {
      try {
        const response = await API.get(`/resources/${encodeURIComponent(resourceId)}`);
        if (response.data?.name) {
          resourceNamesById.set(resourceId, response.data.name);
        }
      } catch {
        // Leave the UI fallback in place when a resource was deleted or cannot be loaded.
      }
    })
  );

  const enrichedBookings = bookings.map((booking) => {
    const resourceName =
      booking.resourceName ||
      booking.resource?.name ||
      resourceNamesById.get(normalizeResourceId(booking.resourceId));

    return resourceName ? { ...booking, resourceName } : booking;
  });

  return Array.isArray(data) ? enrichedBookings : enrichedBookings[0] ?? data;
};

const bookingService = {
  createBooking: (bookingData) =>
    request(() => API.post('/bookings', normalizeBookingPayload(bookingData)))
      .then(enrichBookingsWithResourceNames),

  updateBooking: (id, bookingData) =>
    request(() => API.patch(`/bookings/${id}`, normalizeBookingPayload(bookingData)))
      .then(enrichBookingsWithResourceNames),

  getMyBookings: () =>
    request(() => API.get('/bookings/me'))
      .then(enrichBookingsWithResourceNames),

  getAllBookings: (filters = {}) =>
    request(() => API.get('/bookings', { params: filters }))
      .then(enrichBookingsWithResourceNames),

  getBookingById: (id) =>
    request(() => API.get(`/bookings/${id}`))
      .then(enrichBookingsWithResourceNames),

  approveBooking: (id) =>
    request(() => API.patch(`/bookings/${id}/approve`)),

  rejectBooking: (id, reason) =>
    request(() => API.patch(`/bookings/${id}/reject`, { reason })),

  cancelBooking: (id) =>
    request(() => API.patch(`/bookings/${id}/cancel`)),
};

export default bookingService;
