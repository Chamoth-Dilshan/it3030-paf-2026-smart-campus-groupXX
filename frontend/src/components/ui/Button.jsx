const variants = {
  primary: 'bg-slate-900 text-white hover:bg-indigo-600 shadow-xl',
  secondary: 'bg-white text-slate-900 border border-slate-200 hover:border-indigo-200 shadow-sm',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-xl'
};

const Button = ({
  children,
  className = '',
  type = 'button',
  variant = 'primary',
  ...props
}) => (
  <button
    type={type}
    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant] || variants.primary} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;
