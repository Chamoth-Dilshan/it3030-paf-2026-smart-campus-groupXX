import { motion as Motion } from 'framer-motion';
import { Activity, AlertCircle, ArrowLeft, Building2, MapPin, ShieldCheck, Users } from 'lucide-react';

const isAvailableStatus = (status) => status === 'ACTIVE' || status === 'AVAILABLE';

const ResourceDetailsModal = ({ resource, onClose, onCheckAvailability, onBook }) => {
  const isUnavailable = resource.status === 'OUT_OF_SERVICE';

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md"
    >
      <Motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-white/40 flex items-center justify-center text-slate-900 z-10 hover:bg-white transition-all shadow-lg"
        >
          <ArrowLeft className="rotate-90 md:rotate-0" size={18} />
        </button>

        <div className="md:w-1/2 h-[280px] md:h-auto bg-slate-100">
          {resource.imageUrl ? (
            <img src={resource.imageUrl} className="w-full h-full object-cover" alt={resource.name} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <Building2 size={56} />
            </div>
          )}
        </div>

        <div className="md:w-1/2 p-6 md:p-8 overflow-y-auto max-h-[90vh]">
          <div className="flex items-center gap-3 mb-5">
            <span className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black tracking-widest uppercase rounded-full border border-indigo-100">
              {resource.category}
            </span>
            <span
              className={`px-3 py-1.5 text-white text-[10px] font-black tracking-widest uppercase rounded-full shadow-sm ${
                isAvailableStatus(resource.status) ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            >
              {resource.status}
            </span>
          </div>

          <h2 className="text-3xl font-black tracking-normal text-slate-900 mb-5">{resource.name}</h2>

          <div className="grid md:grid-cols-2 gap-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                <p className="text-sm font-bold text-slate-900">{resource.location || 'Campus North Wing'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Users size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Capacity</p>
                <p className="text-sm font-bold text-slate-900">{resource.capacity} Persons</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Activity size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Type</p>
                <p className="text-sm font-bold text-slate-900 uppercase tracking-widest">{resource.type || 'Official Venue'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Asset Custodian</p>
                <p className="text-sm font-bold text-slate-900">{resource.managerName || 'Institutional Office'}</p>
              </div>
            </div>
          </div>

          <p className="text-base text-slate-500 font-medium leading-7 mb-6">
            {resource.description ||
              'A premier institutional asset designed for multifaceted academic operations and high-end collaborative engagements.'}
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={onCheckAvailability}
              className="flex-1 min-w-[180px] h-12 bg-white border-2 border-slate-900 text-slate-900 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              Check Availability
            </button>
            <button
              onClick={onBook}
              className={`flex-1 min-w-[180px] h-12 font-black text-[11px] uppercase tracking-widest rounded-xl transition-all shadow-lg ${
                isUnavailable
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200'
                  : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-indigo-500/20 active:scale-95'
              }`}
              disabled={isUnavailable}
            >
              {isUnavailable ? 'Resource Unavailable' : 'Book Now'}
            </button>
          </div>
          {isUnavailable && (
            <p className="mt-4 text-center text-rose-500 font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2">
              <AlertCircle size={12} /> Institutional Notice: Resource is currently unavailable for synchronization.
            </p>
          )}
        </div>
      </Motion.div>
    </Motion.div>
  );
};

export default ResourceDetailsModal;
