import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  BookOpen,
  Building2,
  GraduationCap,
  MapPin,
  Microscope,
  Search,
  Users,
  Video,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import resourceService from '../services/resourceService';
import ResourceCard from '../components/ResourceCard';
import ResourceCategoryCard from '../components/ResourceCategoryCard';
import ResourceDetailsModal from '../components/ResourceDetailsModal';
import ResourceBookingModal from '../components/ResourceBookingModal';

const CATEGORIES = [
  { id: 'Auditorium', name: 'Auditoriums', icon: Building2, desc: 'High-capacity venues for symposiums, seminars, and campus events.', img: '/auditorium.png' },
  { id: 'Laboratory', name: 'Labs & Research', icon: Microscope, desc: 'Technical facilities for scientific, computing, and research work.', img: '/lab.png' },
  { id: 'Equipment', name: 'Assets & Tools', icon: Zap, desc: 'Specialized devices and equipment for academic projects.', img: '/images/computer_lab.png' },
  { id: 'Classroom', name: 'Classrooms', icon: GraduationCap, desc: 'Modern teaching spaces with smart learning infrastructure.', img: '/backgrounds/colorful-interior.png' },
  { id: 'Sports', name: 'Sports Facilities', icon: Activity, desc: 'Athletic grounds and indoor spaces for sports activities.', img: '/backgrounds/colorful-campus.png' },
  { id: 'Meeting Room', name: 'Meeting Rooms', icon: Users, desc: 'Bookable rooms for team meetings, reviews, and faculty consultations.', img: '/backgrounds/architecture.png' },
  { id: 'Library', name: 'Library Spaces', icon: BookOpen, desc: 'Quiet study rooms, reading areas, and collaborative library zones.', img: '/campus-life.jpg' },
  { id: 'Media Studio', name: 'Media Studios', icon: Video, desc: 'Recording, streaming, and content creation studios for coursework.', img: '/backgrounds/colorful-lab.png' }
];

const defaultFilters = {
  type: '',
  minCapacity: '',
  location: '',
  status: '',
  search: ''
};

const matchesStatus = (resourceStatus, selectedStatus) => {
  if (!selectedStatus) return true;
  if (selectedStatus === 'ACTIVE') return resourceStatus === 'ACTIVE' || resourceStatus === 'AVAILABLE';
  return resourceStatus === selectedStatus;
};

const ResourcesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedResource, setSelectedResource] = useState(null);
  const [bookingResource, setBookingResource] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchResources = useCallback(async () => {
    if (!selectedCategory) return;

    setLoading(true);
    try {
      const data = await resourceService.getAllResources({ category: selectedCategory.id });
      setResources(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to retrieve campus resources.');
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

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

  const handleBookResource = (resource) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setSelectedResource(null);
    setBookingResource(resource);
  };

  const visibleCategories = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    if (!query || selectedCategory) return CATEGORIES;
    return CATEGORIES.filter((category) => `${category.name} ${category.desc}`.toLowerCase().includes(query));
  }, [filters.search, selectedCategory]);

  const typeOptions = useMemo(() => {
    return [...new Set(resources.map((resource) => resource.type).filter(Boolean))].sort();
  }, [resources]);

  const visibleResources = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    return resources.filter((resource) => {
      const searchable = [
        resource.name,
        resource.category,
        resource.type,
        resource.location,
        resource.capacity,
        resource.status
      ]
        .filter((value) => value !== null && value !== undefined)
        .join(' ')
        .toLowerCase();

      const matchesSearch = !query || searchable.includes(query);
      const matchesType = !filters.type || resource.type === filters.type;
      const matchesLocation = !filters.location || resource.location?.toLowerCase().includes(filters.location.toLowerCase());
      const matchesCapacity = !filters.minCapacity || Number(resource.capacity || 0) >= Number(filters.minCapacity);

      return matchesSearch && matchesType && matchesStatus(resource.status, filters.status) && matchesLocation && matchesCapacity;
    });
  }, [filters, resources]);

  const activeFilterCount = [filters.type, filters.minCapacity, filters.location, filters.status, filters.search].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <main className="mx-auto max-w-7xl px-6 py-8">
        {!selectedCategory ? (
          <>
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-3xl font-black tracking-normal text-slate-950">Resource categories</h2>
                <p className="mt-2 text-sm font-medium text-slate-600">Choose a category to view matching resources and availability actions.</p>
              </div>
              <label htmlFor="category-search" className="mb-0 w-full lg:max-w-md">
                <span className="sr-only">Search resource categories</span>
                <div className="relative">
                  <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="category-search"
                    type="text"
                    placeholder="Search resource categories"
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    className="!h-12 !rounded-xl !border-slate-200 !bg-white !py-0 !pl-11 !pr-4 !text-sm !font-semibold !text-slate-900 shadow-sm placeholder:!text-slate-400 focus:!border-blue-500 focus:!shadow-sm"
                  />
                </div>
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {visibleCategories.map((category) => (
                <ResourceCategoryCard key={category.id} category={category} onSelect={handleCategorySelect} />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-3xl font-black leading-tight tracking-normal text-slate-950 sm:text-4xl">{selectedCategory.name}</h2>
                  <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-slate-600">{selectedCategory.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={handleBackToCategories}
                  className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-black uppercase tracking-normal text-blue-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-blue-50 hover:text-blue-900"
                >
                  <ArrowLeft size={18} />
                  Back
                </button>
              </div>
            </div>

            <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <label className="mb-0">
                  <span className="mb-2 block text-xs font-black uppercase tracking-normal text-slate-600">Type</span>
                  <select value={filters.type} onChange={(e) => updateFilter('type', e.target.value)} className="!h-11 !rounded-xl !border-slate-300 !bg-white !py-0 !px-4 !text-sm !font-semibold !text-slate-900 focus:!border-blue-500 focus:!shadow-sm">
                    <option value="">All types</option>
                    {typeOptions.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
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
            ) : visibleResources.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onView={setSelectedResource}
                    onBook={handleBookResource}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center shadow-sm">
                <Users className="mx-auto mb-5 text-slate-300" size={46} />
                <h3 className="text-2xl font-black tracking-normal text-slate-900">
                  {resources.length === 0 ? 'No resources found' : 'No matching resources'}
                </h3>
                <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-6 text-slate-600">
                  {resources.length === 0 ? 'Try selecting another resource category.' : 'Try changing the type, location, status, or capacity filters.'}
                </p>
                <button type="button" onClick={resources.length === 0 ? handleBackToCategories : clearFilters} className="mt-6 inline-flex items-center gap-2 text-sm font-black uppercase tracking-normal text-blue-700">
                  {resources.length === 0 ? 'Back to categories' : 'Clear filters'}
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
            handleBookResource(selectedResource);
          }}
        />
      )}

      {bookingResource && (
        <ResourceBookingModal
          resource={bookingResource}
          onClose={() => setBookingResource(null)}
        />
      )}
    </div>
  );
};

export default ResourcesPage;
