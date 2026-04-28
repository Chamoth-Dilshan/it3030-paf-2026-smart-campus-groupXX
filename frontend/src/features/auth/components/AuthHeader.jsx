const AuthHeader = ({ title, subtitle }) => (
  <div className="space-y-3 text-center">
    <h1 className="text-4xl font-bold text-slate-900">{title}</h1>
    {subtitle && (
      <p className="text-sm font-medium text-slate-500">{subtitle}</p>
    )}
  </div>
);

export default AuthHeader;
