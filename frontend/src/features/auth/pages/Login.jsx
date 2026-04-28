import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const googleLoginEnabled = import.meta.env.VITE_GOOGLE_OAUTH_ENABLED === 'true';
    const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080').replace(/\/$/, '');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await loginUser(formData);
            const { token, ...userData } = res.data;
            login(userData, token);

            const keySource = String(userData.id || userData.email || userData.name || '').trim().toLowerCase();
            const currentUserKey = keySource ? `u:${keySource}` : '';
            if (currentUserKey) localStorage.setItem('scos.currentUserKey', currentUserKey);
            if (userData.email) localStorage.setItem('scos.email', userData.email);
            if (userData.name) localStorage.setItem('scos.reportedBy', userData.name);

            toast.success(`Welcome back, ${userData.name}!`);
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${backendBaseUrl}/oauth2/authorization/google`;
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
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
                    <p className="text-slate-500 text-sm">Sign in to manage campus resources</p>
                </div>

                {/* Login Card */}
                <form onSubmit={handleSubmit} className="space-y-5 mb-6">
                    <div className="surface-glass rounded-xl p-8 space-y-5">
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

                        {/* Password Field */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                                    Password
                                </label>
                                <Link to="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                    Forgot?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-3 text-slate-400" />
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                                    placeholder="••••••••"
                                    autoComplete="password"
                                />
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="remember"
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <label htmlFor="remember" className="ml-2.5 text-sm text-slate-600 cursor-pointer">
                                Keep me signed in
                            </label>
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <LogIn size={18} />
                                    Sign In
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Divider */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-300" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-white px-3 text-xs font-semibold text-slate-500">Or continue with</span>
                    </div>
                </div>

                {googleLoginEnabled ? (
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full surface-glass rounded-lg p-3 font-semibold text-slate-700 hover:surface-hover transition-all flex items-center justify-center gap-2 border border-slate-300"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Sign in with Google
                    </button>
                ) : (
                    <button
                        type="button"
                        disabled
                        aria-disabled="true"
                        className="w-full surface-glass rounded-lg p-3 font-semibold text-slate-400 border border-slate-200 cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5 opacity-60" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google sign-in disabled locally
                    </button>
                )}

                {/* Sign Up Link */}
                <p className="text-center text-slate-600 text-sm mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 transition-colors">
                        Create one <ArrowRight size={14} />
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;