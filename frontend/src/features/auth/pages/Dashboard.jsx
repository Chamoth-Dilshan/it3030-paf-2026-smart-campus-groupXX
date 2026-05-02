import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Users, 
  ShieldCheck, 
  UserCircle, 
  Settings, 
  Zap, 
  Target, 
  ArrowRight,
  Hexagon,
  Inbox
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    const stats = [
        { label: 'Active Alerts', value: '3', icon: <Bell size={20} />, color: 'text-blue-600', bg: 'bg-blue-50', path: '/notifications' },
        { label: 'System Clearance', value: user?.role, icon: <ShieldCheck size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50', path: '#' },
        { label: 'Allocations', value: '12', icon: <Inbox size={20} />, color: 'text-amber-600', bg: 'bg-amber-50', path: '/my-bookings' },
    ];

    return (
        <div className="bg-slate-50 min-h-screen pt-24 pb-16 px-4 sm:px-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-slate-50/20 backdrop-blur-[1px] pointer-events-none" />
            
            {/* Vibrant Colorful Background Overlay */}
            <div 
              className="absolute inset-0 z-0 opacity-[0.12] pointer-events-none"
              style={{ 
                backgroundImage: 'url("/backgrounds/colorful-campus.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
              }}
            />
            <div className="grain-overlay" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Welcome Section */}
                <div className="mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 mb-4"
                    >
                        <div className="p-2 bg-blue-600/10 rounded-lg text-blue-600">
                            <Zap size={16} />
                        </div>
                        <span className="text-blue-600 font-black tracking-widest uppercase text-[11px] block underline underline-offset-8 decoration-blue-200">Terminal Operational</span>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl font-black tracking-normal text-slate-900 leading-tight mb-5 sm:text-5xl"
                    >
                        Welcome back, <br />{user?.name?.split(' ')[0]}.
                    </motion.h1>
                    <div className="flex items-center gap-4">
                        <span className="px-5 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-200">
                            {user?.role} Access Authorized
                        </span>
                        <span className="text-slate-400 font-bold text-sm">{user?.email}</span>
                    </div>
                </div>

                {/* Quick Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => stat.path !== '#' && navigate(stat.path)}
                            className="surface-glass p-5 rounded-2xl border border-white/20 shadow-md flex items-center justify-between group cursor-pointer hover:border-white/40 transition-all"
                        >
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                                <h4 className="text-2xl font-bold text-slate-900">{stat.value}</h4>
                            </div>
                            <div className={`p-3 ${stat.bg} ${stat.color} rounded-xl group-hover:scale-110 transition-transform shadow-inner`}>
                                {stat.icon}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Primary Actions */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="surface-elevated bg-gradient-to-br from-blue-600 to-blue-700 p-6 sm:p-8 rounded-2xl text-white shadow-xl relative overflow-hidden group"
                        >
                            <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="space-y-4">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                                        <Hexagon size={26} />
                                    </div>
                                    <h2 className="text-3xl font-black leading-tight">Initialize Resource <br />Synchronization.</h2>
                                    <p className="text-indigo-100 font-medium max-w-sm">Access the institutional assets matrix and declare scheduling windows for strategic operations.</p>
                                    <Link to="/resources" className="btn-primary px-5 py-3 inline-flex items-center gap-3">
                                        Open Assets Manager <ArrowRight size={18} />
                                    </Link>
                                </div>
                                <div className="hidden md:block">
                                    <div className="w-36 h-36 border-4 border-white/20 rounded-2xl flex items-center justify-center animate-pulse">
                                        <Target size={72} className="text-white/30" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Link to="/notifications" className="block group">
                                <div className="h-full surface-glass p-6 rounded-2xl border border-white/20 shadow-md hover:border-white/40 transition-all flex flex-col justify-between space-y-6">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                        <Bell size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Notification Feed</h3>
                                        <p className="text-sm text-slate-500 font-medium">Review operational alerts and synchronization updates.</p>
                                    </div>
                                </div>
                            </Link>

                            <Link to="/my-bookings" className="block group">
                                <div className="h-full surface-glass p-6 rounded-2xl border border-white/20 shadow-md hover:border-white/40 transition-all flex flex-col justify-between space-y-6">
                                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                        <Inbox size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">My Registry</h3>
                                        <p className="text-sm text-slate-500 font-medium">Manage your personal resource allocation cycles.</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Sidebar / Admin Panel */}
                    <div className="space-y-6">
                        {isAdmin() && (
                            <motion.div 
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="surface-elevated bg-slate-900 p-6 rounded-2xl border border-slate-800 text-white shadow-xl space-y-6"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-rose-500/20 text-rose-500 rounded-xl">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold">Governance Panel</h3>
                                </div>
                                <p className="text-slate-400 text-sm font-medium leading-relaxed">System-level clearance detected. High-level administrative protocols are available for execution.</p>
                                
                                <div className="space-y-4">
                                    <Link to="/users" className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <Users size={18} className="text-rose-500" />
                                            <span className="text-sm font-bold uppercase tracking-widest">User Directory</span>
                                        </div>
                                        <ChevronRight size={14} className="text-slate-600 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link to="/admin/bookings" className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <Settings size={18} className="text-blue-400" />
                                            <span className="text-sm font-bold uppercase tracking-widest">Global Registry</span>
                                        </div>
                                        <ChevronRight size={14} className="text-slate-600 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </motion.div>
                        )}

                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="surface-glass p-6 rounded-2xl border border-white/20 shadow-md space-y-5"
                        >
                            <h3 className="text-lg font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-3">
                                <UserCircle size={20} className="text-blue-600" /> 
                                Metadata
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Authenticated Identity</p>
                                    <p className="text-base font-bold text-slate-900">{user?.name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Clearance Level</p>
                                    <p className="text-base font-bold text-indigo-600">{user?.role}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Terminal Node</p>
                                    <p className="text-base font-bold text-slate-900 break-all">{user?.id}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Utility Icon
const ChevronRight = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m9 18 6-6-6-6"/>
    </svg>
);

export default Dashboard;
