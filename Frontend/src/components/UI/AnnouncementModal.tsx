import { useState } from 'react';
import Modal from './Modal';
import api from '../../services/api';

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  role: number;
  blockId?: number;
}

const AnnouncementModal = ({ isOpen, onClose, onSuccess, userId, role, blockId }: AnnouncementModalProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [scope, setScope] = useState(role === 1 || role === 2 ? '1' : '2');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/announcement', {
        title,
        content,
        targetScope: parseInt(scope),
        targetBlockId: scope === '2' ? blockId : null,
        createdById: userId,
      });
      onSuccess();
      onClose();
      setTitle('');
      setContent('');
    } catch {
      alert('Duyuru eklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Yeni Duyuru Yayınla">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-400">Başlık</label>
          <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Duyuru başlığı..." className={inputClass} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-400">Hedef Kitle</label>
          <select value={scope} onChange={(e) => setScope(e.target.value)} className={inputClass}>
            {(role === 1 || role === 2) && <option value="1">Site Geneli</option>}
            {(role === 1 || role === 2 || role === 3) && <option value="2">Blok Sakinleri</option>}
            {(role === 1 || role === 2) && <option value="3">Sadece Personel</option>}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-400">İçerik</label>
          <textarea rows={5} required value={content} onChange={(e) => setContent(e.target.value)} placeholder="Duyuru detayları..." className={`${inputClass} resize-y`} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium transition hover:bg-white/10">
            İptal
          </button>
          <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-hover disabled:opacity-50">
            {loading ? 'Yayınlanıyor...' : 'Yayınla'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AnnouncementModal;
