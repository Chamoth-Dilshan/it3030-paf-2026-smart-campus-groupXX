import { Calendar, Clock, Hash, Send, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { todayString, validateBookingForm } from '../utils/bookingValidation';

const defaults = {
  resourceId: '',
  date: '',
  startTime: '',
  endTime: '',
  purpose: '',
  expectedAttendees: 1,
};

const BookingForm = ({ initialValues = {}, onSubmit, submitting, serverError, successMessage }) => {
  const [formData, setFormData] = useState({ ...defaults, ...initialValues });
  const [errors, setErrors] = useState({});
  const minDate = useMemo(() => todayString(), []);
  const inputClass = 'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100';

  useEffect(() => {
    setFormData({ ...defaults, ...initialValues });
  }, [initialValues]);

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: null }));
  };

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
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Resource ID" error={errors.resourceId} icon={Hash}>
          <input
            value={formData.resourceId}
            onChange={(event) => updateField('resourceId', event.target.value)}
            className={inputClass}
            placeholder="RES-101"
          />
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

        <Field label="Start Time" error={errors.startTime} icon={Clock}>
          <input
            type="time"
            value={formData.startTime}
            onChange={(event) => updateField('startTime', event.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="End Time" error={errors.endTime} icon={Clock}>
          <input
            type="time"
            value={formData.endTime}
            onChange={(event) => updateField('endTime', event.target.value)}
            className={inputClass}
          />
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
            rows={4}
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

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send size={17} />
          {submitting ? 'Submitting...' : 'Submit Booking'}
        </button>
      </div>
    </form>
  );
};

const Field = ({ label, error, icon: Icon, className = '', children }) => (
  <label className={`block ${className}`}>
    <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
      {Icon && <Icon size={16} className="text-indigo-600" />}
      {label}
    </span>
    {children}
    {error && <span className="mt-1 block text-xs font-semibold text-rose-600">{error}</span>}
  </label>
);

export default BookingForm;
