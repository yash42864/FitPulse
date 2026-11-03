import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, LogOut, User as UserIcon, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface NavbarProps {
  onMobileMenuToggle: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onMobileMenuToggle,
  onRefresh,
  isRefreshing = false,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0B0F19]/80 backdrop-blur-md border-b border-[#273349] px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-[#151B2B] border border-[#273349] px-3 py-1.5 rounded-lg text-gray-400">
          <span className="w-2 h-2 rounded-full bg-lime-accent" />
          <span>Sync: MERN Live</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            isLoading={isRefreshing}
            title="Refresh database records"
            className="text-xs"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        )}

        {/* User Card & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-[#273349]">
          <div className="w-8 h-8 rounded-full bg-violet-accent/20 border border-violet-accent/40 flex items-center justify-center text-violet-300 font-bold text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={16} />}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-sm font-semibold text-white leading-tight">{user?.name || 'Athlete'}</span>
            <span className="text-[11px] text-gray-400 leading-tight capitalize">
              {user?.fitnessGoal?.replace('_', ' ') || 'General Fitness'}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
            title="Sign Out"
          >
            <LogOut size={18} />
          </Button>
        </div>
      </div>
    </header>
  );
};
