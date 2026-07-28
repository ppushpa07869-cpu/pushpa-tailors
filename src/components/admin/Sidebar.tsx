import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Scissors, Users, ShoppingBag, CreditCard } from 'lucide-react';
import { auth } from '../../services/firebase';
import { signOut } from 'firebase/auth';

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div className="w-64 bg-black text-white h-screen fixed top-0 left-0 flex flex-col border-r-2 border-primary">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Scissors className="text-secondary h-8 w-8" />
          <div className="flex flex-col">
            <span className="font-serif font-bold text-xl tracking-widest text-white leading-none">PUSHPA</span>
            <span className="font-sans font-medium text-[10px] tracking-[0.3em] text-secondary">ADMIN</span>
          </div>
        </div>
      </div>

      <div className="flex-1 py-6 px-4">
        <nav className="space-y-2">
          <NavLink 
            to="/admin/dashboard" 
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${isActive ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="font-medium tracking-wide">Dashboard</span>
          </NavLink>
          <NavLink 
            to="/admin/customers" 
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${isActive ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
          >
            <Users className="h-5 w-5" />
            <span className="font-medium tracking-wide">Customers</span>
          </NavLink>
          <NavLink 
            to="/admin/orders" 
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${isActive ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="font-medium tracking-wide">Orders</span>
          </NavLink>
          <NavLink 
            to="/admin/payments" 
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${isActive ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
          >
            <CreditCard className="h-5 w-5" />
            <span className="font-medium tracking-wide">Payments</span>
          </NavLink>
        </nav>
      </div>

      <div className="p-4 border-t border-gray-800">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-300 hover:bg-red-900/50 hover:text-white rounded-sm transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium tracking-wide">Logout</span>
        </button>
      </div>
    </div>
  );
}
