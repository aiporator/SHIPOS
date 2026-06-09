import { CATEGORIES } from './communityConstants';

export const CommunityFilters = ({ category, setCategory, de }) => (
  <div className="flex gap-2 mb-5 overflow-x-auto pb-1" data-testid="category-filter">
    {CATEGORIES.map(c => {
      const Icon = c.icon;
      const active = category === c.id;
      return (
        <button key={c.id} onClick={() => setCategory(c.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${active
            ? 'bg-[#0A0A0A] text-white dark:bg-[#BFFF00] dark:text-[#0A0A0A]'
            : 'bg-white dark:bg-card border border-black/[0.06] dark:border-white/[0.06] text-muted-foreground hover:text-foreground'}`}
          data-testid={`filter-${c.id}`}>
          <Icon size={12} /> {de ? c.label_de : c.label_en}
        </button>
      );
    })}
  </div>
);
