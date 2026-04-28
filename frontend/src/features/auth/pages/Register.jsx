import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Shield, ArrowRight, UserCheck } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'USER' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await registerUser(formData);
            const { token, ...userData } = res.data;
            login(userData, token);
            toast.success(`Welcome, ${userData.name}!`);
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-100/10 rounded-full blur-3xl -z-10" />
            
            <div className="w-full max-w-md animate-slide-up">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
                        <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform">
                            SC
                        </div>
                        <div className="text-left">
                            <h2 className="font-bold text-slate-900 leading-none">Smart Campus</h2>
                            <p className="text-xs text-slate-500">Operations Center</p>
                        </div>
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h1>
                    <p className="text-slate-500 text-sm">Join the campus operations network</p>
                </div>

                {/* Registration Card */}
                <form onSubmit={handleSubmit} className="space-y-5 mb-6">
                    <div className="surface-glass rounded-xl p-8 space-y-5">
                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-3 text-slate-400" />
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                                    placeholder="John Doe"
                                    autoComplete="name"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-3 text-slate-400" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label htmlFor="role" className="block text-sm font-semibold text-slate-700 mb-2">
                                Account Type
                            </label>
                            <div className="relative">
                                <Shield size={18} className="absolute left-3 top-3 text-slate-400 pointer-events-none z-10" />
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="USER">Student / Staff</option>
                                    <option value="TECHNICIAN">Technician</option>
                                </select>
                                <ArrowRight size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none" style={{ transform: 'rotate(90deg)' }} />
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                {formData.role === 'USER' ? 'Book resources and report incidents' : 'Manage maintenance and technical support'}
                            </p>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-3 text-slate-400" />
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                                    placeholder="Min. 6 characters"
                                    autoComplete="new-password"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Must be at least 6 characters</p>
                        </div>

                        {/* Terms Agreement */}
                        <div className="flex items-start gap-3 pt-2">
                            <input
                                type="checkbox"
                                id="terms"
                                required
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer mt-1"
                            />
                            <label htmlFor="terms" className="text-xs text-slate-600 cursor-pointer">
                                I agree to the{' '}
                                <a href="#" className="text-blue-600 hover:underline font-semibold">
                                    terms of service
                                </a>
                                {' '}and{' '}
                                <a href="#" className="text-blue-600 hover:underline font-semibold">
                                    privacy policy
                                </a>
                            </label>
                        </div>

                        {/* Create Account Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    <UserCheck size={18} />
                                    Create Account
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Sign In Link */}
                <p className="text-center text-slate-600 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 transition-colors">
                        Sign In <ArrowRight size={14} />
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;