import { Calendar, Clock, Hash, MapPin, Send, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { todayString, validateBookingForm } from '../utils/bookingValidation';
import availabilityService from '../../resources/services/availabilityService';

const SLOT_MINUTES = 60;

const defaults = {
  resourceId: '',
  date: '',
  startTime: '',
  endTime: '',
  purpose: '',
  expectedAttendees: 1,
};

const toMinutes = (value) => {
  if (!value) return null;
  const [hours, minutes] = value.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
};

const toTimeValue = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const formatSlotTime = (value) => {
  const minutes = toMinutes(value);
  if (minutes === null) return value || '';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${String(displayHour).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
};

const buildSlotOptions = (resource, selectedStartTime, selectedEndTime) => {
  const start = toMinutes(resource?.availableTimes?.start) ?? 8 * 60;
  const end = toMinutes(resource?.availableTimes?.end) ?? 18 * 60;
  const options = [];

  if (start < end) {
    let slotStart = start;
    while (slotStart < end) {
      const slotEnd = Math.min(slotStart + SLOT_MINUTES, end);
      const startValue = toTimeValue(slotStart);
      const endValue = toTimeValue(slotEnd);
      options.push({
        value: `${startValue}|${endValue}`,
        label: `${formatSlotTime(startValue)} - ${formatSlotTime(endValue)}`
      });
      slotStart = slotEnd;
    }
  }

  const selectedValue = selectedStartTime && selectedEndTime ? `${selectedStartTime}|${selectedEndTime}` : '';
  if (selectedValue && !options.some((option) => option.value === selectedValue)) {
    options.unshift({
      value: selectedValue,
      label: `${formatSlotTime(selectedStartTime)} - ${formatSlotTime(selectedEndTime)}`
    });
  }

  return options;
};

const BookingForm = ({
  initialValues = {},
  onSubmit,
  submitting,
  serverError,
  successMessage,
  selectedResource,
  submitLabel = 'Submit Booking',
  submittingLabel = 'Submitting...'
}) => {
  const [formData, setFormData] = useState({ ...defaults, ...initialValues });
  const [errors, setErrors] = useState({});
  const [bookedSlotValues, setBookedSlotValues] = useState(new Set());
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const minDate = useMemo(() => todayString(), []);
  const selectedResourceName = selectedResource?.name || 'Selected campus resource';
  const slotOptions = useMemo(
    () => buildSlotOptions(selectedResource, formData.startTime, formData.endTime)
      .map((slot) => ({ ...slot, disabled: bookedSlotValues.has(slot.value) })),
    [bookedSlotValues, formData.endTime, formData.startTime, selectedResource]
  );
  const selectedSlotValue = formData.startTime && formData.endTime ? `${formData.startTime}|${formData.endTime}` : '';
  const slotError = errors.startTime || errors.endTime;
  const inputClass = 'w-full min-h-11 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100';
  const lockedInputClass = `${inputClass} bg-slate-50 text-slate-700`;

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: null }));
  };

  const updateSlot = (value) => {
    const [startTime = '', endTime = ''] = value.split('|');
    setFormData((current) => ({ ...current, startTime, endTime }));
    setErrors((current) => ({ ...current, startTime: null, endTime: null }));
  };

  useEffect(() => {
    if (!formData.resourceId || !formData.date) {
      setBookedSlotValues(new Set());
      return;
    }

    let cancelled = false;
    setAvailabilityLoading(true);

    availabilityService.getAvailability(formData.resourceId, formData.date)
      .then((slots) => {
        if (cancelled) return;
        const bookedValues = new Set(
          (Array.isArray(slots) ? slots : [])
            .filter((slot) => slot.status !== 'AVAILABLE')
            .map((slot) => `${slot.startTime?.slice(0, 5)}|${slot.endTime?.slice(0, 5)}`)
        );
        setBookedSlotValues(bookedValues);
      })
      .catch(() => {
        if (!cancelled) setBookedSlotValues(new Set());
      })
      .finally(() => {
        if (!cancelled) setAvailabilityLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [formData.date, formData.resourceId]);

  const validate = () => {
    const nextErrors = validateBookingForm(formData, minDate);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    const created = await onSubmit?.({
      ...formData,
      expectedAttendees: Number(formData.expectedAttendees),
    });
    if (created) {
      setFormData({ ...defaults, resourceId: formData.resourceId });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Selected Resource" error={errors.resourceId} icon={Hash}>
          <input
            value={selectedResourceName}
            readOnly
            className={lockedInputClass}
            aria-readonly="true"
          />
          {selectedResource && (
            <span className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1">
                <MapPin size={13} />
                {selectedResource.location || 'Location not assigned'}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users size={13} />
                Capacity {selectedResource.capacity || 'N/A'}
              </span>
            </span>
          )}
        </Field>

        <Field label="Date" error={errors.date} icon={Calendar}>
          <input
            type="date"
            min={minDate}
            value={formData.date}
            onChange={(event) => updateField('date', event.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Booking Slot" error={slotError} icon={Clock}>
          <select
            value={selectedSlotValue}
            onChange={(event) => updateSlot(event.target.value)}
            className={`${inputClass} cursor-pointer`}
          >
            <option value="">Select a time slot</option>
            {slotOptions.map((slot) => (
              <option key={slot.value} value={slot.value} disabled={slot.disabled}>
                {slot.disabled ? `${slot.label} (Booked)` : slot.label}
              </option>
            ))}
          </select>
          {availabilityLoading && (
            <span className="mt-1 block text-xs font-semibold text-slate-500">Checking approved bookings...</span>
          )}
        </Field>

        <Field label="Expected Attendees" error={errors.expectedAttendees} icon={Users}>
          <input
            type="number"
            min="1"
            value={formData.expectedAttendees}
            onChange={(event) => updateField('expectedAttendees', event.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Purpose" error={errors.purpose} className="md:col-span-2">
          <textarea
            rows={3}
            maxLength={300}
            value={formData.purpose}
            onChange={(event) => updateField('purpose', event.target.value)}
            className={`${inputClass} resize-none`}
            placeholder="Briefly describe the purpose of this booking"
          />
        </Field>
      </div>

      {serverError && <p className="mt-5 rounded-md bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{serverError}</p>}
      {successMessage && <p className="mt-5 rounded-md bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{successMessage}</p>}

      <div className="mt-5 flex justify-end border-t border-slate-100 pt-5">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <Send size={17} />
          {submitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
};

const Field = ({ label, error, icon: Icon, className = '', children }) => (
  <label className={`block ${className}`}>
    <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
      {Icon && <Icon size={16} className="text-indigo-600" />}
      {label}
    </span>
    {children}
    {error && <span className="mt-1 block text-xs font-semibold text-rose-600">{error}</span>}
  </label>
);

export default BookingForm;
