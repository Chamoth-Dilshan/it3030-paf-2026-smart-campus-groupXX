import React from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Bell,
  Briefcase,
  CalendarCheck,
  ChevronDown,
  ClipboardList,
  Hexagon,
  Home,
  Info,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Shield,
  ShieldHalf,
  User,
  X,
} from "lucide-react";
import { getUnreadCount } from "../../services/api";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

const UnreadBadge = () => {
  const [count, setCount] = React.useState(0);
  const user = React.useMemo(() => getStoredUser(), []);

  React.useEffect(() => {
    if (!user || !localStorage.getItem("token")) {
      return;
    }

    const fetchCount = async () => {
      try {
        const res = await getUnreadCount();
        setCount(res.data.unreadCount);
      } catch {
        // Notification count should not block navigation.
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  if (count === 0) return null;

  return (
    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-white bg-rose-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm">
      {count > 9 ? "9+" : count}
    </span>
  );
};

const publicItems = [
  { path: "/", label: "Home", icon: <Home size={18} />, exact: true },
  { path: "/resources", label: "Resources", icon: <Hexagon size={18} /> },
  { path: "/availability", label: "Availability", icon: <Activity size={18} /> },
  { path: "/about", label: "About", icon: <Info size={18} /> },
];

const getWorkspaceItems = (role) => {
  switch (role) {
    case "ADMIN":
      return [
        { path: "/users", label: "User Management", icon: <Shield size={18} /> },
        { path: "/admin/resources", label: "Manage Resources", icon: <LayoutDashboard size={18} /> },
        { path: "/admin/bookings", label: "Booking Approvals", icon: <CalendarCheck size={18} /> },
        { path: "/admin/analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
        { path: "/ticket-list", label: "Incidents", icon: <AlertCircle size={18} /> },
      ];
    case "MANAGER":
      return [
        { path: "/admin", label: "Manager Dashboard", icon: <LayoutDashboard size={18} />, exact: true },
        { path: "/admin/analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
      ];
    case "TECHNICIAN":
      return [
        { path: "/technician", label: "Technician Dashboard", icon: <LayoutDashboard size={18} /> },
        { path: "/technician/tickets", label: "Assigned Work", icon: <ClipboardList size={18} /> },
      ];
    case "USER":
      return [
        { path: "/bookings", label: "Book Resource", icon: <CalendarCheck size={18} /> },
        { path: "/my-bookings", label: "My Bookings", icon: <User size={18} /> },
        { path: "/my-incidents", label: "My Incidents", icon: <AlertCircle size={18} /> },
        { path: "/create", label: "Report Incident", icon: <PlusCircle size={18} /> },
      ];
    default:
      return [];
  }
};

const isActivePath = (pathname, item) => {
  if (item.exact) return pathname === item.path;
  return pathname === item.path || pathname.startsWith(`${item.path}/`);
};

const NavItem = ({ item, onClick }) => (
  <NavLink
    to={item.path}
    end={item.exact}
    onClick={onClick}
    className={({ isActive }) => `
      flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-all
      ${
        isActive
          ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100"
          : "text-slate-600 hover:bg-white/70 hover:text-slate-950"
      }
    `}
  >
    {({ isActive }) => (
      <>
        <span className={isActive ? "text-blue-600" : "text-slate-500"}>
          {React.cloneElement(item.icon, { size: 16, strokeWidth: 2.2 })}
        </span>
        <span>{item.label}</span>
      </>
    )}
  </NavLink>
);

const MobileSection = ({ title, items, onNavigate }) => {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {title}
      </p>
      <div className="space-y-1">
        {items.map((item) => (
          <NavItem key={item.path} item={item} onClick={onNavigate} />
        ))}
      </div>
    </div>
  );
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef(null);
  const workspaceRef = React.useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const user = getStoredUser();
  const workspaceItems = getWorkspaceItems(user?.role);
  const hasWorkspace = workspaceItems.length > 0;
  const isWorkspaceActive = workspaceItems.some((item) => isActivePath(location.pathname, item));
  const isLoginPage = location.pathname === "/login";

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (workspaceRef.current && !workspaceRef.current.contains(event.target)) {
        setIsWorkspaceOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMenus = () => {
    setIsWorkspaceOpen(false);
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-[100] transition-all duration-300 ${
        isScrolled
          ? "border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-xl"
          : "border-b border-white/50 bg-white/70 backdrop-blur-lg"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" onClick={closeMenus} className="group flex shrink-0 items-center gap-3">
            <div className="gradient-primary flex h-10 w-10 items-center justify-center rounded-lg text-white shadow-md transition-shadow group-hover:shadow-lg">
              <ShieldHalf size={20} className="text-white" />
            </div>
            <div className="hidden flex-col sm:flex">
              <span className="text-lg font-bold leading-none text-slate-900">SmartCampus</span>
              <span className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Operations
              </span>
            </div>
          </Link>

          <div className="hidden items-center rounded-xl border border-white/60 bg-white/45 p-1 shadow-sm backdrop-blur lg:flex">
            {publicItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}

            {hasWorkspace && (
              <div className="relative ml-1 border-l border-slate-200 pl-1" ref={workspaceRef}>
                <button
                  type="button"
                  onClick={() => setIsWorkspaceOpen((open) => !open)}
                  className={`flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-all ${
                    isWorkspaceActive || isWorkspaceOpen
                      ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100"
                      : "text-slate-600 hover:bg-white/70 hover:text-slate-950"
                  }`}
                  aria-expanded={isWorkspaceOpen}
                  aria-haspopup="menu"
                >
                  <Briefcase
                    size={16}
                    strokeWidth={2.2}
                    className={isWorkspaceActive || isWorkspaceOpen ? "text-blue-600" : "text-slate-500"}
                  />
                  <span>Workspace</span>
                  <ChevronDown
                    size={15}
                    className={`transition-transform ${isWorkspaceOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isWorkspaceOpen && (
                  <div className="surface-glass absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-white/70 shadow-xl">
                    <div className="border-b border-slate-200/70 bg-white/60 px-4 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        {user.role} Workspace
                      </p>
                    </div>
                    <div className="p-2">
                      {workspaceItems.map((item) => (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          end={item.exact}
                          onClick={closeMenus}
                          className={({ isActive }) => `
                            flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all
                            ${
                              isActive || isActivePath(location.pathname, item)
                                ? "bg-blue-50 text-blue-700"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                            }
                          `}
                        >
                          <span className="text-slate-500">
                            {React.cloneElement(item.icon, { size: 17, strokeWidth: 2.2 })}
                          </span>
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <Link
                to="/notifications"
                onClick={closeMenus}
                className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-all hover:bg-blue-50 hover:text-blue-600"
                aria-label="Notifications"
              >
                <Bell size={20} strokeWidth={2.1} />
                <UnreadBadge />
              </Link>
            )}

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((open) => !open)}
                  className="flex h-10 items-center gap-2 rounded-lg border border-white/70 bg-white/45 px-2.5 text-slate-700 shadow-sm transition-all hover:border-slate-200 hover:bg-white/80"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="menu"
                >
                  <div className="gradient-primary flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold text-white">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="hidden max-w-24 truncate text-sm font-semibold lg:block">
                    {user.name || user.role}
                  </span>
                  <ChevronDown
                    size={15}
                    className={`text-slate-500 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isUserMenuOpen && (
                  <div className="surface-glass absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-white/70 shadow-xl">
                    <div className="border-b border-slate-200/70 bg-white/60 px-4 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Signed in as
                      </p>
                      <p className="mt-1 truncate text-sm font-bold text-slate-900">{user.email}</p>
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-blue-700">
                        {user.role}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : !isLoginPage ? (
              <Link to="/login" onClick={closeMenus} className="btn-primary btn-sm hidden sm:flex">
                Sign In
              </Link>
            ) : null}

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-all hover:bg-slate-100 lg:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="space-y-5 border-t border-slate-200/70 bg-white/85 px-2 py-4 backdrop-blur-xl">
              <MobileSection title="Browse" items={publicItems} onNavigate={closeMenus} />
              <MobileSection title="Workspace" items={workspaceItems} onNavigate={closeMenus} />

              {!user && !isLoginPage && (
                <Link
                  to="/login"
                  onClick={closeMenus}
                  className="btn-primary btn-sm flex w-full justify-center"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
