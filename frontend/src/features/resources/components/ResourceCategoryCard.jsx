import { ChevronRight } from 'lucide-react';

const ResourceCategoryCard = ({ category, onSelect }) => {
  const Icon = category.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(category)}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-40 overflow-hidden bg-slate-100">
        <img
          src={category.img}
          alt={category.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-transparent" />
        <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-700 shadow-md">
          <Icon size={20} />
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-black leading-tight tracking-normal text-slate-950">{category.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-slate-600">{category.desc}</p>

        <div className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-normal text-blue-700">
          View resources
          <ChevronRight size={15} className="transition group-hover:translate-x-1" />
        </div>
      </div>
    </button>
  );
};

export default ResourceCategoryCard;
