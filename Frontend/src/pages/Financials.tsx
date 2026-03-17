import { useEffect, useState } from 'react';
import { useAuthStore, Role } from '../store/authStore';
import api from '../services/api';
import FinancialModal from '../components/UI/FinancialModal';
import Modal from '../components/UI/Modal';
import { Plus, CalendarClock, Trash2 } from 'lucide-react';
import type { Ledger, RecurringTransaction } from '../types';

const Financials = () => {
  const { user } = useAuthStore();
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecurringOpen, setIsRecurringOpen] = useState(false);
  const [recurringList, setRecurringList] = useState<RecurringTransaction[]>([]);
  const [recurringLoading, setRecurringLoading] = useState(false);

  const [recDesc, setRecDesc] = useState('');
  const [recAmount, setRecAmount] = useState('');
  const [recType, setRecType] = useState('2');
  const [recDay, setRecDay] = useState('1');
  const [recEndDate, setRecEndDate] = useState('');
  const [recTargetPool, setRecTargetPool] = useState('1');
  const [recSaving, setRecSaving] = useState(false);

  useEffect(() => {
    fetchLedgers();
  }, [user]);

  const fetchLedgers = async () => {
    try {
      const role = user?.role;
      const blockId = user?.blockId || '';
      const response = await api.get(`/financial/ledgers?role=${role}&blockId=${blockId}`);
      setLedgers(response.data);
    } catch {
      console.error('Finans hatası');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecurring = async () => {
    setRecurringLoading(true);
    try {
      const blockId = user?.blockId || '';
      const response = await api.get(`/financial/recurring?blockId=${blockId}`);
      setRecurringList(response.data);
    } catch {
      console.error('Otomatik işlem listesi hatası');
    } finally {
      setRecurringLoading(false);
    }
  };

  const handleOpenRecurring = () => {
    setIsRecurringOpen(true);
    fetchRecurring();
  };

  const handleAddRecurring = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecSaving(true);
    try {
      await api.post('/financial/recurring', {
        description: recDesc,
        amount: parseFloat(recAmount),
        transactionType: parseInt(recType),
        targetPool: parseInt(recTargetPool),
        blockId: recTargetPool === '2' ? user?.blockId : null,
        executionDay: parseInt(recDay),
        endDate: recEndDate || null,
      });
      setRecDesc('');
      setRecAmount('');
      setRecEndDate('');
      fetchRecurring();
    } catch {
      alert('Otomatik işlem eklenemedi.');
    } finally {
      setRecSaving(false);
    }
  };

  const deleteRecurring = async (id: number) => {
    if (!window.confirm('Bu talimatı silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/financial/recurring/${id}`);
      fetchRecurring();
    } catch {
      alert('Silme işlemi başarısız.');
    }
  };

  const filteredLedgers = ledgers.filter((l) => {
    if (filter === 'all') return true;
    if (filter === 'site_pool' && l.poolType === 1) return true;
    if (filter.startsWith('block_') && l.poolType === 2 && l.blockId?.toString() === filter.replace('block_', '')) return true;
    return false;
  });

  if (loading) return <div className="p-8 text-slate-400">Yükleniyor...</div>;

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20';
  const selectClass =
    'rounded-xl border border-white/10 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20';

  const canManage = user?.role === Role.SiteManager || user?.role === Role.AssistantManager || user?.role === Role.BlockManager;

  return (
    <section className="animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Aidat ve Finans</h1>
          <p className="mt-1 text-sm text-slate-400">Tüm blokların ve site genelinin finansal işlemleri.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className={selectClass}>
            <option value="all">Tüm Kasalar</option>
            <option value="site_pool">Sadece Site Kasası</option>
            {ledgers.filter((l) => l.poolType === 2).map((l) => (
              <option key={l.blockId} value={`block_${l.blockId}`}>{l.poolName}</option>
            ))}
          </select>
          {canManage && (
            <>
              <button onClick={handleOpenRecurring} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium transition hover:bg-white/10">
                <CalendarClock size={16} /> Otomatik İşlem
              </button>
              <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:bg-primary-hover">
                <Plus size={16} /> Manuel İşlem
              </button>
            </>
          )}
        </div>
      </div>

      {user && (
        <FinancialModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchLedgers} userId={user.id} role={user.role} blockId={user.blockId} />
      )}

      {/* Recurring Modal */}
      <Modal isOpen={isRecurringOpen} onClose={() => setIsRecurringOpen(false)} title="Otomatik İşlem Yönetimi">
        <div>
          <h3 className="mb-4 text-sm font-semibold text-slate-400">Yeni Talimat Ekle</h3>
          <form onSubmit={handleAddRecurring} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-400">Açıklama</label>
              <input type="text" required value={recDesc} onChange={(e) => setRecDesc(e.target.value)} placeholder="Ör: Aylık aidat tahsilatı" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-400">Tutar (₺)</label>
                <input type="number" step="0.01" required value={recAmount} onChange={(e) => setRecAmount(e.target.value)} placeholder="0.00" className={inputClass} />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-400">Tür</label>
                <select value={recType} onChange={(e) => setRecType(e.target.value)} className={inputClass}>
                  <option value="1">Gelir (+)</option>
                  <option value="2">Gider (-)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-400">Hedef Havuz</label>
                <select value={recTargetPool} onChange={(e) => setRecTargetPool(e.target.value)} className={inputClass}>
                  {user?.role === Role.SiteManager && <option value="1">Site Kasası</option>}
                  <option value="2">Blok Kasası</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-400">Her Ayın Günü</label>
                <input type="number" min="1" max="28" required value={recDay} onChange={(e) => setRecDay(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-400">Bitiş Tarihi (Opsiyonel)</label>
              <input type="date" value={recEndDate} onChange={(e) => setRecEndDate(e.target.value)} className={inputClass} />
            </div>
            <button type="submit" disabled={recSaving} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-hover disabled:opacity-50">
              {recSaving ? 'Kaydediliyor...' : 'Talimat Ekle'}
            </button>
          </form>

          {recurringLoading ? (
            <p className="mt-5 text-sm text-slate-400">Yükleniyor...</p>
          ) : recurringList.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-slate-400">Mevcut Talimatlar</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <th className="px-3 py-2">Açıklama</th>
                      <th className="px-3 py-2">Tutar</th>
                      <th className="px-3 py-2">Gün</th>
                      <th className="px-3 py-2">Durum</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recurringList.map((r) => (
                      <tr key={r.id} className="border-b border-white/5">
                        <td className="px-3 py-2">{r.description}</td>
                        <td className={`px-3 py-2 font-medium ${r.transactionType === 1 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {r.transactionType === 1 ? '+' : '-'}{r.amount?.toLocaleString('tr-TR')} ₺
                        </td>
                        <td className="px-3 py-2">Her ayın {r.dayOfMonth}. günü</td>
                        <td className="px-3 py-2">
                          <span className={`rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold ${r.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                            {r.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <button onClick={() => deleteRecurring(r.id)} className="rounded-full p-1.5 text-red-400 transition hover:bg-red-500/10">
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Ledgers */}
      <div className="space-y-6">
        {filteredLedgers.map((l, idx) => (
          <div key={idx} className="rounded-2xl border border-white/10 bg-surface p-6 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold">
                  {l.poolName}
                  <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">
                    {l.poolType === 1 ? 'Site Ana Havuzu' : 'Blok Kasası'}
                  </span>
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Güncel Bakiye:{' '}
                  <strong className={`text-base ${l.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {l.balance.toLocaleString('tr-TR')} ₺
                  </strong>
                </p>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
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
                  {l.transactions?.map((t, tidx) => (
                    <tr key={tidx} className="border-b border-white/5 transition hover:bg-white/[0.02]">
                      <td className="px-4 py-3">{t.date}</td>
                      <td className="px-4 py-3">{t.description}</td>
                      <td className={`px-4 py-3 font-medium ${t.transactionType === 1 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {t.transactionType === 1 ? '+' : '-'}{t.amount?.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="px-4 py-3">{t.transactionType === 1 ? 'Gelir' : 'Gider'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Financials;
