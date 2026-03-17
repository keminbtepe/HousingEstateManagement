import { useAuthStore, Role } from '../../store/authStore';
import {
  LayoutDashboard,
  Vote,
  Wallet,
  Bell,
  Users,
  Building2,
  Building,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  dashboard: <LayoutDashboard size={20} />,
  elections: <Vote size={20} />,
  financials: <Wallet size={20} />,
  announcements: <Bell size={20} />,
  residents: <Users size={20} />,
  'block-management': <Building2 size={20} />,
};

const Sidebar = ({ currentView, onViewChange, isOpen, onClose }: SidebarProps) => {
  const { user } = useAuthStore();

  const navItems = [
    { id: 'dashboard', label: 'Özet' },
    { id: 'elections', label: 'Oylama & Seçim' },
    { id: 'financials', label: 'Aidat & Finans' },
    { id: 'announcements', label: 'Duyurular' },
    { id: 'residents', label: 'Site Sakinleri' },
  ];

  if (user?.role === Role.SiteManager) {
    navItems.splice(4, 0, { id: 'block-management', label: 'Bloklar' });
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-white/10 bg-slate-950/90 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex h-[70px] items-center gap-3 border-b border-white/10 px-6">
          <Building className="text-primary" size={24} />
          <h2 className="text-lg font-semibold tracking-tight">Sinerji</h2>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                {iconMap[item.id]}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
