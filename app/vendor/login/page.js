'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VendorLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/vendor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('vendor', JSON.stringify(data.vendor));
        router.push('/vendor/dashboard');
      } else {
        alert(data.error || "Login Failed");
      }
    } catch (err) {
      alert("Connection Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-500/5 to-cyan-500/5 rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-2xl shadow-indigo-500/30">
            🏪
          </div>
          <h2 className="text-indigo-400 text-sm font-bold uppercase tracking-widest mb-2">SIBM Operations</h2>
          <h1 className="text-4xl font-bold text-white">Vendor Portal</h1>
          <p className="text-slate-400 mt-2">Manage your shop and orders</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">Business Email</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">✉️</span>
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border-2 border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all text-white placeholder-slate-500"
                  placeholder="vendor@gmail.com"
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔒</span>
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border-2 border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all text-white placeholder-slate-500"
                  placeholder="••••••••"
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${loading
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5'
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Verifying...
                </span>
              ) : (
                'Access Dashboard'
              )}
            </button>
          </form>
        </div>

        {/* Register Link */}
        <div className="mt-8 text-center">
          <p className="text-slate-400">
            New vendor? <Link href="/vendor/register" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">Register your shop</Link>
          </p>
        </div>

        {/* Customer Link */}
        <div className="mt-4 text-center">
          <Link href="/login" className="text-slate-500 text-sm hover:text-slate-400 transition-colors">
            ← Back to Customer Login
          </Link>
        </div>
      </div>
    </div>
  );
}