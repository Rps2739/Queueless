'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: '', prn: '', phone: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (data.success) {
        alert("Account created! Redirecting to login...");
        router.push('/login');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-grow flex items-center justify-center p-4 py-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          {/* Left Side */}
          <div className="hidden lg:block relative">
            <div className="relative z-10 p-8">
              <div className="text-6xl mb-6">🎓</div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Join the <br />
                <span className="text-[#c41e3a]">SIBM Canteen</span>
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Create your account and never wait in line again!
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-lg">✓</div>
                  <span className="text-gray-700">Pre-order your meals anytime</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-lg">✓</div>
                  <span className="text-gray-700">Get real-time order updates</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-lg">✓</div>
                  <span className="text-gray-700">Skip the queue every time</span>
                </div>
              </div>
            </div>

            <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-200 rounded-full opacity-50 blur-2xl"></div>
            <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-red-100 rounded-full opacity-40 blur-2xl"></div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 animate-scale-in">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto bg-[#c41e3a] rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-lg shadow-red-500/30">
                  ✨
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
                <p className="text-gray-500 mt-1">Fill in your details to get started</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
                  <span>⚠️</span>{error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Full Name</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                    <input name="fullName" required className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-100 rounded-xl focus:border-[#c41e3a] focus:ring-4 focus:ring-red-50 outline-none transition-all text-gray-900 bg-gray-50 focus:bg-white" placeholder="Your Full Name" onChange={handleChange} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">PRN Number</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🆔</span>
                      <input name="prn" required className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-100 rounded-xl focus:border-[#c41e3a] focus:ring-4 focus:ring-red-50 outline-none transition-all text-gray-900 bg-gray-50 focus:bg-white" placeholder="PRN" onChange={handleChange} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Phone</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📱</span>
                      <input name="phone" required className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-100 rounded-xl focus:border-[#c41e3a] focus:ring-4 focus:ring-red-50 outline-none transition-all text-gray-900 bg-gray-50 focus:bg-white" placeholder="10 digits" onChange={handleChange} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Email Address</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">✉️</span>
                    <input name="email" type="email" required className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-100 rounded-xl focus:border-[#c41e3a] focus:ring-4 focus:ring-red-50 outline-none transition-all text-gray-900 bg-gray-50 focus:bg-white" placeholder="student@sibm.edu.in" onChange={handleChange} />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                    <input name="password" type="password" required className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-100 rounded-xl focus:border-[#c41e3a] focus:ring-4 focus:ring-red-50 outline-none transition-all text-gray-900 bg-gray-50 focus:bg-white" placeholder="Create a strong password" onChange={handleChange} />
                  </div>
                </div>

                <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl font-bold text-lg transition-all mt-2 ${loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#c41e3a] text-white hover:bg-[#a01830] hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5'}`}>
                  {loading ? <span className="flex items-center justify-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Creating Account...</span> : 'Create Account'}
                </button>
              </form>

              <p className="text-center mt-6 text-gray-600 text-sm">
                Already have an account? <Link href="/login" className="text-[#c41e3a] font-semibold hover:underline">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}