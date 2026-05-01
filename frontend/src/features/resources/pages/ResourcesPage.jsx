import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  Building2,
  GraduationCap,
  MapPin,
  Microscope,
  Search,
  Sparkles,
  Users,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import resourceService from '../services/resourceService';
import ResourceCard from '../components/ResourceCard';
import ResourceCategoryCard from '../components/ResourceCategoryCard';
import ResourceDetailsModal from '../components/ResourceDetailsModal';

const CATEGORIES = [
  { id: 'Auditorium', name: 'Auditoriums', icon: Building2, desc: 'High-capacity venues for symposiums, seminars, and campus events.', img: '/auditorium.png' },
  { id: 'Laboratory', name: 'Labs & Research', icon: Microscope, desc: 'Technical facilities for scientific, computing, and research work.', img: '/lab.png' },
  { id: 'Equipment', name: 'Assets & Tools', icon: Zap, desc: 'Specialized devices and equipment for academic projects.', img: '/images/computer_lab.png' },
  { id: 'Classroom', name: 'Classrooms', icon: GraduationCap, desc: 'Modern teaching spaces with smart learning infrastructure.', img: '/backgrounds/colorful-interior.png' },
  { id: 'Sports', name: 'Sports Facilities', icon: Activity, desc: 'Athletic grounds and indoor spaces for sports activities.', img: '/backgrounds/colorful-campus.png' }
];

const defaultFilters = {
  type: '',
  minCapacity: '',
  location: '',
  status: '',
  search: ''
};

const ResourcesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedResource, setSelectedResource] = useState(null);
  const navigate = useNavigate();

  const fetchResources = useCallback(async () => {
    if (!selectedCategory) return;

    setLoading(true);
    try {
      const data = await resourceService.getAllResources({ ...filters, category: selectedCategory.id });
      setResources(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to retrieve campus resources.');
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [filters, selectedCategory]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setFilters(defaultFilters);
    setResources([]);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    clearFilters();
    setResources([]);
  };

  const visibleCategories = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    if (!query || selectedCategory) return CATEGORIES;
    return CATEGORIES.filter((category) => `${category.name} ${category.desc}`.toLowerCase().includes(query));
  }, [filters.search, selectedCategory]);

  const activeFilterCount = [filters.type, filters.minCapacity, filters.location, filters.status, filters.search].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-black uppercase tracking-normal text-blue-700">
              <Sparkles size={17} />
              Campus asset registry
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-tight tracking-normal text-slate-950 sm:text-6xl">
              Find the right campus resource faster.
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-600">
              Browse academic venues, labs, equipment, classrooms, and sports facilities with readable categories and practical filters.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <label htmlFor="resource-search" className="mb-3 block text-sm font-black uppercase tracking-normal text-slate-700">
              Search registry
            </label>
            <div className="relative">
              <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="resource-search"
                type="text"
                placeholder={selectedCategory ? `Search ${selectedCategory.name}` : 'Search categories'}
                className="!h-12 !rounded-xl !border-slate-300 !bg-white !py-0 !pl-12 !pr-4 !text-base !font-medium !text-slate-950 placeholder:!text-slate-400 focus:!border-blue-500 focus:!bg-white focus:!shadow-sm"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-12">
        {!selectedCategory ? (
          <>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-3xl font-black tracking-normal text-slate-950">Resource categories</h2>
                <p className="mt-2 text-sm font-medium text-slate-600">Choose a category to view matching resources and availability actions.</p>
              </div>
              <span className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm ring-1 ring-slate-200">
                {visibleCategories.length} categories
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visibleCategories.map((category) => (
                <ResourceCategoryCard key={category.id} category={category} onSelect={handleCategorySelect} />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="mb-8">
              <button
                type="button"
                onClick={handleBackToCategories}
                className="mb-6 inline-flex items-center gap-2 text-sm font-black uppercase tracking-normal text-blue-700 transition hover:text-blue-900"
              >
                <ArrowLeft size={18} />
                Back to categories
              </button>

              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">{selectedCategory.name}</h2>
                  <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-slate-600">{selectedCategory.desc}</p>
                </div>
                <span className="w-fit rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm ring-1 ring-slate-200">
                  {loading ? 'Loading resources' : `${resources.length} resources`}
                </span>
              </div>
            </div>

            <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <label className="mb-0">
                  <span className="mb-2 block text-xs font-black uppercase tracking-normal text-slate-600">Type</span>
                  <select value={filters.type} onChange={(e) => updateFilter('type', e.target.value)} className="!h-11 !rounded-xl !border-slate-300 !bg-white !py-0 !px-4 !text-sm !font-semibold !text-slate-900 focus:!border-blue-500 focus:!shadow-sm">
                    <option value="">All types</option>
                    <option value="ROOM">Room</option>
                    <option value="HALL">Hall / Venue</option>
                    <option value="PROJECTOR">Projector</option>
                    <option value="CAMERA">Camera</option>
                    <option value="INDOOR">Indoor Facility</option>
                    <option value="OUTDOOR">Outdoor Ground</option>
                  </select>
                </label>

                <label className="mb-0">
                  <span className="mb-2 block text-xs font-black uppercase tracking-normal text-slate-600">Status</span>
                  <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)} className="!h-11 !rounded-xl !border-slate-300 !bg-white !py-0 !px-4 !text-sm !font-semibold !text-slate-900 focus:!border-blue-500 focus:!shadow-sm">
                    <option value="">Any status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="OUT_OF_SERVICE">Out of service</option>
                  </select>
                </label>

                <label className="mb-0">
                  <span className="mb-2 block text-xs font-black uppercase tracking-normal text-slate-600">Location</span>
                  <div className="relative">
                    <MapPin size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Building or wing" value={filters.location} onChange={(e) => updateFilter('location', e.target.value)} className="!h-11 !rounded-xl !border-slate-300 !bg-white !py-0 !pl-11 !pr-4 !text-sm !font-semibold !text-slate-900 placeholder:!text-slate-400 focus:!border-blue-500 focus:!shadow-sm" />
                  </div>
                </label>

                <label className="mb-0">
                  <span className="mb-2 block text-xs font-black uppercase tracking-normal text-slate-600">Minimum capacity</span>
                  <div className="relative">
                    <Users size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="number" placeholder="Any" value={filters.minCapacity} onChange={(e) => updateFilter('minCapacity', e.target.value)} className="!h-11 !rounded-xl !border-slate-300 !bg-white !py-0 !pl-11 !pr-4 !text-sm !font-semibold !text-slate-900 placeholder:!text-slate-400 focus:!border-blue-500 focus:!shadow-sm" />
                  </div>
                </label>
              </div>

              {activeFilterCount > 0 && (
                <button type="button" onClick={clearFilters} className="mt-5 inline-flex items-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200">
                  Clear filters
                </button>
              )}
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center shadow-sm">
                <div className="mx-auto mb-5 h-11 w-11 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
                <p className="text-sm font-black uppercase tracking-normal text-slate-500">Loading resources</p>
              </div>
            ) : resources.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {resources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} onView={setSelectedResource} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center shadow-sm">
                <Users className="mx-auto mb-5 text-slate-300" size={46} />
                <h3 className="text-2xl font-black tracking-normal text-slate-900">No resources found</h3>
                <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-6 text-slate-600">Try clearing filters or selecting another resource category.</p>
                <button type="button" onClick={handleBackToCategories} className="mt-6 inline-flex items-center gap-2 text-sm font-black uppercase tracking-normal text-blue-700">
                  Back to categories
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {selectedResource && (
        <ResourceDetailsModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
          onCheckAvailability={() => {
            navigate(`/availability?resourceId=${selectedResource.id}`);
            setSelectedResource(null);
          }}
          onBook={() => {
            navigate('/bookings', { state: { resourceId: selectedResource.id } });
            setSelectedResource(null);
          }}
        />
      )}
    </div>
  );
};

export default ResourcesPage;
