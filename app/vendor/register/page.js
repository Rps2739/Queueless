'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VendorRegister() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '', shopName: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/vendor/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server Error: Check terminal for details.");
      }

      const data = await res.json();

      if (data.success) {
        alert("Registration Successful! Please Login.");
        router.push('/vendor/login');
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Something went wrong: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-2xl shadow-indigo-500/30">
            ✨
          </div>
          <h1 className="text-3xl font-bold text-white">Register Your Shop</h1>
          <p className="text-slate-400 mt-2">Join the SIBM Smart Canteen network</p>
        </div>

        {/* Register Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">Shop Name</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🏪</span>
                <input
                  name="shopName"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border-2 border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all text-white placeholder-slate-500"
                  placeholder="e.g. Nescafe, Juice Center"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">Manager Name</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">👤</span>
                  <input
                    name="fullName"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border-2 border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all text-white placeholder-slate-500"
                    placeholder="Full Name"
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">Phone</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">📱</span>
                  <input
                    name="phone"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border-2 border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all text-white placeholder-slate-500"
                    placeholder="Mobile No"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">Business Email</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">✉️</span>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border-2 border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all text-white placeholder-slate-500"
                  placeholder="vendor@gmail.com"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔒</span>
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border-2 border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all text-white placeholder-slate-500"
                  placeholder="Create Password"
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all mt-2 ${loading
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5'
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Creating Account...
                </span>
              ) : (
                'Register Shop'
              )}
            </button>
          </form>
        </div>

        {/* Login Link */}
        <div className="mt-8 text-center">
          <p className="text-slate-400">
            Already registered? <Link href="/vendor/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}