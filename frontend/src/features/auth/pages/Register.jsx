import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import {
    ArrowRight,
    CheckCircle2,
    ChevronDown,
    Lock,
    Mail,
    Shield,
    ShieldCheck,
    Sparkles,
    User,
    UserCheck
} from 'lucide-react';
import GoogleAuthButton from '../components/GoogleAuthButton';

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

    const benefits = [
        'Request rooms, labs, and shared academic spaces',
        'Follow booking approvals from one account',
        'Report incidents and maintenance needs quickly'
    ];

    const roleHint = formData.role === 'USER'
        ? 'Book resources and report incidents'
        : 'Manage maintenance and technical support';

    return (
        <div className="min-h-screen bg-slate-50 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-6xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl lg:grid-cols-[0.9fr_1.1fr]">
                <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
                    <img
                        src="/lab.png"
                        alt="Campus lab workspace"
                        className="absolute inset-0 h-full w-full object-cover opacity-45"
                    />
                    <div className="absolute inset-0 bg-slate-950/60" />

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-slate-100 backdrop-blur">
                            <ShieldCheck size={17} className="text-emerald-300" />
                            Account provisioning
                        </div>
                        <h1 className="mt-8 max-w-md text-5xl font-black leading-tight tracking-normal">
                            Create your access point to campus operations.
                        </h1>
                        <p className="mt-5 max-w-md text-base font-medium leading-8 text-slate-200">
                            Join the portal used for resource booking, incident reporting, and operational coordination.
                        </p>
                    </div>

                    <div className="relative z-10 grid gap-4">
                        {benefits.map((benefit) => (
                            <div key={benefit} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                                <CheckCircle2 size={20} className="shrink-0 text-emerald-300" />
                                <span className="text-sm font-semibold text-slate-100">{benefit}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
                    <div className="w-full max-w-md">
                        <div className="mb-7">
                            <Link to="/" className="mb-6 inline-flex items-center gap-3 group">
                                <span className="flex h-11 w-11 items-center justify-center rounded-xl gradient-primary text-white shadow-md transition group-hover:shadow-lg">
                                    <ShieldCheck size={23} />
                                </span>
                                <span>
                                    <span className="block text-xl font-black leading-none tracking-normal text-slate-950">SmartCampus</span>
                                    <span className="mt-1 block text-xs font-black uppercase tracking-normal text-blue-700">Operations portal</span>
                                </span>
                            </Link>

                            <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
                                <Sparkles size={17} />
                                Join the network
                            </div>
                            <h2 className="mt-5 text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">
                                Create account
                            </h2>
                            <p className="mt-3 text-base font-medium leading-7 text-slate-600">
                                Use Google or register with your campus account details.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                            <GoogleAuthButton intent="signup" className="!rounded-xl !border-slate-200 !bg-white !py-3.5 !shadow-sm" />

                            <div className="my-6 flex items-center gap-4">
                                <div className="h-px flex-1 bg-slate-200" />
                                <span className="text-xs font-bold uppercase tracking-normal text-slate-500">
                                    Or sign up with email
                                </span>
                                <div className="h-px flex-1 bg-slate-200" />
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="mb-2 block text-sm font-bold text-slate-800">
                                        Full name
                                    </label>
                                    <div className="relative">
                                        <User size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="!h-12 !rounded-xl !border-slate-300 !bg-white !py-0 !pl-12 !pr-4 !text-base !font-medium !text-slate-950 placeholder:!text-slate-400 focus:!border-blue-500 focus:!bg-white focus:!shadow-sm"
                                            placeholder="John Doe"
                                            autoComplete="name"
                                        />
                                    </div>
                                </div>

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
                                            className="!h-12 !rounded-xl !border-slate-300 !bg-white !py-0 !pl-12 !pr-4 !text-base !font-medium !text-slate-950 placeholder:!text-slate-400 focus:!border-blue-500 focus:!bg-white focus:!shadow-sm"
                                            placeholder="you@example.com"
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="role" className="mb-2 block text-sm font-bold text-slate-800">
                                        Account type
                                    </label>
                                    <div className="relative">
                                        <Shield size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <select
                                            id="role"
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            required
                                            className="!h-12 !rounded-xl !border-slate-300 !bg-white !py-0 !pl-12 !pr-12 !text-base !font-medium !text-slate-950 focus:!border-blue-500 focus:!bg-white focus:!shadow-sm appearance-none cursor-pointer"
                                        >
                                            <option value="USER">Student / Staff</option>
                                            <option value="TECHNICIAN">Technician</option>
                                        </select>
                                        <ChevronDown size={19} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                    <p className="mt-2 text-xs font-medium text-slate-500">{roleHint}</p>
                                </div>

                                <div>
                                    <label htmlFor="password" className="mb-2 block text-sm font-bold text-slate-800">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            minLength={6}
                                            className="!h-12 !rounded-xl !border-slate-300 !bg-white !py-0 !pl-12 !pr-4 !text-base !font-medium !text-slate-950 placeholder:!text-slate-400 focus:!border-blue-500 focus:!bg-white focus:!shadow-sm"
                                            placeholder="Min. 6 characters"
                                            autoComplete="new-password"
                                        />
                                    </div>
                                    <p className="mt-2 text-xs font-medium text-slate-500">Must be at least 6 characters</p>
                                </div>

                                <div className="flex items-start gap-3 pt-1">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        required
                                        className="!mt-0.5 !h-5 !w-5 shrink-0 cursor-pointer rounded border-slate-300 !p-0 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="terms" className="mb-0 cursor-pointer text-xs font-medium leading-6 text-slate-600">
                                        I agree to the{' '}
                                        <a href="#" className="font-bold text-blue-700 hover:text-blue-900">
                                            terms of service
                                        </a>
                                        {' '}and{' '}
                                        <a href="#" className="font-bold text-blue-700 hover:text-blue-900">
                                            privacy policy
                                        </a>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary min-h-12 w-full rounded-xl text-base font-bold disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? (
                                        <>
                                            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                            Creating account
                                        </>
                                    ) : (
                                        <>
                                            <UserCheck size={19} />
                                            Create account
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        <p className="mt-7 text-center text-sm font-medium text-slate-600">
                            Already have an account?{' '}
                            <Link to="/login" className="inline-flex items-center gap-1 font-bold text-blue-700 transition hover:text-blue-900">
                                Sign in <ArrowRight size={15} />
                            </Link>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Register;
