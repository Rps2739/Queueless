'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      router.push('/menu');
    }
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/menu';
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Check connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          {/* Left Side - Decorative */}
          <div className="hidden lg:block relative">
            <div className="relative z-10 p-8">
              <div className="text-6xl mb-6">👋</div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome back, <br />
                <span className="text-[#c41e3a]">
                  SIBM Student!
                </span>
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Login to skip the queue and order your favorite meals in seconds.
              </p>

              {/* Stats */}
              <div className="flex gap-8">
                <div>
                  <div className="text-3xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-500">Daily Orders</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">15 min</div>
                  <div className="text-sm text-gray-500">Avg. Prep Time</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">4.8★</div>
                  <div className="text-sm text-gray-500">User Rating</div>
                </div>
              </div>
            </div>

            <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-200 rounded-full opacity-50 blur-2xl"></div>
            <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-red-100 rounded-full opacity-40 blur-2xl"></div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 animate-scale-in">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto bg-[#c41e3a] rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-lg shadow-red-500/30">
                  🔐
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
                <p className="text-gray-500 mt-1">Enter your credentials to continue</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
                  <span>⚠️</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Email Address</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">✉️</span>
                    <input
                      type="email"
                      required
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-100 rounded-xl focus:border-[#c41e3a] focus:ring-4 focus:ring-red-50 outline-none transition-all text-gray-900 bg-gray-50 focus:bg-white"
                      placeholder="student@sibm.edu.in"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                    <input
                      type="password"
                      required
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-100 rounded-xl focus:border-[#c41e3a] focus:ring-4 focus:ring-red-50 outline-none transition-all text-gray-900 bg-gray-50 focus:bg-white"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#c41e3a] text-white hover:bg-[#a01830] hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5'
                    }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-gray-400 text-sm">New here?</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <Link
                href="/register"
                className="block w-full py-3.5 text-center rounded-xl font-semibold text-[#c41e3a] bg-red-50 hover:bg-red-100 transition-all"
              >
                Create an Account
              </Link>
            </div>

            <p className="text-center mt-6 text-gray-500 text-sm">
              Are you a vendor? <Link href="/vendor/login" className="text-[#c41e3a] font-semibold hover:underline">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}