import { useState, useEffect } from 'react';
import Modal from './Modal';
import api from '../../services/api';
import type { Ledger } from '../../types';

interface FinancialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  role: number;
  blockId?: number;
}

const FinancialModal = ({ isOpen, onClose, onSuccess, userId, role, blockId }: FinancialModalProps) => {
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [selectedLedgerIdx, setSelectedLedgerIdx] = useState('0');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('2');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) fetchLedgers();
  }, [isOpen]);

  const fetchLedgers = async () => {
    try {
      const response = await api.get(`/financial/ledgers?role=${role}&blockId=${blockId || ''}`);
      setLedgers(response.data);
      if (response.data.length > 0) setSelectedLedgerIdx('0');
    } catch {
      console.error('Kasa listesi yüklenemedi');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const selectedLedger = ledgers[parseInt(selectedLedgerIdx)];
      const targetPool = selectedLedger?.poolType || (role === 1 ? 1 : 2);
      const targetBlockId = selectedLedger?.blockId || blockId || null;

      await api.post('/financial/transaction', {
        description,
        amount: parseFloat(amount),
        transactionType: parseInt(type),
        targetPool,
        blockId: targetBlockId,
        performedById: userId,
      });
      onSuccess();
      onClose();
      setDescription('');
      setAmount('');
    } catch {
      alert('İşlem eklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Finansal İşlem Ekle">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-400">Kasa / Havuz</label>
          <select value={selectedLedgerIdx} onChange={(e) => setSelectedLedgerIdx(e.target.value)} required className={inputClass}>
            {ledgers.map((l, idx) => (
              <option key={idx} value={idx}>{l.poolName} ({l.balance.toLocaleString('tr-TR')} ₺)</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-400">İşlem Türü</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
            <option value="1">Gelir (+)</option>
            <option value="2">Gider (-)</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-400">Tutar (₺)</label>
            <input type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className={inputClass} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-400">Tarih</label>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-400">Açıklama</label>
          <input type="text" required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="İşlem açıklaması..." className={inputClass} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium transition hover:bg-white/10">İptal</button>
          <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-hover disabled:opacity-50">
            {loading ? 'Ekleniyor...' : 'İşlemi Kaydet'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default FinancialModal;
