import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  Home,
  LogOut,
  UserCircle,
  Bell,
  Settings,
  Activity,
  Info,
  Hexagon,
  LayoutDashboard,
  Inbox,
  BarChart3,
  ListChecks,
  LineChart,
  ChevronDown,
  ShieldHalf,
  AlertCircle,
  ClipboardList,
  Shield,
  User,
  Menu,
  X
} from "lucide-react";
import { getUnreadCount } from "../../services/api";

const UnreadBadge = () => {
  const [count, setCount] = React.useState(0);
  const user = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  React.useEffect(() => {
    if (!user || !localStorage.getItem("token")) {
      return;
    }

    const fetchCount = async () => {
      try {
        const res = await getUnreadCount();
        setCount(res.data.unreadCount);
      } catch {
        // ignore
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  if (count === 0) return null;

  return (
    <span className="badge badge-error absolute -top-2 -right-2">
      {count > 9 ? '9+' : count}
    </span>
  );
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
    window.location.reload();
  };

  // Common navigation items
  const commonItems = [
    { path: "/", label: "Home", icon: <Home size={18} /> },
    { path: "/resources", label: "Resources", icon: <Hexagon size={18} /> },
    { path: "/availability", label: "Availability", icon: <Activity size={18} /> },
    { path: "/about", label: "About", icon: <Info size={18} /> },
  ];

  // Role-specific navigation items
  const getRoleItems = () => {
    if (!user) return [];
    switch (user.role) {
      case 'ADMIN':
        return [
          { path: '/users', label: 'Users', icon: <Shield size={18} /> },
          { path: '/admin', label: 'Resources', icon: <LayoutDashboard size={18} /> },
          { path: '/ticket-list', label: 'Incidents', icon: <AlertCircle size={18} /> },
        ];
      case 'MANAGER':
        return [
          { path: '/admin', label: 'Manager', icon: <LayoutDashboard size={18} /> },
          { path: '/admin/analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
        ];
      case 'TECHNICIAN':
        return [
          { path: '/technician', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
          { path: '/technician/tickets', label: 'Work', icon: <ClipboardList size={18} /> },
        ];
      case 'USER':
        return [
          { path: '/bookings', label: 'Book', icon: <AlertCircle size={18} /> },
          { path: '/my-bookings', label: 'My Bookings', icon: <User size={18} /> },
          { path: '/my-incidents', label: 'Incidents', icon: <AlertCircle size={18} /> },
        ];
      default:
        return [];
    }
  };

  const navItems = [...commonItems, ...getRoleItems()];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm' 
        : 'bg-white/75 backdrop-blur-md border-b border-white/40'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[72px]">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div
              className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-shadow"
            >
              <ShieldHalf size={20} className="text-white" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-lg font-bold text-slate-900 leading-none">SmartCampus</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Operations</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) => `
                  flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-all
                  ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <span className={`${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                      {React.cloneElement(item.icon, { size: 16 })}
                    </span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Notifications */}
            {user && (
              <Link
                to="/notifications"
                className="p-2.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all relative"
              >
                <Bell size={20} />
                {user && <UnreadBadge />}
              </Link>
            )}

            {/* User Menu */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
                >
                  <div className="w-7 h-7 rounded-md bg-gradient-primary flex items-center justify-center text-white text-sm font-bold">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <ChevronDown size={16} className={`text-slate-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 surface-glass rounded-lg border border-slate-200 shadow-xl z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Signed in as
                      </p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                      <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                        {user.role}
                      </p>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary btn-sm hidden sm:flex">
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden border-t border-slate-200 bg-slate-50"
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all
                    ${
                      isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-slate-600 hover:bg-slate-100'
                    }
                  `}
                >
                  {React.cloneElement(item.icon, { size: 18 })}
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
