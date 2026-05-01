import { ChevronRight } from 'lucide-react';

const ResourceCategoryCard = ({ category, onSelect }) => {
  const Icon = category.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(category)}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={category.img}
          alt={category.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-transparent" />
        <div className="absolute left-5 top-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-700 shadow-md">
          <Icon size={23} />
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-2xl font-black leading-tight tracking-normal text-slate-950">{category.name}</h3>
        <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{category.desc}</p>

        <div className="mt-6 inline-flex items-center gap-2 text-sm font-black uppercase tracking-normal text-blue-700">
          View resources
          <ChevronRight size={17} className="transition group-hover:translate-x-1" />
        </div>
      </div>
    </button>
  );
};

export default ResourceCategoryCard;
