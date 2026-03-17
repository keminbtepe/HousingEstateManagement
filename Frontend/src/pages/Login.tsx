import { useState, useEffect } from 'react';
import { useAuthStore, type User } from '../store/authStore';
import api from '../services/api';
import { Building, ArrowRight, Loader2 } from 'lucide-react';
import type { Block } from '../types';

const Login = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [blockId, setBlockId] = useState('');
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const response = await api.get('/blocks');
        const result = response.data;
        if (result && result.isSuccess && Array.isArray(result.data)) {
          setBlocks(result.data);
        } else if (Array.isArray(result)) {
          setBlocks(result);
        }
      } catch {
        console.error('Bloklar yüklenemedi');
      }
    };
    fetchBlocks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        blockId: parseInt(blockId),
        apartmentNumber: parseInt(apartmentNumber),
        password,
      });
      if (response.data) {
        const { user, token } = response.data;
        const nameParts = (user.fullName || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        const selectedBlock = blocks.find((b) => b.id.toString() === blockId);

        const userData: User = {
          ...user,
          firstName,
          lastName,
          fullName: user.fullName,
          blockName: selectedBlock?.name || '',
        };
        login(userData, token);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      alert(err.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol ediniz.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-sm text-white outline-none backdrop-blur-sm transition focus:border-primary focus:ring-2 focus:ring-primary/20';

  return (
    <div className="flex min-h-screen items-center justify-center p-5">
      <div className="w-full max-w-md animate-fade-in rounded-2xl border border-white/10 bg-surface p-12 text-center shadow-2xl backdrop-blur-2xl">
        {/* Logo */}
        <div className="mb-8">
          <Building className="mx-auto mb-3 text-primary" size={48} />
          <h2 className="text-2xl font-bold">
            Sinerji<span className="font-light text-primary">Yönetim</span>
          </h2>
          <p className="mt-2 text-sm text-slate-400">Site & Blok Yönetim Sistemi</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="relative space-y-5 text-left">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-slate-900/40 backdrop-blur-sm">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-semibold tracking-wide text-slate-400">
              Blok / Bina Seçin
            </label>
            <select
              id="blockId"
              required
              value={blockId}
              onChange={(e) => setBlockId(e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>Blok Seçin...</option>
              {blocks.map((b) => (
                <option key={b.id} value={b.id.toString()}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold tracking-wide text-slate-400">
              Daire No
            </label>
            <input
              type="number"
              id="apartmentNumber"
              placeholder="Örn: 14"
              required
              value={apartmentNumber}
              onChange={(e) => setApartmentNumber(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold tracking-wide text-slate-400">
              Şifre
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:bg-primary-hover active:translate-y-0 disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
