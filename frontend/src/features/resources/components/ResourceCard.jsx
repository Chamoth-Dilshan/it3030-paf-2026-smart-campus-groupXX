import { motion as Motion } from 'framer-motion';
import { Activity, Building2, ChevronRight, MapPin, Users } from 'lucide-react';

const isAvailableStatus = (status) => status === 'ACTIVE' || status === 'AVAILABLE';

const ResourceCard = ({ resource, variants, onView }) => (
  <Motion.div
    variants={variants}
    whileHover={{ y: -10 }}
    className="group surface-glass rounded-[3rem] border border-white/20 overflow-hidden flex flex-col shadow-xl hover:shadow-blue-500/10 transition-all"
  >
    <div className="h-64 relative overflow-hidden bg-slate-200">
      {resource.imageUrl ? (
        <img
          src={resource.imageUrl}
          className="w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-110"
          alt={resource.name}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-400">
          <Building2 size={48} />
        </div>
      )}
      <div className="absolute top-6 left-6">
        <span
          className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/40 shadow-lg ${
            isAvailableStatus(resource.status) ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'
          }`}
        >
          {resource.status}
        </span>
      </div>
    </div>

    <div className="p-10 flex-1 flex flex-col">
      <div className="flex flex-col mb-6">
        <h4 className="text-2xl font-bold text-slate-900 mb-4">{resource.name}</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <MapPin size={12} className="text-blue-500" />
            {resource.location || 'North Wing'}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <Users size={12} className="text-sky-500" />
            Capacity: {resource.capacity}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <Activity size={12} className="text-rose-500" />
            {resource.type || 'Room'}
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10 line-clamp-2">
        {resource.description || 'High-specification academic facility designed for elite performance and research.'}
      </p>

      <div className="mt-auto text-center">
        <button
          onClick={() => onView(resource)}
          className="w-full inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95"
        >
          View Brief <ChevronRight size={12} />
        </button>
      </div>
    </div>
  </Motion.div>
);

export default ResourceCard;
