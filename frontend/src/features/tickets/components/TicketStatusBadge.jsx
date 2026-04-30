const statusClasses = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-100',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-100',
  Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-100'
};

const TicketStatusBadge = ({ status = 'Pending' }) => (
  <span
    className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${statusClasses[status] || statusClasses.Pending}`}
  >
    {status}
  </span>
);

export default TicketStatusBadge;
