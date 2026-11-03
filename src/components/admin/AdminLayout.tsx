import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import { dashboardService } from '../../services/dashboardService';

export default function AdminLayout() {
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    dashboardService.getDashboardData()
      .then(data => setNotificationCount(data.notifications.length))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar notificationCount={notificationCount} />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <DashboardHeader />
        <main className="p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
