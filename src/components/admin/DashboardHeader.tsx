import { useAuth } from '../../contexts/AuthContext';

export default function DashboardHeader() {
  const { currentUser } = useAuth();

  return (
    <header className="bg-white h-20 border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div>
        <h2 className="text-xl font-serif text-primary tracking-wide">Admin Portal</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-sm font-semibold text-gray-800">{currentUser?.email || 'Admin'}</span>
          <span className="text-xs text-gray-500 font-medium">Administrator</span>
        </div>
        <div className="h-10 w-10 bg-secondary/20 rounded-full flex items-center justify-center text-primary font-bold">
          A
        </div>
      </div>
    </header>
  );
}
