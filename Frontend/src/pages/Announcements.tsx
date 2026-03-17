import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import AnnouncementModal from '../components/UI/AnnouncementModal';
import { Radio, Building2, HeadphonesIcon, Plus } from 'lucide-react';
import type { Announcement } from '../types';

const scopeNames: Record<number, string> = {
  1: 'Site Geneli',
  2: 'Blok Duyurusu',
  3: 'Personel İletisi',
};

const scopeConfig: Record<number, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  1: { color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-l-primary', icon: <Radio size={20} /> },
  2: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-l-emerald-500', icon: <Building2 size={20} /> },
  3: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-l-amber-500', icon: <HeadphonesIcon size={20} /> },
};

const Announcements = () => {
  const { user } = useAuthStore();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) fetchAnnouncements();
  }, [user]);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get(`/announcement?viewerRole=${user?.role}&blockId=${user?.blockId || ''}`);
      setAnnouncements(response.data);
    } catch {
      console.error('Duyuru yükleme hatası');
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = announcements.filter((a) => {
    if (filter === 'all') return true;
    return a.scope.toString() === filter;
  });

  if (loading) return <div className="p-8 text-slate-400">Yükleniyor...</div>;

  const selectClass =
    'rounded-xl border border-white/10 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20';

  return (
    <section className="animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Duyurular</h1>
          <p className="mt-1 text-sm text-slate-400">Site ve blok bilgilendirmeleri.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className={selectClass}>
            <option value="all">Tüm Duyurular</option>
            <option value="1">Site Geneli Gönderiler</option>
            <option value="2">Blok Duyuruları</option>
            <option value="3">Görevli Personel İletileri</option>
          </select>
          {(user?.role === 1 || user?.role === 2 || user?.role === 3) && (
            <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:bg-primary-hover">
              <Plus size={16} /> Yeni Duyuru
            </button>
          )}
        </div>
      </div>

      {user && (
        <AnnouncementModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchAnnouncements}
          userId={user.id}
          role={user.role}
          blockId={user.blockId}
        />
      )}

      {/* Feed */}
      <div className="space-y-5">
        {filteredAnnouncements.length === 0 ? (
          <p className="text-sm text-slate-400">Duyuru bulunmamaktadır.</p>
        ) : (
          filteredAnnouncements.map((a) => {
            const cfg = scopeConfig[a.scope] || scopeConfig[1];
            return (
              <div
                key={a.id}
                className={`rounded-2xl border border-white/10 border-l-4 ${cfg.border} bg-surface p-6 backdrop-blur-xl transition hover:translate-x-1 hover:shadow-lg`}
              >
                <div className="mb-4 flex items-start gap-3">
                  <div className={`rounded-full p-2 ${cfg.bg} ${cfg.color}`}>{cfg.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold">{a.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-slate-400">{a.date}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold ${cfg.bg} ${cfg.color}`}>
                        {scopeNames[a.scope] || (a.blockName ? a.blockName : 'Duyuru')}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{a.content}</p>
                <div className="mt-4 border-t border-white/5 pt-4 text-xs text-slate-400">
                  Gönderen: <strong className="text-slate-300">{a.createdBy || 'Sistem'}</strong>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default Announcements;
