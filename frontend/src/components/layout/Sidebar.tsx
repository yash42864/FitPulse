import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Footprints,
  Utensils,
  Dumbbell,
  Moon,
  Droplets,
  Scale,
  Target,
  BarChart3,
  Settings,
  Flame,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/activity', label: 'Activity & Steps', icon: Footprints },
  { to: '/nutrition', label: 'Nutrition', icon: Utensils },
  { to: '/workouts', label: 'Workouts', icon: Dumbbell },
  { to: '/sleep', label: 'Sleep Tracker', icon: Moon },
  { to: '/hydration', label: 'Hydration', icon: Droplets },
  { to: '/measurements', label: 'Measurements', icon: Scale },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/analytics', label: 'Advanced Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-[#151B2B] border-r border-[#273349] flex flex-col',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-6 border-b border-[#273349]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-lime-accent to-[#65a30d] flex items-center justify-center text-dark-bg font-black text-xl shadow-glow-lime shrink-0">
            <Flame className="w-6 h-6 text-dark-bg fill-dark-bg" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
                Fit<span className="text-lime-accent">Pulse</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                Intelligence Platform
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors hidden lg:flex"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-lime-accent/15 text-lime-accent font-semibold border border-lime-accent/30 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-[#1C2435]'
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} className="shrink-0 transition-transform group-hover:scale-110" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / System Status */}
      <div className="p-4 border-t border-[#273349]">
        {!collapsed ? (
          <div className="bg-[#1C2435] rounded-xl p-3 border border-[#273349] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-gray-300">MongoDB Online</span>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">v1.0</span>
          </div>
        ) : (
          <div className="flex justify-center" title="MongoDB Online">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
};
