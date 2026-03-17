import { useAuthStore } from '../../store/authStore';
import { LogOut, User, Menu } from 'lucide-react';

interface TopbarProps {
  onMenuClick: () => void;
}

const Topbar = ({ onMenuClick }: TopbarProps) => {
  const { user, logout } = useAuthStore();

  const displayName = user
    ? user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.fullName
    : 'Yükleniyor...';

  return (
    <header className="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b border-white/10 bg-slate-900/70 px-4 backdrop-blur-xl lg:justify-end lg:px-8">
      {/* Mobile Menu Toggle */}
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white lg:hidden"
      >
        <Menu size={24} />
      </button>

      <div className="flex items-center gap-4 rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
          <User size={16} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-tight">{displayName}</span>
          <span className="inline-block rounded-full bg-primary/20 px-2 py-0.5 text-[0.65rem] font-semibold text-indigo-300">
            {user?.roleName || 'Rol'}
          </span>
        </div>
        <button
          id="btn-logout"
          onClick={logout}
          className="ml-2 rounded-full p-1.5 text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
          title="Çıkış Yap"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
