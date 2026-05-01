import { Activity, Building2, ChevronRight, MapPin, Users } from 'lucide-react';

const isAvailableStatus = (status) => status === 'ACTIVE' || status === 'AVAILABLE';

const ResourceCard = ({ resource, onView }) => {
  const available = isAvailableStatus(resource.status);

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-52 overflow-hidden bg-slate-100">
        {resource.imageUrl ? (
          <img
            src={resource.imageUrl}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            alt={resource.name}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <Building2 size={48} />
          </div>
        )}
        <span
          className={`absolute left-4 top-4 rounded-lg px-3 py-1.5 text-xs font-black uppercase tracking-normal text-white shadow-sm ${
            available ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {resource.status || 'Unknown'}
        </span>
      </div>

      <div className="flex min-h-[270px] flex-col p-6">
        <h4 className="text-2xl font-black leading-tight tracking-normal text-slate-950">{resource.name}</h4>

        <div className="mt-5 grid gap-3 text-sm font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin size={17} className="text-blue-700" />
            <span>{resource.location || 'Campus North Wing'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={17} className="text-emerald-700" />
            <span>Capacity: {resource.capacity || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity size={17} className="text-amber-700" />
            <span>{resource.type || 'Room'}</span>
          </div>
        </div>

        <p className="mt-5 line-clamp-2 text-sm font-medium leading-6 text-slate-600">
          {resource.description || 'Academic facility available for scheduled campus operations.'}
        </p>

        <button
          type="button"
          onClick={() => onView(resource)}
          className="btn-primary mt-auto min-h-11 w-full rounded-xl text-sm font-bold"
        >
          View details
          <ChevronRight size={17} />
        </button>
      </div>
    </article>
  );
};

export default ResourceCard;
