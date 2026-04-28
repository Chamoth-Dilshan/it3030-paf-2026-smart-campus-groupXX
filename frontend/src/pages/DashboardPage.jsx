import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Calendar
} from 'lucide-react';
import analyticsService from '../services/analyticsService';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    cancelled: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await analyticsService.getStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Requests', value: stats.total, icon: <BarChart3 size={24} />, color: 'blue' },
    { label: 'Approved', value: stats.approved, icon: <CheckCircle2 size={24} />, color: 'emerald' },
    { label: 'Pending', value: stats.pending, icon: <Clock size={24} />, color: 'amber' },
    { label: 'Rejected', value: stats.rejected, icon: <XCircle size={24} />, color: 'rose' }
  ];

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">System Dashboard</h1>
          <p className="text-slate-500">Real-time overview of campus booking operations.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm">
          <Calendar size={18} />
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 surface-glass animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`surface-glass p-6 border-b-4 ${
                  card.color === 'indigo' ? 'border-b-blue-500' :
                  card.color === 'emerald' ? 'border-b-emerald-500' :
                  card.color === 'amber' ? 'border-b-amber-500' :
                  'border-b-rose-500'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${
                    card.color === 'indigo' ? 'bg-blue-50 text-blue-600' :
                    card.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                    card.color === 'amber' ? 'bg-amber-50 text-amber-600' :
                    'bg-rose-50 text-rose-600'
                  }`}>
                    {card.icon}
                  </div>
                  <TrendingUp size={20} className="text-slate-300" />
                </div>
                <div className="text-3xl font-black text-slate-800">{card.value}</div>
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">{card.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="surface-glass p-8">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Recent Activity Highlights</h3>
              <div className="space-y-6">
                {[
                  { user: 'Student #102', action: 'Requested Auditorium', time: '10 mins ago', type: 'pending' },
                  { user: 'Admin', action: 'Approved Lab #5', time: '1 hour ago', type: 'approved' },
                  { user: 'Staff #44', action: 'Cancelled Meeting Room', time: '2 hours ago', type: 'cancelled' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-2 h-10 bg-slate-100 rounded-full mt-1" />
                    <div>
                      <div className="font-bold text-slate-800">{item.user}</div>
                      <div className="text-sm text-slate-500">{item.action} • {item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-elevated bg-gradient-to-br from-blue-600 to-blue-700 text-white p-8 rounded-[1.5rem] relative overflow-hidden">
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <AlertCircle size={40} className="mb-6 opacity-80" />
                <h3 className="text-2xl font-bold mb-4">System Insights</h3>
                <p className="text-blue-100 mb-8 leading-relaxed">
                  Resource Res-101 has the highest occupancy rate this week. Consider suggesting alternative laboratory spaces for future students.
                </p>
                <button className="btn-primary text-sm px-6 py-2.5">
                  View Detailed Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
