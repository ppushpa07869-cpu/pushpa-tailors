import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Scissors, Users, BarChart2, Settings, Bell } from 'lucide-react';
import { auth } from '../../services/firebase';
import { signOut } from 'firebase/auth';
import NotificationCenter from './NotificationCenter';

interface SidebarProps {
  notificationCount?: number;
}

export default function Sidebar({ notificationCount = 0 }: SidebarProps) {
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      isActive
        ? 'bg-primary text-white shadow-lg shadow-primary/25'
        : 'text-gray-300 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <>
      <div className="w-64 bg-gradient-to-b from-gray-950 to-gray-900 text-white h-screen fixed top-0 left-0 flex flex-col border-r border-gray-800/50 z-30">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <Scissors className="text-primary h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-xl tracking-widest text-white leading-none">PUSHPA</span>
              <span className="font-sans font-medium text-[10px] tracking-[0.3em] text-primary/80 mt-0.5">TAILORS ADMIN</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6 px-4 overflow-y-auto">
          <nav className="space-y-1.5">
            <NavLink to="/admin/dashboard" className={navLinkClass}>
              <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium tracking-wide">Dashboard</span>
            </NavLink>

            <NavLink to="/admin/customers" className={navLinkClass}>
              <Users className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium tracking-wide">Customers</span>
            </NavLink>

            <NavLink to="/admin/reports" className={navLinkClass}>
              <BarChart2 className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium tracking-wide">Reports</span>
            </NavLink>

            <NavLink to="/admin/settings" className={navLinkClass}>
              <Settings className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium tracking-wide">Settings</span>
            </NavLink>
          </nav>
        </div>

        {/* Notifications bell */}
        <div className="px-4 pb-2">
          <button
            onClick={() => setNotificationsOpen(true)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium tracking-wide">Notifications</span>
            </div>
            {notificationCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-sm animate-pulse">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium tracking-wide">Logout</span>
          </button>
        </div>
      </div>

      {/* Notification Center Panel */}
      <NotificationCenter
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </>
  );
}
