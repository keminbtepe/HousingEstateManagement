import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { Search } from 'lucide-react';
import type { Resident, Block } from '../types';

const roleNames: Record<number, string> = {
  1: 'Site Yöneticisi',
  2: 'Yönetici Yrd.',
  3: 'Blok Yöneticisi',
  4: 'Ev Sahibi',
  5: 'Kiracı',
  6: 'Site Görevlisi',
  7: 'Bina Görevlisi',
};

const badgeColors: Record<string, string> = {
  manager: 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/20',
  owner: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/20',
  tenant: 'bg-amber-500/20 text-amber-300 border border-amber-400/20',
};

interface ResidentsProps {
  initialBlockFilter?: string | null;
}

const Residents = ({ initialBlockFilter }: ResidentsProps) => {
  const { user } = useAuthStore();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [blockFilter, setBlockFilter] = useState(initialBlockFilter || 'all');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  useEffect(() => {
    setBlockFilter(initialBlockFilter || 'all');
  }, [initialBlockFilter]);

  const fetchData = async () => {
    try {
      const [resData, blockData] = await Promise.all([api.get('/users'), api.get('/blocks')]);
      setResidents(resData.data);
      setBlocks(blockData.data);
    } catch {
      console.error('Sakin listesi hatası');
    } finally {
      setLoading(false);
    }
  };

  const filteredResidents = residents.filter((r) => {
    const displayName = r.fullName || `${r.firstName || ''} ${r.lastName || ''}`;
    const rName = roleNames[r.role] || r.roleName || '';
    const searchMatch = (displayName + ' ' + rName).toLowerCase().includes(search.toLowerCase());

    let blockMatch = true;
    if (blockFilter === 'site-management') blockMatch = r.role === 1 || r.role === 2 || r.role === 6;
    else if (blockFilter !== 'all') blockMatch = r.blockId?.toString() === blockFilter;

    let roleMatch = true;
    if (roleFilter === 'owner') roleMatch = r.role === 4;
    else if (roleFilter === 'tenant') roleMatch = r.role === 5;
    else if (roleFilter === 'block_manager') roleMatch = r.role === 3;
    else if (roleFilter === 'staff') roleMatch = r.role === 6 || r.role === 7;

    return searchMatch && blockMatch && roleMatch;
  });

  const getBadge = (role: number) => {
    if (role <= 3) return badgeColors.manager;
    if (role === 4) return badgeColors.owner;
    return badgeColors.tenant;
  };

  if (loading) return <div className="p-8 text-slate-400">Yükleniyor...</div>;

  const selectClass =
    'rounded-xl border border-white/10 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20';

  return (
    <section className="animate-fade-in">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Site Sakinleri</h1>
          <p className="mt-1 text-sm text-slate-400">Siteye kayıtlı tüm sakinleri ve personelleri görüntüleyin.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="İsim veya görev ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${selectClass} min-w-[200px] pl-9`}
            />
          </div>
          <select value={blockFilter} onChange={(e) => setBlockFilter(e.target.value)} className={selectClass}>
            <option value="all">Tüm Bloklar</option>
            <option value="site-management">Site Yönetimi (Ekip & Personel)</option>
            {blocks.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={selectClass}>
            <option value="all">Tümü (Sakinler ve Personel)</option>
            <option value="owner">Ev Sahipleri</option>
            <option value="tenant">Kiracılar</option>
            <option value="block_manager">Apartman Yöneticileri</option>
            <option value="staff">Görevli Personel</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-surface p-6 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">Ad Soyad</th>
                <th className="px-4 py-3">Rol / Unvan</th>
                <th className="px-4 py-3">Bağlı Olduğu Ünite</th>
                <th className="px-4 py-3">Daire No</th>
              </tr>
            </thead>
            <tbody>
              {filteredResidents.map((r) => (
                <tr key={r.id} className="border-b border-white/5 transition hover:bg-white/2">
                  <td className="px-4 py-3 font-semibold">{r.fullName || `${r.firstName || ''} ${r.lastName || ''}`}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold ${getBadge(r.role)}`}>
                      {roleNames[r.role] || r.roleName || 'Kullanıcı'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{r.blockName || 'Site Geneli'}</td>
                  <td className="px-4 py-3">{r.apartmentNumber || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default Residents;
