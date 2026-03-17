import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import ElectionModal from '../components/UI/ElectionModal';
import { Plus, Clock, Users, Check } from 'lucide-react';
import type { Election } from '../types';

const Elections = () => {
  const { user } = useAuthStore();
  const [elections, setElections] = useState<Election[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'archive'>('active');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchElections();
  }, [user]);

  const fetchElections = async () => {
    try {
      const scope = user?.role === 1 || user?.role === 2 ? 1 : 2;
      const blockId = user?.blockId || '';
      const response = await api.get(`/election/list?scope=${scope}&blockId=${blockId}&userId=${user?.id}`);
      setElections(response.data);
    } catch {
      console.error('Seçim yükleme hatası');
    } finally {
      setLoading(false);
    }
  };

  const castVote = async (electionId: number, candidateId: number) => {
    if (!window.confirm('Oyunuzu bu adaya vermek istediğinize emin misiniz?')) return;
    try {
      await api.post('/election/vote', { electionId, candidateId, voterUserId: user?.id });
      fetchElections();
    } catch {
      alert('Oy verilirken bir hata oluştu.');
    }
  };

  const filteredElections = elections
    .filter((e) => (activeTab === 'active' ? !e.isCompleted : e.isCompleted))
    .filter((e) => {
      if (filter === 'all') return true;
      if (filter === '1' && e.type === 1 && e.scope === 1) return true;
      if (filter === '2' && e.type === 1 && e.scope === 2) return true;
      if (filter === '3' && e.type === 2) return true;
      return false;
    });

  if (loading) return <div className="p-8 text-slate-400">Yükleniyor...</div>;

  const selectClass =
    'rounded-xl border border-white/10 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20';

  return (
    <section className="animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Oylama & Seçim Sistemi</h1>
          <p className="mt-1 text-sm text-slate-400">Site ve Blok yöneticilerini otonom belirleyen şeffaf sistem.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className={selectClass}>
            <option value="all">Tüm Oylamalar</option>
            <option value="1">Site Yöneticisi Seçimi</option>
            <option value="2">Blok Yöneticisi Seçimi</option>
            <option value="3">Normal Anketler</option>
          </select>
          {(user?.role === 1 || user?.role === 2 || user?.role === 3) && (
            <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:bg-primary-hover">
              <Plus size={16} /> Yeni Oylama
            </button>
          )}
        </div>
      </div>

      {user && (
        <ElectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchElections} userId={user.id} role={user.role} blockId={user.blockId} />
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-white/10">
        {(['active', 'archive'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-medium transition ${
              activeTab === tab
                ? 'border-b-2 border-primary text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab === 'active' ? 'Devam Edenler' : 'Arşiv (Tamamlananlar)'}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="rounded-2xl border border-white/10 bg-surface p-6 backdrop-blur-xl">
        {filteredElections.length === 0 ? (
          <p className="text-sm text-slate-400">Bu kategoride oylama bulunmamaktadır.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredElections.map((e) => (
              <div
                key={e.id}
                className="flex min-h-[280px] flex-col gap-3 rounded-xl border border-white/10 bg-slate-900/50 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                style={{ borderTopWidth: '3px', borderTopColor: e.scope === 1 ? '#4F46E5' : '#F59E0B' }}
              >
                {/* Top badges */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold ${e.createdByRole < 3 ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                      {e.createdByRole < 3 ? 'Site Yönetimi' : 'Apartman Yönetimi'}
                    </span>
                    <h3 className="mt-1.5 text-sm font-semibold">{e.title}</h3>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${e.scope === 1 ? 'bg-indigo-500/20 text-indigo-300' : 'bg-amber-500/20 text-amber-300'}`}>
                      {e.scope === 1 ? 'Site Geneli' : e.blockName || 'Belirli Bir Blok'}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[0.6rem] text-slate-400">
                      {e.type === 1 ? 'Yönetici Seçimi' : 'Anket Oylaması'}
                    </span>
                  </div>
                </div>

                {e.description && (
                  <p className="border-l-2 border-white/10 pl-3 text-xs italic text-slate-400">{e.description}</p>
                )}

                {/* Meta */}
                <div className="flex items-center justify-between border-t border-white/5 pt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Clock size={12} /> Bitiş: <strong>{e.displayEndDate}</strong></span>
                  <span className="flex items-center gap-1"><Users size={12} /> {e.totalVotes} Katılım</span>
                </div>

                {/* Candidates */}
                <div className="mt-auto space-y-3">
                  {e.candidates.map((c) => {
                    const pct = e.totalVotes === 0 ? 0 : Math.round((c.voteCount / e.totalVotes) * 100);
                    const isVoted = e.userVotedCandidateId === c.candidateId;
                    const isEligible = e.scope === 1 || (e.scope === 2 && Number(e.blockId) === Number(user?.blockId));

                    return (
                      <div key={c.candidateId}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-sm">{c.fullName}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold">%{pct} ({c.voteCount} Oy)</span>
                            {!e.isCompleted && (
                              <button
                                disabled={isVoted || !isEligible}
                                onClick={() => castVote(e.id, c.candidateId)}
                                className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                                  isVoted
                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                                    : !isEligible
                                      ? 'cursor-not-allowed bg-white/5 text-slate-500'
                                      : 'bg-primary text-white shadow-md shadow-primary/30 hover:bg-primary-hover'
                                }`}
                              >
                                {isVoted ? (
                                  <span className="flex items-center gap-1">Oy Verildi <Check size={12} /></span>
                                ) : !isEligible ? 'Farklı Blok' : e.userVotedCandidateId ? 'Değiştir' : 'Oy Ver'}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-primary transition-all duration-1000" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Elections;
