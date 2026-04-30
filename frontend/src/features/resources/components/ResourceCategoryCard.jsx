import { motion as Motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const ResourceCategoryCard = ({ category, variants, onSelect }) => (
  <Motion.div
    layout
    variants={variants}
    whileHover={{ y: -10 }}
    onClick={() => onSelect(category)}
    className="p-10 glass-heavy bg-white/70 rounded-[3rem] border border-white transition-all cursor-pointer group hover:bg-slate-900"
  >
    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 mb-8 transition-all group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white shadow-lg">
      {category.icon}
    </div>
    <h3 className="text-2xl font-bold mb-4 group-hover:text-white transition-colors">{category.name}</h3>
    <p className="text-sm font-medium opacity-60 leading-relaxed mb-8 group-hover:text-white/60 transition-colors">
      {category.desc}
    </p>
    <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-300 group-hover:border-white/20 group-hover:text-white group-hover:translate-x-2 transition-all">
      <ChevronRight size={18} />
    </div>
  </Motion.div>
);

export default ResourceCategoryCard;
