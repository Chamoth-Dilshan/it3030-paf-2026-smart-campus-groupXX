import React, { useState, useEffect, useCallback } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Building2, 
  Microscope, 
  Zap, 
  Users, 
  GraduationCap, 
  Sparkles,
  ArrowLeft,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import resourceService from '../services/resourceService';
import toast from 'react-hot-toast';
import ResourceCard from '../components/ResourceCard';
import ResourceCategoryCard from '../components/ResourceCategoryCard';
import ResourceDetailsModal from '../components/ResourceDetailsModal';

const ResourcesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const CATEGORIES = [
    { id: 'Auditorium', name: "Auditoriums", icon: <Building2 />, desc: "High-capacity venues for symposiums and major events.", img: "https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?q=80&w=1200" },
    { id: 'Laboratory', name: "Labs & Research", icon: <Microscope />, desc: "State-of-the-art facilities for technical and scientific research.", img: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=1200" },
    { id: 'Equipment', name: "Assets & Tools", icon: <Zap />, desc: "Specialized equipment and devices for academic projects.", img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200" },
    { id: 'Classroom', name: "Classrooms", icon: <GraduationCap />, desc: "Modern learning environments with smart infrastructure.", img: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1200" },
    { id: 'Sports', name: "Sports Facilities", icon: <Activity />, desc: "Professional athletic grounds and indoor sports arenas.", img: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200" }
  ];

  const [filters, setFilters] = useState({
    type: '',
    minCapacity: '',
    location: '',
    status: '',
    search: ''
  });
  const [selectedResource, setSelectedResource] = useState(null);
  const navigate = useNavigate();

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const activeFilters = { ...filters };
      if (selectedCategory) activeFilters.category = selectedCategory.id;
      
      const data = await resourceService.getAllResources(activeFilters);
      setResources(data);
    } catch {
      toast.error("Failed to retrieve campus assets.");
    } finally {
      setLoading(false);
    }
  }, [filters, selectedCategory]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleSearchChange = (val) => {
    setFilters(prev => ({ ...prev, search: val }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      minCapacity: '',
      location: '',
      status: '',
      search: ''
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-40 pb-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-slate-50/20 backdrop-blur-[1px] pointer-events-none" />
      
      {/* Vibrant Colorful Background Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.15] pointer-events-none"
        style={{ 
          backgroundImage: 'url("/backgrounds/colorful-campus.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      <div className="grain-overlay" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <AnimatePresence mode="wait">
          {!selectedCategory ? (
            <Motion.div
              key="categories"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.4 }}
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20">
                <div className="max-w-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles size={16} className="text-blue-600" />
                    <span className="text-blue-600 font-black tracking-widest uppercase text-[11px] block underline underline-offset-8 decoration-blue-200">Campus Asset Registry</span>
                  </div>
                  <h1 className="text-7xl font-bold text-slate-900 leading-tight mb-8">World-Class <br />Infrastructure.</h1>
                  <p className="text-lg text-slate-500 font-medium leading-relaxed">
                    Explore our architectural and technical landmarks across the distributed campus network. Our facilities are engineered for the highest academic excellence.
                  </p>
                </div>
                
                {/* Global Search in Category View */}
                <div className="flex items-center gap-4 glass-heavy bg-white/70 p-2 rounded-3xl border border-white/40 shadow-xl self-start md:self-end">
                  <div className="px-6 h-12 flex items-center gap-3 min-w-[320px]">
                    <Search size={16} className="text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Interrogate Global Registry..." 
                      className="text-[10px] font-black uppercase tracking-widest text-slate-900 bg-transparent outline-none w-full placeholder:text-slate-300"
                      value={filters.search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Grid */}
              <Motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {CATEGORIES.map((cat) => (
                  <ResourceCategoryCard
                    key={cat.id}
                    category={cat}
                    variants={itemVariants}
                    onSelect={setSelectedCategory}
                  />
                ))}
              </Motion.div>
            </Motion.div>
          ) : (
            <Motion.div
              key="resources"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Resource View Header */}
              <div className="mb-12">
                <button
                  onClick={() => { setSelectedCategory(null); clearFilters(); }}
                  className="flex items-center gap-3 text-blue-600 font-black tracking-widest uppercase text-[11px] mb-8 group"
                >
                  <div className="w-8 h-8 rounded-full border border-blue-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all mr-2">
                    <ArrowLeft size={14} />
                  </div>
                  Back to Categories
                </button>
                <div className="flex flex-col gap-8 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-6">
                    <div>
                      <h2 className="text-6xl font-bold text-slate-900 leading-tight mb-4">{selectedCategory.name}</h2>
                      <p className="text-lg text-slate-500 font-medium max-w-2xl">{selectedCategory.desc}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 glass-heavy bg-white/70 p-2 rounded-3xl border border-white/40 shadow-xl">
                      <div className="px-6 h-12 flex items-center gap-3 min-w-[280px]">
                        <Search size={16} className="text-slate-400" />
                        <input 
                          type="text" 
                          placeholder={`Search in ${selectedCategory.name}...`} 
                          className="text-[10px] font-black uppercase tracking-widest text-slate-900 bg-transparent outline-none w-full"
                          value={filters.search}
                          onChange={(e) => handleSearchChange(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Operational Filters */}
                  <div className="flex flex-wrap gap-4 items-center">
                    <select 
                      value={filters.type}
                      onChange={(e) => setFilters({...filters, type: e.target.value})}
                      className="bg-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 border border-slate-200 outline-none hover:border-indigo-200 transition-all cursor-pointer shadow-sm"
                    >
                      <option value="">All Types</option>
                      <option value="ROOM">Institutional Room</option>
                      <option value="HALL">Grand Hall / Venue</option>
                      <option value="PROJECTOR">Digital Projector</option>
                      <option value="CAMERA">Surveillance / Camera</option>
                      <option value="INDOOR">Indoor Facility</option>
                      <option value="OUTDOOR">Outdoor Ground</option>
                    </select>

                    <select 
                      value={filters.status}
                      onChange={(e) => setFilters({...filters, status: e.target.value})}
                      className="bg-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 border border-slate-200 outline-none hover:border-indigo-200 transition-all cursor-pointer shadow-sm"
                    >
                      <option value="">Any Status</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="OUT_OF_SERVICE">OUT OF SERVICE</option>
                    </select>

                    <div className="relative">
                       <MapPin size={12} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                       <input 
                        type="text"
                        placeholder="Spatial Coord..."
                        value={filters.location}
                        onChange={(e) => setFilters({...filters, location: e.target.value})}
                        className="bg-white pl-12 pr-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 border border-slate-200 outline-none w-48 shadow-sm focus:border-blue-200 transition-all"
                      />
                    </div>

                    <div className="relative">
                      <Users size={12} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        type="number"
                        placeholder="Min Threshold"
                        value={filters.minCapacity}
                        onChange={(e) => setFilters({...filters, minCapacity: e.target.value})}
                        className="bg-white pl-12 pr-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 border border-slate-200 outline-none w-44 shadow-sm focus:border-blue-200 transition-all"
                      />
                    </div>

                    {(filters.type || filters.status || filters.minCapacity || filters.location || filters.search) && (
                      <button 
                        onClick={clearFilters}
                        className="text-[10px] font-black text-rose-600 uppercase tracking-widest px-4 py-2 hover:bg-rose-50 rounded-xl transition-all ml-2"
                      >
                        Reset Matrix
                      </button>
                    )}
                  </div>
                </div>
              </div>


              {/* Resource Cards */}
              {loading ? (
                <div className="py-40 text-center">
                  <Motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="inline-block p-4 rounded-3xl bg-white shadow-xl"
                  >
                    <Sparkles className="text-blue-600" size={32} />
                  </Motion.div>
                  <p className="mt-6 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Retrieving Resources...</p>
                </div>
              ) : resources.length > 0 ? (
                <Motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {resources.map((resource) => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      variants={itemVariants}
                      onView={setSelectedResource}
                    />
                  ))}
                </Motion.div>
              ) : (
                <div className="py-40 text-center bg-white/40 rounded-[4rem] border border-dashed border-slate-200">
                   <Users className="mx-auto text-slate-200 mb-6" size={48} />
                   <h3 className="text-2xl font-bold text-slate-400">No resources found in this category.</h3>
                   <button onClick={() => setSelectedCategory(null)} className="mt-6 text-indigo-600 font-black uppercase tracking-widest text-[10px]">Back to Categories</button>
                </div>
              )}
            </Motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Resource Details Modal */}
      <AnimatePresence>
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
      </AnimatePresence>
    </div>
  );
};

export default ResourcesPage;
