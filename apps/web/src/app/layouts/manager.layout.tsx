import { cn } from '@/lib/utils';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/employee/manager', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/employee/manager/employees', icon: Users, label: 'Employees' },
  { to: '/employee/manager/meals', icon: UtensilsCrossed, label: 'Meals' },
  { to: '/employee/manager/menu-periods', icon: Calendar, label: 'Menu Periods' },
  { to: '/employee/manager/change-requests', icon: ClipboardList, label: 'Change Requests' },
];

export default function ManagerLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className='flex h-full'>
      <aside
        className={cn(
          'flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-[width] duration-300 overflow-hidden shrink-0',
          collapsed ? 'w-14' : 'w-56',
        )}
      >
        <div className='flex items-center border-b border-sidebar-border h-12 px-2'>
          {!collapsed && (
            <span className='flex-1 text-sm font-semibold text-sidebar-foreground/80 truncate pl-1'>
              Manager
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className='ml-auto p-1.5 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors'
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className='flex-1 py-2 flex flex-col gap-0.5 px-1.5'>
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-2.5 py-2 rounded-md transition-colors text-sm font-medium',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                )
              }
            >
              <Icon size={16} className='shrink-0' />
              {!collapsed && <span className='truncate'>{label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className='flex-1 overflow-auto'>
        <Outlet />
      </div>
    </div>
  );
}
