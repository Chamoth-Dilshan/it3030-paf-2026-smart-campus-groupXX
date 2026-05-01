import React, { useEffect, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  Cpu,
  FileText,
  Globe,
  GraduationCap,
  HardHat,
  Layout,
  Mail,
  Microscope,
  Monitor,
  Phone,
  Scale,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import analyticsService from '../features/bookings/services/analyticsService';

const fallbackStats = {
  total: 124,
  approved: 86,
  pending: 12,
  rejected: 4
};

const HomePage = () => {
  const [stats, setStats] = useState(fallbackStats);

  useEffect(() => {
    const fetchStats = async () => {
      if (!localStorage.getItem('token')) return;

      try {
        const data = await analyticsService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching homepage stats:', error);
      }
    };

    fetchStats();
  }, []);

  const totalBookings = stats.totalBookings ?? stats.total ?? fallbackStats.total;
  const approvedBookings = stats.approvedBookings ?? stats.approved ?? fallbackStats.approved;
  const pendingBookings = stats.pendingBookings ?? stats.pending ?? fallbackStats.pending;
  const rejectedBookings = stats.rejectedBookings ?? stats.rejected ?? fallbackStats.rejected;

  const personas = [
    {
      role: 'Student',
      title: 'Reserve learning spaces',
      desc: 'Find study pods, labs, and project rooms without waiting on manual approvals.',
      cta: 'Student access',
      path: '/login',
      icon: GraduationCap,
      accent: 'bg-blue-50 text-blue-700'
    },
    {
      role: 'Faculty',
      title: 'Coordinate academic work',
      desc: 'Schedule lecture halls, research labs, and events from the same portal.',
      cta: 'Faculty portal',
      path: '/availability',
      icon: Monitor,
      accent: 'bg-emerald-50 text-emerald-700'
    },
    {
      role: 'Staff',
      title: 'Keep facilities moving',
      desc: 'Monitor resource availability, maintenance requests, and operational load.',
      cta: 'Staff console',
      path: '/resources',
      icon: HardHat,
      accent: 'bg-amber-50 text-amber-700'
    }
  ];

  const intelligenceData = [
    {
      label: 'Total requests',
      value: totalBookings,
      desc: 'Booking requests tracked in the operations portal.',
      icon: BarChart3,
      color: 'text-blue-700',
      bg: 'bg-blue-50'
    },
    {
      label: 'Approved bookings',
      value: approvedBookings,
      desc: 'Reservations cleared for academic use.',
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50'
    },
    {
      label: 'Pending queue',
      value: pendingBookings,
      desc: 'Requests still waiting for review.',
      icon: Clock,
      color: 'text-amber-700',
      bg: 'bg-amber-50'
    },
    {
      label: 'Rejected entries',
      value: rejectedBookings,
      desc: 'Requests declined or sent back for correction.',
      icon: Activity,
      color: 'text-rose-700',
      bg: 'bg-rose-50'
    }
  ];

  const facilityCards = [
    {
      title: 'Glass Auditorium',
      subtitle: 'Flagship Venue',
      desc: 'A 500-seat academic venue configured for symposiums, lectures, and high-fidelity presentations.',
      img: '/auditorium.png',
      meta: ['Solar supported', 'Lecture ready']
    },
    {
      title: 'Quantum Research Center',
      subtitle: 'Research Hub',
      desc: 'A high-performance lab environment with managed workstations and dependable booking windows.',
      img: '/lab.png',
      meta: ['54 workstations', '99.9% uptime']
    }
  ];

  const capabilityCards = [
    {
      title: 'Fast approvals',
      desc: 'Review teams can move requests from pending to approved without switching tools.',
      icon: Zap
    },
    {
      title: 'Clear governance',
      desc: 'Audit-friendly booking records keep departments aligned on usage and ownership.',
      icon: ShieldCheck
    },
    {
      title: 'Resource visibility',
      desc: 'Availability, demand, and facility status remain visible before users submit requests.',
      icon: Microscope
    }
  ];

  const newsItems = [
    {
      title: 'Global Research Symposium 2026',
      category: 'Academic Event',
      date: 'Oct 24, 2026',
      desc: 'Resource allocation expands for the upcoming international symposium in the main glass atrium.',
      img: '/news-symposium.jpg'
    },
    {
      title: 'New Quantum Computing Cluster',
      category: 'Facility Update',
      date: 'Oct 20, 2026',
      desc: 'The Advanced Physics lab now accepts managed bookings for the new computing cluster.',
      img: '/lab.png'
    },
    {
      title: 'Sustainable Campus Initiative',
      category: 'News',
      date: 'Oct 15, 2026',
      desc: 'Room occupancy planning is helping reduce energy consumption across smart facilities.',
      img: '/auditorium.png'
    }
  ];

  const footerColumns = [
    {
      title: 'Portal',
      icon: Cpu,
      links: ['Resource Management', 'Live Analytics', 'Research Ops', 'Staff Central']
    },
    {
      title: 'Campus',
      icon: FileText,
      links: ['Campus Map', 'Department Directory', 'Academic Calendar', 'Event Support']
    },
    {
      title: 'Governance',
      icon: Scale,
      links: ['Legal & Privacy', 'Accessibility', 'Title II Compliance', 'System Security']
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <section className="relative isolate overflow-hidden bg-slate-950 pt-28 text-white lg:pt-32">
        <img
          src="/campus-life.jpg"
          alt="Students collaborating on campus"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-slate-950/70" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-white to-transparent" />

        <div className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-28">
          <div className="max-w-3xl">
            <div className="mb-8 inline-flex items-center gap-3 rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/85 backdrop-blur">
              <ShieldCheck size={18} className="text-emerald-300" />
              Verified academic operations
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[1.02] tracking-normal text-white sm:text-6xl lg:text-7xl">
              Campus intelligence for every resource decision.
            </h1>

            <p className="mt-7 max-w-2xl text-lg font-medium leading-8 text-slate-100">
              SmartCampus brings bookings, availability, and operational oversight into one reliable portal for students, faculty, and staff.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link to="/login" className="btn-primary min-h-12 px-6 text-sm font-extrabold uppercase tracking-normal">
                Launch portal
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/availability"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/10 px-6 text-sm font-extrabold uppercase tracking-normal text-white transition hover:bg-white/15"
              >
                View availability
                <CalendarDays size={18} />
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {personas.map((persona) => {
              const Icon = persona.icon;
              return (
                <div key={persona.role}>
                  <Link
                    to={persona.path}
                    className="group flex h-full flex-col rounded-2xl border border-white/70 bg-white p-5 text-slate-900 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl sm:min-h-[260px] lg:min-h-0 lg:flex-row lg:items-start lg:gap-5"
                  >
                    <span className={`mb-5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${persona.accent} lg:mb-0`}>
                      <Icon size={24} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-xs font-black uppercase tracking-normal text-blue-700">{persona.role}</span>
                      <span className="mt-2 text-xl font-extrabold leading-6 tracking-normal text-slate-950">{persona.title}</span>
                      <span className="mt-3 text-sm font-medium leading-6 text-slate-600">{persona.desc}</span>
                      <span className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-normal text-slate-900 group-hover:text-blue-700">
                        {persona.cta}
                        <ArrowRight size={14} />
                      </span>
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <span className="text-sm font-black uppercase tracking-normal text-blue-700">System vitality</span>
              <h2 className="mt-4 text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">
                Campus integrity by the numbers
              </h2>
              <p className="mt-5 max-w-xl text-base font-medium leading-8 text-slate-600">
                Monitor booking volume, approval flow, and pending workload without scanning disconnected reports.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {intelligenceData.map((intel) => {
                const Icon = intel.icon;
                return (
                  <div
                    key={intel.label}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${intel.bg} ${intel.color}`}>
                        <Icon size={22} />
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black leading-none tracking-normal text-slate-950">{intel.value}</div>
                      </div>
                    </div>
                    <h3 className="mt-5 text-sm font-black uppercase tracking-normal text-slate-950">{intel.label}</h3>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{intel.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-100 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-3xl">
            <span className="text-sm font-black uppercase tracking-normal text-blue-700">Campus facilities</span>
            <h2 className="mt-4 text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">
              Architectural excellence meets digital precision
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="grid gap-6">
              {facilityCards.map((facility) => (
                <article key={facility.title} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                  <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="relative min-h-[300px]">
                      <img src={facility.img} alt={facility.title} className="absolute inset-0 h-full w-full object-cover" />
                    </div>
                    <div className="p-7 lg:p-8">
                      <span className="text-xs font-black uppercase tracking-normal text-blue-700">{facility.subtitle}</span>
                      <h3 className="mt-3 text-3xl font-black leading-tight tracking-normal text-slate-950">{facility.title}</h3>
                      <p className="mt-4 text-base font-medium leading-7 text-slate-600">{facility.desc}</p>
                      <div className="mt-7 flex flex-wrap gap-3">
                        {facility.meta.map((item) => (
                          <span key={item} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-extrabold uppercase tracking-normal text-slate-700">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="grid gap-6">
              <div className="rounded-2xl bg-slate-950 p-8 text-white shadow-sm">
                <BookOpen className="text-blue-300" size={34} />
                <h3 className="mt-8 text-3xl font-black leading-tight tracking-normal">High-velocity booking flow</h3>
                <p className="mt-4 text-base font-medium leading-7 text-slate-300">
                  Resource requests stay visible from submission to approval, giving each department a clearer view of campus demand.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                  <div>
                    <div className="text-2xl font-black tracking-normal">120ms</div>
                    <div className="mt-1 text-xs font-extrabold uppercase tracking-normal text-slate-400">Target response</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black tracking-normal">100Gbps</div>
                    <div className="mt-1 text-xs font-extrabold uppercase tracking-normal text-slate-400">Network speed</div>
                  </div>
                </div>
              </div>

              {capabilityCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                    <Icon size={30} className="text-blue-700" />
                    <h3 className="mt-5 text-2xl font-black tracking-normal text-slate-950">{card.title}</h3>
                    <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{card.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-col gap-6 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-sm font-black uppercase tracking-normal text-blue-700">Campus pulse</span>
              <h2 className="mt-4 text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">
                Insights from active campus work
              </h2>
            </div>
            <Link to="/resources" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-normal text-blue-700 hover:text-blue-900">
              Browse resources
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {newsItems.map((item) => (
              <article key={item.title} className="group">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-slate-200">
                  <img src={item.img} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-normal text-slate-500">
                  <span className="text-blue-700">{item.category}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={14} />
                    {item.date}
                  </span>
                </div>
                <h3 className="mt-4 text-2xl font-black leading-tight tracking-normal text-slate-950 transition group-hover:text-blue-700">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{item.desc}</p>
                <Link to="/resources" className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-normal text-slate-950 hover:text-blue-700">
                  Read story
                  <ArrowRight size={15} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 py-16 text-white lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1.8fr]">
            <div>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <Layout size={26} />
                </div>
                <div>
                  <span className="block text-2xl font-black tracking-normal">SmartCampus</span>
                  <span className="block text-xs font-black uppercase tracking-normal text-blue-300">Resource portal</span>
                </div>
              </div>
              <p className="mt-6 max-w-md text-base font-medium leading-8 text-slate-300">
                Digital infrastructure for academic resource bookings, facility visibility, and campus operations.
              </p>
              <div className="mt-8 flex gap-3">
                {[Globe, Mail, Activity, Phone].map((Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    aria-label="SmartCampus contact link"
                    className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    <Icon size={19} />
                  </a>
                ))}
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {footerColumns.map((col) => {
                const Icon = col.icon;
                return (
                  <div key={col.title}>
                    <div className="mb-5 flex items-center gap-2">
                      <Icon size={17} className="text-blue-300" />
                      <h3 className="text-sm font-black uppercase tracking-normal text-white">{col.title}</h3>
                    </div>
                    <ul className="space-y-3">
                      {col.links.map((link) => (
                        <li key={link}>
                          <a href="#" className="text-sm font-medium text-slate-300 transition hover:text-white">
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-5 border-t border-white/10 pt-8 text-sm font-medium text-slate-400 md:flex-row md:items-center md:justify-between">
            <span>Copyright 2026 Smart Campus Operations. All rights reserved.</span>
            <div className="flex flex-wrap items-center gap-4">
              <span>SLA uptime: 99.98%</span>
              <span>Encryption: TLS 1.3</span>
              <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-slate-300">
                <ShieldCheck size={16} className="text-emerald-400" />
                Certified digital architecture
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
