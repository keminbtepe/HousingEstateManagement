import { useState } from 'react';
import Modal from './Modal';
import api from '../../services/api';
import { Plus, Trash2 } from 'lucide-react';

interface ElectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  role: number;
  blockId?: number;
}

const ElectionModal = ({ isOpen, onClose, onSuccess, userId, role, blockId }: ElectionModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('2');
  const [scope, setScope] = useState(role === 1 || role === 2 ? '1' : '2');
  const [endDate, setEndDate] = useState('');
  const [candidates, setCandidates] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);

  const handleAddCandidate = () => setCandidates([...candidates, '']);
  const handleRemoveCandidate = (index: number) => setCandidates(candidates.filter((_, i) => i !== index));
  const handleCandidateChange = (index: number, value: string) => {
    const updated = [...candidates];
    updated[index] = value;
    setCandidates(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/election', {
        title,
        description,
        type: parseInt(type),
        scope: parseInt(scope),
        blockId: scope === '2' ? blockId : null,
        startDate: new Date().toISOString(),
        endDate,
        voterEligibility: 1,
        createdByRole: role,
        createdById: userId,
        candidateUserIds: [],
        candidateNames: candidates.filter((c) => c.trim() !== ''),
      });
      onSuccess();
      onClose();
      setTitle('');
      setDescription('');
      setCandidates(['']);
    } catch {
      alert('Seçim oluşturulurken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Yeni Seçim / Anket Oluştur">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-400">Başlık</label>
          <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Seçim veya anket başlığı..." className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-400">Tür</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
              <option value="1">Yönetici Seçimi</option>
              <option value="2">Normal Anket</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-400">Kapsam</label>
            <select value={scope} onChange={(e) => setScope(e.target.value)} className={inputClass}>
              {(role === 1 || role === 2) && <option value="1">Site Geneli</option>}
              {(role === 1 || role === 2 || role === 3) && <option value="2">Blok Bazlı</option>}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-400">Bitiş Tarihi</label>
          <input type="datetime-local" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-400">Adaylar / Seçenekler</label>
          <div className="space-y-2">
            {candidates.map((c, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={c}
                  onChange={(e) => handleCandidateChange(index, e.target.value)}
                  placeholder={`Aday/Seçenek ${index + 1}`}
                  className={inputClass}
                />
                {candidates.length > 1 && (
                  <button type="button" onClick={() => handleRemoveCandidate(index)} className="shrink-0 rounded-lg border border-white/10 bg-white/5 p-2.5 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={handleAddCandidate} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm text-slate-300 transition hover:bg-white/10">
            <Plus size={16} /> Aday Ekle
          </button>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-400">Açıklama (Opsiyonel)</label>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detaylı bilgi..." className={`${inputClass} resize-y`} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium transition hover:bg-white/10">
            İptal
          </button>
          <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-hover disabled:opacity-50">
            {loading ? 'Oluşturuluyor...' : 'Seçimi Başlat'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ElectionModal;
