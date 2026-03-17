import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Dashboard from '../../pages/Dashboard';
import Elections from '../../pages/Elections';
import Financials from '../../pages/Financials';
import Announcements from '../../pages/Announcements';
import Residents from '../../pages/Residents';
import BlockManagement from '../../pages/BlockManagement';

const MainLayout = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [residentBlockFilter, setResidentBlockFilter] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleViewChange = (view: string, filter?: string) => {
    setCurrentView(view);
    // If a filter is explicitly provided (from BlockManagement), use it.
    // Othewise, reset it (navigation from Sidebar).
    setResidentBlockFilter(filter || null);
    setIsSidebarOpen(false);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'elections': return <Elections />;
      case 'financials': return <Financials />;
      case 'announcements': return <Announcements />;
      case 'residents': return <Residents initialBlockFilter={residentBlockFilter} />;
      case 'block-management': return <BlockManagement onViewChange={handleViewChange} />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-50">
      <Sidebar 
        currentView={currentView} 
        onViewChange={handleViewChange} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="flex flex-1 flex-col lg:ml-64">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        <div className="flex-1 p-4 lg:p-8">{renderView()}</div>
      </main>
    </div>
  );
};

export default MainLayout;
