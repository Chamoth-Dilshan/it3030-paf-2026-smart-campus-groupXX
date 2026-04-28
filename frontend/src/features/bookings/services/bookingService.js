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

const bookingService = {
  createBooking: (bookingData) =>
    request(() => API.post('/bookings', normalizeBookingPayload(bookingData))),

  getMyBookings: () =>
    request(() => API.get('/bookings/me')),

  getAllBookings: (filters = {}) =>
    request(() => API.get('/bookings', { params: filters })),

  getBookingById: (id) =>
    request(() => API.get(`/bookings/${id}`)),

  approveBooking: (id) =>
    request(() => API.patch(`/bookings/${id}/approve`)),

  rejectBooking: (id, reason) =>
    request(() => API.patch(`/bookings/${id}/reject`, { reason })),

  cancelBooking: (id) =>
    request(() => API.patch(`/bookings/${id}/cancel`)),
};

export default bookingService;
