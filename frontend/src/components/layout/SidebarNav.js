import { NavLink } from 'react-router-dom';

export const SidebarNav = ({ navSections, activeSection, collapsed }) => (
  <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto scrollbar-hide" data-testid="sidebar-nav">
    {navSections.map((section) => (
      <div key={section.id} className="mb-1">
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-[7px] mb-[2px]">
            <div className={`w-[16px] h-[16px] rounded-[4px] flex items-center justify-center bg-gradient-to-br ${section.badgeGrad}`}>
              <section.badge />
            </div>
            <span className={`text-[9px] font-extrabold uppercase tracking-[0.16em] transition-colors ${activeSection === section.id ? 'text-foreground/70' : 'text-muted-foreground/35'}`}>{section.label}</span>
          </div>
        )}
        {section.items.map((item) => (
          <NavLink key={item.path} to={item.path} data-testid={`nav-${item.path.replace('/', '')}`}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-[8px] rounded-[10px] text-[13px] font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[#BFFF00]/[0.07] dark:bg-[#BFFF00]/[0.06] text-[#4A6200] dark:text-[#BFFF00] font-semibold border-l-2 border-[#6B8A00] dark:border-[#BFFF00]'
                  : 'text-gray-400 dark:text-muted-foreground/60 hover:text-gray-600 dark:hover:text-foreground/80 hover:bg-gray-50/50 dark:hover:bg-white/[0.02]'
              } ${collapsed ? 'justify-center px-2' : ''}`
            }>
            <item.icon size={16} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </div>
    ))}
  </nav>
);
