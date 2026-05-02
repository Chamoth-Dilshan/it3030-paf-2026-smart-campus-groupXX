import { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import EmptyNotificationsState from '../components/EmptyNotificationsState';
import NotificationCard from '../components/NotificationCard';
import notificationService from '../services/notificationService';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await notificationService.getNotifications();
            setNotifications(res.data);
        } catch {
            toast.error('Signal Feed Synchronization Failure');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));
        } catch {
            toast.error('Protocol Acknowledgement Failure');
        }
    };

    const handleMarkAllAsRead = async () => {
        const loadingToast = toast.loading("Acknowledging all signals...");
        try {
            await notificationService.markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            toast.success('All signals acknowledged.', { id: loadingToast });
        } catch {
            toast.error('Global Acknowledgement Failure', { id: loadingToast });
        }
    };

    const handleDelete = async (id) => {
        try {
            await notificationService.deleteNotification(id);
            setNotifications(notifications.filter(n => n.id !== id));
            toast.success('Signal purged from localized matrix.');
        } catch {
            toast.error('Signal Purge Failure');
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="bg-slate-50 min-h-screen pt-24 pb-16 px-4 sm:px-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-slate-50/20 backdrop-blur-[1px] pointer-events-none" />
            
            {/* Vibrant Interior Background Overlay */}
            <div 
                className="absolute inset-0 z-0 opacity-10 pointer-events-none"
                style={{ 
                backgroundImage: 'url("/backgrounds/colorful-interior.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
                }}
            />

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <Link to="/dashboard" className="inline-flex items-center gap-2 text-indigo-600 font-black tracking-widest uppercase text-[10px] mb-4 hover:gap-3 transition-all">
                            <ArrowLeft size={14} /> Back to Nexus
                        </Link>
                        <Motion.h1 
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-4xl font-black tracking-normal text-slate-900 leading-tight sm:text-5xl"
                        >
                            Signal Feed.
                        </Motion.h1>
                        <p className="text-base text-slate-500 font-medium mt-3">Real-time institutional alerts and operational updates.</p>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="flex items-center gap-3 px-5 py-3 bg-white border border-white rounded-xl text-slate-900 hover:bg-slate-50 transition-all font-black text-[11px] uppercase tracking-widest shadow-sm group"
                        >
                            <CheckSquare size={18} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                            Acknowledge All
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-5 shadow-inner"></div>
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Syncing Signal Feed...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <EmptyNotificationsState />
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {notifications.map((notification, idx) => (
                                <NotificationCard
                                    key={notification.id}
                                    notification={notification}
                                    index={idx}
                                    onMarkAsRead={handleMarkAsRead}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
