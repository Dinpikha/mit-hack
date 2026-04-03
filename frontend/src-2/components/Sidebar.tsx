import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/src/hooks/useAuth';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  Hospital, 
  BookOpen, 
  Users, 
  Settings, 
  LogOut,
  ChevronRight,
  Activity
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const Sidebar: React.FC = () => {
  const { profile, logout } = useAuth();
  const location = useLocation();

  if (!profile) return null;

  const userLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/request', label: 'New Request', icon: PlusCircle },
    { to: '/hospitals', label: 'Hospitals', icon: Hospital },
    { to: '/first-aid', label: 'First Aid', icon: BookOpen },
    { to: '/contacts', label: 'Emergency Contacts', icon: Users },
    { to: '/history', label: 'History', icon: History },
  ];

  const ambulanceLinks = [
    { to: '/ambulance/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/hospitals', label: 'Hospitals', icon: Hospital },
    { to: '/history', label: 'History', icon: History },
  ];

  const links = profile.role === 'ambulance' ? ambulanceLinks : userLinks;

  return (
    <div className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 h-[calc(100vh-64px)] sticky top-16">
      <div className="flex-1 py-6 px-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600")} />
                {link.label}
              </div>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all mb-2"
        >
          <Settings className="w-5 h-5 text-slate-400" />
          Settings
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
