import { useAuth } from '../../contexts/AuthContext';
import { Scissors } from 'lucide-react';

export default function DashboardHeader() {
  const { currentUser } = useAuth();

  return (
    <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-2">
        <Scissors className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-gray-500 tracking-widest uppercase">Order Book</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end">
          <span className="text-sm font-semibold text-gray-800">{currentUser?.email?.split('@')[0] || 'Admin'}</span>
          <span className="text-xs text-gray-400 font-medium">Administrator</span>
        </div>
        <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
          {currentUser?.email?.[0]?.toUpperCase() || 'A'}
        </div>
      </div>
    </header>
  );
}
