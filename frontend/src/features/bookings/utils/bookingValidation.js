export const todayString = () => {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().slice(0, 10);
};

export const normalizeTime = (value) => {
  if (!value) return '';
  if (value.includes('T')) return value.split('T')[1].slice(0, 5);
  return value.slice(0, 5);
};

export const normalizeBookingPayload = (bookingData) => ({
  resourceId: bookingData.resourceId?.trim(),
  date: bookingData.date || bookingData.bookingDate || bookingData.startTime?.split('T')[0],
  startTime: normalizeTime(bookingData.startTime),
  endTime: normalizeTime(bookingData.endTime),
  purpose: bookingData.purpose?.trim(),
  expectedAttendees: Number(bookingData.expectedAttendees ?? bookingData.attendees),
});

export const validateBookingForm = (formData, minDate = todayString()) => {
  const errors = {};

  if (!formData.resourceId.trim()) errors.resourceId = 'Resource ID is required.';
  if (!formData.date) errors.date = 'Date is required.';
  if (formData.date && formData.date < minDate) errors.date = 'Date cannot be in the past.';
  if (!formData.startTime) errors.startTime = 'Start time is required.';
  if (!formData.endTime) errors.endTime = 'End time is required.';
  if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
    errors.endTime = 'End time must be after start time.';
  }
  if (!formData.purpose.trim()) errors.purpose = 'Purpose is required.';
  if (Number(formData.expectedAttendees) < 1) {
    errors.expectedAttendees = 'At least one attendee is required.';
  }

  return errors;
};
