import { useEffect, useState } from 'react';
import { useAuthStore, Role } from '../store/authStore';
import api from '../services/api';
import { Search } from 'lucide-react';
import type { BlockSummary } from '../types';

interface BlockManagementProps {
  onViewChange?: (view: string, filter?: string) => void;
}

const BlockManagement = ({ onViewChange }: BlockManagementProps) => {
  const { user } = useAuthStore();
  const [summaries, setSummaries] = useState<BlockSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const response = await api.get('/dashboard/block-summaries');
        setSummaries(response.data);
      } catch {
        console.error('Blok özetleri hatası');
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === Role.SiteManager) fetchSummaries();
  }, [user]);

  if (user?.role !== Role.SiteManager) return <div className="p-8 text-slate-400">Yetkiniz yok.</div>;
  if (loading) return <div className="p-8 text-slate-400">Yükleniyor...</div>;

  return (
    <section className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Blok Yönetimi (Sadece Site Yöneticisi)</h1>
        <p className="mt-1 text-sm text-slate-400">Tüm blokların mali durumu, yöneticileri ve oturan üye sayıları.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-surface p-6 backdrop-blur-xl">
        <h3 className="mb-4 text-lg font-semibold">Blok Özetleri</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">Blok Adı</th>
                <th className="px-4 py-3">Blok Yöneticisi</th>
                <th className="px-4 py-3">Toplam Daire</th>
                <th className="px-4 py-3">Aktif Sakinler</th>
                <th className="px-4 py-3">Kasa Bakiyesi</th>
                <th className="px-4 py-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((b) => (
                <tr key={b.blockId} className="border-b border-white/5 transition hover:bg-white/2">
                  <td className="px-4 py-3 font-semibold">{b.blockName}</td>
                  <td className="px-4 py-3">{b.managerName || 'Seçilmedi'}</td>
                  <td className="px-4 py-3">{b.totalApartments}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onViewChange?.('residents', b.blockId.toString())}
                      className="rounded-full bg-primary/10 px-3 py-1 font-bold text-primary transition hover:bg-primary/20 hover:scale-105"
                      title="Sakinleri Gör"
                    >
                      {b.activeResidents}
                    </button>
                  </td>
                  <td className={`px-4 py-3 font-semibold ${b.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {b.balance.toLocaleString('tr-TR')} ₺
                  </td>
                  <td className="px-4 py-3">
                    <button className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium transition hover:bg-white/10">
                      Detay <Search size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default BlockManagement;
