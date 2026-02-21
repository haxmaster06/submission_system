"use client";

import { useState } from 'react';
import api from '@/lib/api';
import { Lock, Check, AlertCircle, Loader2 } from 'lucide-react';

export default function PasswordSettings() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await api.put('/me/password', {
                current_password: currentPassword,
                password,
                password_confirmation: passwordConfirmation,
            });
            setSuccess('Password berhasil diperbarui.');
            setCurrentPassword('');
            setPassword('');
            setPasswordConfirmation('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal memperbarui password.');
            if (err.response?.data?.errors) {
                // Optionally handle field specific errors if needed, for now general message
                const firstError = Object.values(err.response.data.errors)[0] as string[];
                if (firstError) setError(firstError[0]);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center border border-sky-100 text-sky-600">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Ubah Password</h3>
                        <p className="text-slate-500 text-sm">Amankan akun Anda dengan password yang kuat.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-4 bg-emerald-50 text-emerald-600 text-sm rounded-xl flex items-center gap-2">
                            <Check size={16} />
                            {success}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password Saat Ini</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password Baru</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                            placeholder="Minimal 8 karakter"
                            required
                            minLength={8}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Konfirmasi Password Baru</label>
                        <input
                            type="password"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                            placeholder="Ulangi password baru"
                            required
                            minLength={8}
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-sky-500 text-white font-bold rounded-xl hover:bg-sky-600 active:scale-95 transition-all shadow-lg shadow-sky-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                            Simpan Password Baru
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
