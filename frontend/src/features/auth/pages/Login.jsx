import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import {
    ArrowRight,
    CheckCircle2,
    Lock,
    LogIn,
    Mail,
    ShieldCheck,
    Sparkles,
    Users
} from 'lucide-react';
import GoogleAuthButton from '../components/GoogleAuthButton';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
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

    const benefits = [
        'Book labs, halls, and shared workspaces',
        'Track approvals and campus requests',
        'Report incidents with operational context'
    ];

    return (
        <div className="flex min-h-screen items-center bg-slate-50 px-4 pb-8 pt-24 sm:px-6 lg:px-8">
            <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl lg:min-h-[660px] lg:grid-cols-[0.92fr_1.08fr] xl:min-h-[700px]">
                <section className="relative hidden overflow-hidden bg-slate-950 p-9 text-white lg:flex lg:flex-col lg:justify-between">
                    <img
                        src="/campus-life.jpg"
                        alt="Campus operations"
                        className="absolute inset-0 h-full w-full object-cover opacity-45"
                    />
                    <div className="absolute inset-0 bg-slate-950/55" />

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-slate-100 backdrop-blur">
                            <ShieldCheck size={17} className="text-emerald-300" />
                            Secure campus access
                        </div>
                        <h1 className="mt-7 max-w-md text-4xl font-black leading-tight tracking-normal xl:text-5xl">
                            Sign in to manage campus work without friction.
                        </h1>
                        <p className="mt-4 max-w-md text-base font-medium leading-7 text-slate-200">
                            One account connects resource bookings, incident workflows, and operational dashboards.
                        </p>
                    </div>

                    <div className="relative z-10 grid gap-3">
                        {benefits.map((benefit) => (
                            <div key={benefit} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 p-3.5 backdrop-blur">
                                <CheckCircle2 size={18} className="shrink-0 text-emerald-300" />
                                <span className="text-sm font-semibold text-slate-100">{benefit}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="flex items-center justify-center p-5 sm:p-8 lg:p-10 xl:p-12">
                    <div className="w-full max-w-md">
                        <div className="mb-6">
                            <div className="mb-6 flex flex-wrap items-center gap-3">
                                <Link to="/" className="inline-flex items-center gap-3 group">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-white shadow-md transition group-hover:shadow-lg">
                                        <ShieldCheck size={21} />
                                    </span>
                                    <span>
                                        <span className="block text-xl font-black leading-none tracking-normal text-slate-950">SmartCampus</span>
                                        <span className="mt-1 block text-xs font-black uppercase tracking-normal text-blue-700">Operations portal</span>
                                    </span>
                                </Link>

                                <span className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
                                    <Users size={16} />
                                    Operations center
                                </span>
                            </div>

                            <h2 className="text-4xl font-black leading-tight tracking-normal text-slate-950">
                                Welcome back
                            </h2>
                            <p className="mt-2 text-base font-medium leading-7 text-slate-600">
                                Sign in with Google or your campus account credentials.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <GoogleAuthButton intent="signin" className="!rounded-xl !border-slate-200 !bg-white !py-3 !shadow-sm" />

                            <div className="my-5 flex items-center gap-4">
                                <div className="h-px flex-1 bg-slate-200" />
                                <span className="text-xs font-bold uppercase tracking-normal text-slate-500">
                                    Or sign in with email
                                </span>
                                <div className="h-px flex-1 bg-slate-200" />
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="mb-2 block text-sm font-bold text-slate-800">
                                        Email address
                                    </label>
                                    <div className="relative">
                                        <Mail size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="!h-11 !rounded-xl !border-slate-300 !bg-white !py-0 !pl-12 !pr-4 !text-base !font-medium !text-slate-950 placeholder:!text-slate-400 focus:!border-blue-500 focus:!bg-white focus:!shadow-sm"
                                            placeholder="you@example.com"
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-2 flex items-center justify-between gap-4">
                                        <label htmlFor="password" className="block text-sm font-bold text-slate-800">
                                            Password
                                        </label>
                                        <Link to="#" className="text-sm font-bold text-blue-700 transition hover:text-blue-900">
                                            Forgot?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Lock size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            className="!h-11 !rounded-xl !border-slate-300 !bg-white !py-0 !pl-12 !pr-4 !text-base !font-medium !text-slate-950 placeholder:!text-slate-400 focus:!border-blue-500 focus:!bg-white focus:!shadow-sm"
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="remember"
                                        className="!h-5 !w-5 shrink-0 cursor-pointer rounded border-slate-300 !p-0 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="remember" className="mb-0 cursor-pointer text-sm font-semibold text-slate-700">
                                        Keep me signed in
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary min-h-11 w-full rounded-xl text-base font-bold disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? (
                                        <>
                                            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                            Signing in
                                        </>
                                    ) : (
                                        <>
                                            <LogIn size={19} />
                                            Sign in
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        <p className="mt-5 text-center text-sm font-medium text-slate-600">
                            Do not have an account?{' '}
                            <Link to="/register" className="inline-flex items-center gap-1 font-bold text-blue-700 transition hover:text-blue-900">
                                Create one <ArrowRight size={15} />
                            </Link>
                        </p>

                        <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-normal text-slate-400">
                            <Sparkles size={14} />
                            Certified digital architecture
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Login;
