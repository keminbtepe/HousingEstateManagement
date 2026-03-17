import { useEffect, useState } from 'react';
import { useAuthStore, Role } from '../store/authStore';
import api from '../services/api';
import { Wallet, UserCircle, Briefcase, Building2, Clock } from 'lucide-react';
import type { DashboardData } from '../types';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const role = user?.role;
        const blockId = user?.blockId || '';
        const response = await api.get(`/dashboard/summary?role=${role}&blockId=${blockId}`);
        setData(response.data);
      } catch {
        console.error('Dashboard hatası');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchDashboard();
  }, [user]);

  if (loading || !data) {
    return <div className="p-8 text-slate-400">Yükleniyor...</div>;
  }

  const isSiteManagement = user?.role === Role.SiteManager || user?.role === Role.AssistantManager;
  const isBlockManager = user?.role === Role.BlockManager;

  const statCards = [
    {
      icon: <Wallet size={24} />,
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
      title: isBlockManager ? 'Blok Kasası' : 'Site Kasası (Ana Bakiye)',
      value: `${data.poolBalance.toLocaleString('tr-TR')} ₺`,
    },
    {
      icon: <UserCircle size={24} />,
      iconBg: 'bg-primary/10',
      iconColor: 'text-indigo-400',
      title: isBlockManager ? 'Toplam Blok Sakini' : 'Toplam Site Sakini',
      value: `${data.totalResidents || 0} Kişi`,
    },
    {
      icon: <Briefcase size={24} />,
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-400',
      title: isBlockManager ? 'Blok Görevli ve Personeli' : 'Görevli ve Personel',
      value: `${data.totalStaff || 0} Kişi`,
    },
  ];

  if (isSiteManagement) {
    statCards.push({
      icon: <Building2 size={24} />,
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-400',
      title: 'Toplam Blok Sayısı',
      value: `${data.totalBlocks} Blok`,
    });
  }

  return (
    <section className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Hoş Geldiniz, <span className="text-primary">{user?.fullName}</span> 👋
        </h1>
        <p className="mt-1 text-sm text-slate-400">Sitenizin güncel durumunu buradan takip edebilirsiniz.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="group cursor-pointer rounded-2xl border border-white/10 bg-surface p-6 shadow-md backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className={`mb-3 inline-flex rounded-full p-2.5 ${card.iconBg} ${card.iconColor}`}>
              {card.icon}
            </div>
            <h3 className="text-sm font-medium text-slate-400">{card.title}</h3>
            <p className="mt-2 text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <div className="rounded-2xl border border-white/10 bg-surface p-6 backdrop-blur-xl">
          <h3 className="mb-4 text-lg font-semibold">Son İşlemler</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3">Açıklama</th>
                  <th className="px-4 py-3">Tutar</th>
                  <th className="px-4 py-3">Tür</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTransactions.map((t, idx) => (
                  <tr key={idx} className="border-b border-white/5 transition hover:bg-white/[0.02]">
                    <td className="px-4 py-3">{t.date}</td>
                    <td className="px-4 py-3">{t.description}</td>
                    <td className={`px-4 py-3 font-medium ${t.transactionType === 1 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {t.transactionType === 1 ? '+' : '-'}{t.amount.toLocaleString('tr-TR')} ₺
                    </td>
                    <td className="px-4 py-3">{t.transactionType === 1 ? 'Gelir' : 'Gider'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Elections */}
        <div className="rounded-2xl border border-white/10 bg-surface p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl">
          <h3 className="mb-4 text-lg font-semibold">Aktif Seçimler / Oylamalar</h3>
          {data.activeElections.length === 0 ? (
            <p className="text-sm text-slate-400">Devam eden oylama yok.</p>
          ) : (
            <ul className="space-y-3">
              {data.activeElections.map((e) => (
                <li
                  key={e.id}
                  className="cursor-pointer rounded-lg border border-white/10 border-l-4 border-l-primary bg-slate-900/50 p-4 transition hover:bg-slate-800/50"
                >
                  <strong className="block text-sm">{e.title}</strong>
                  <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                    <Clock size={12} />
                    <span>Bitiş: {e.endDate}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
