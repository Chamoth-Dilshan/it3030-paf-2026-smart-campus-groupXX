import { Activity, Building2, CalendarCheck, Eye, MapPin, Settings, Trash2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const isAvailableStatus = (status) => status === 'ACTIVE' || status === 'AVAILABLE';

const formatStatus = (status) => (status || 'UNKNOWN').replaceAll('_', ' ');

const ResourceCard = ({
  resource,
  onView,
  onBook,
  isAdmin = false,
  onDelete,
  onToggleStatus
}) => {
  const available = isAvailableStatus(resource.status);
  const outOfService = resource.status === 'OUT_OF_SERVICE';

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-36 overflow-hidden bg-slate-100">
        {resource.imageUrl ? (
          <img
            src={resource.imageUrl}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            alt={`${resource.name} campus resource`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <Building2 size={48} />
          </div>
        )}
        <span
          className={`absolute left-3 top-3 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-normal shadow-sm ring-1 ring-inset ${
            available
              ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
              : 'bg-amber-50 text-amber-700 ring-amber-200'
          }`}
        >
          {formatStatus(resource.status)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-normal text-blue-700">
            {resource.category || 'Uncategorized'}
          </span>
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-normal text-slate-600">
            {resource.type || 'Resource'}
          </span>
        </div>

        <h4 className="line-clamp-1 text-lg font-black leading-tight tracking-normal text-slate-950">{resource.name}</h4>

        <div className="mt-3 grid gap-2 text-xs font-semibold text-slate-600">
          <div className="flex items-start gap-2">
            <MapPin size={15} className="mt-0.5 shrink-0 text-blue-700" />
            <span className="line-clamp-1 min-w-0">{resource.location || 'Location not assigned'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={15} className="shrink-0 text-emerald-700" />
            <span>Capacity: {resource.capacity || 'N/A'}</span>
          </div>
        </div>

        <div className="mt-auto pt-4">
          <div className="grid gap-2">
            <button
              type="button"
              onClick={() => onView(resource)}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <Eye size={16} />
              View Details
            </button>
            <Link
              to={`/availability?resourceId=${resource.id}`}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <Activity size={16} />
              Check Availability
            </Link>
          </div>

          {outOfService ? (
            <div className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 text-center text-sm font-black text-slate-500 ring-1 ring-inset ring-slate-200">
              <CalendarCheck size={16} />
              Unavailable for booking
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onBook?.(resource)}
              className="btn-primary mt-2 min-h-10 w-full rounded-xl text-sm font-bold"
            >
              <CalendarCheck size={16} />
              Book Resource
            </button>
          )}

          {isAdmin && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="mb-3 text-[10px] font-black uppercase tracking-normal text-slate-400">Admin controls</p>
              <div className="grid gap-2 sm:grid-cols-3">
                <Link
                  to={`/admin/resources/edit/${resource.id}`}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 text-xs font-black uppercase tracking-normal text-slate-700 transition hover:bg-slate-200"
                >
                  <Settings size={14} />
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => onToggleStatus?.(resource)}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 text-xs font-black uppercase tracking-normal text-blue-700 transition hover:bg-blue-100"
                >
                  <Activity size={14} />
                  Status
                </button>
                <button
                  type="button"
                  onClick={() => onDelete?.(resource)}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-rose-50 px-3 text-xs font-black uppercase tracking-normal text-rose-600 transition hover:bg-rose-100"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default ResourceCard;
