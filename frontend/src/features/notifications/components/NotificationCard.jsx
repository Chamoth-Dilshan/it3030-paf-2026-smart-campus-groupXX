import { motion as Motion } from 'framer-motion';
import {
  Bell,
  BellRing,
  Calendar,
  CheckCircle2,
  Clock,
  Ticket,
  Trash2
} from 'lucide-react';

const getTypeStyle = (type) => {
  switch (type) {
    case 'BOOKING':
      return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'TICKET':
      return 'bg-amber-50 text-amber-600 border-amber-100';
    default:
      return 'bg-slate-50 text-slate-400 border-slate-100';
  }
};

const getTypeIcon = (type) => {
  switch (type) {
    case 'BOOKING':
      return <Calendar size={18} />;
    case 'TICKET':
      return <Ticket size={18} />;
    default:
      return <Bell size={18} />;
  }
};

const NotificationCard = ({ notification, index, onMarkAsRead, onDelete }) => (
  <Motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className={`glass-heavy bg-white/70 p-8 rounded-[3rem] border transition-all relative overflow-hidden group ${
      !notification.read ? 'border-indigo-100 shadow-2xl' : 'border-white opacity-60 hover:opacity-100'
    }`}
  >
    {!notification.read && (
      <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
    )}

    <div className="flex flex-col md:flex-row items-start justify-between gap-8">
      <div className="flex flex-1 gap-6">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${getTypeStyle(
            notification.type
          )}`}
        >
          {getTypeIcon(notification.type)}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className={`text-xl font-bold ${!notification.read ? 'text-slate-900' : 'text-slate-500'}`}>
              {notification.title}
            </h3>
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getTypeStyle(notification.type)}`}>
              {notification.type}
            </span>
            {!notification.read && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest animate-pulse">
                <BellRing size={10} /> New
              </span>
            )}
          </div>
          <p className="text-slate-500 font-medium leading-relaxed italic">"{notification.message}"</p>
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Clock size={12} />
              {new Date(notification.createdAt).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 self-end md:self-start">
        {!notification.read && (
          <button
            onClick={() => onMarkAsRead(notification.id)}
            className="px-6 py-2.5 bg-white border border-slate-100 hover:border-indigo-200 text-indigo-600 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-sm transition-all active:scale-95 flex items-center gap-2"
          >
            <CheckCircle2 size={14} />
            Acknowledge
          </button>
        )}
        <button
          onClick={() => onDelete(notification.id)}
          className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
          title="Purge Signal"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  </Motion.div>
);

export default NotificationCard;
