'use client';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [stats, setStats] = useState({
    shops: [],
    trending: { name: 'Masala Dosa', emoji: '🥘' },
    estimatedWait: '10-15 mins',
    todayOrders: 0,
    popularItems: []
  });

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => { }); // Use defaults on error
  }, []);

  // Count open vs closed shops
  const openShops = stats.shops.filter(s => s.isOpen).length;
  const closedShops = stats.shops.filter(s => !s.isOpen).length;
  const allOpen = stats.shops.length > 0 && closedShops === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 font-sans flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-red-200 rounded-full opacity-30 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-red-100 rounded-full opacity-30 blur-3xl"></div>
          <div className="absolute top-1/4 left-1/4 text-6xl animate-float opacity-20">🍕</div>
          <div className="absolute top-1/3 right-1/4 text-5xl animate-float opacity-20" style={{ animationDelay: '1s' }}>🍔</div>
          <div className="absolute bottom-1/4 left-1/3 text-4xl animate-float opacity-20" style={{ animationDelay: '2s' }}>🥤</div>
        </div>

        <div className="relative container mx-auto px-4 py-20 md:py-32 text-center">
          {/* Dynamic Shop Status Badge */}
          {stats.shops.length > 0 && (
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-semibold mb-6 animate-fade-in shadow-lg border border-gray-100">
              {stats.shops.map((shop, idx) => (
                <div key={shop.name} className="flex items-center gap-2">
                  {idx > 0 && <span className="text-gray-300">|</span>}
                  <span className={`w-2 h-2 rounded-full ${shop.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                  <span className={shop.isOpen ? 'text-gray-700' : 'text-red-600'}>
                    {shop.name}: {shop.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight animate-slide-up">
            Skip the Queue,
            <br />
            <span className="text-[#c41e3a]">
              Grab Your Bite!
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Pre-order your favorite meals from SIBM Bengaluru's Canteen. Fresh food, zero wait time.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-[#c41e3a] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#a01830] hover:shadow-2xl hover:shadow-red-500/30 transition-all transform hover:-translate-y-1"
            >
              Start Your Order
              <span className="text-xl">→</span>
            </Link>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-gray-200 hover:border-[#c41e3a] hover:text-[#c41e3a] transition-all"
            >
              View Menu
              <span>📋</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 -mt-8 pb-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 - Popular Items */}
          <div className="group bg-white p-6 rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100 card-hover animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <span className="text-white text-xl">⭐</span>
              </div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Popular This Week</h3>
            </div>
            <div className="space-y-2">
              {stats.popularItems.length > 0 ? (
                stats.popularItems.map((item, idx) => (
                  <Link
                    key={item.id}
                    href="/menu"
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{item.emoji?.startsWith('/uploads/') ? '🍽️' : item.emoji}</span>
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-orange-600">₹{item.price}</span>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-2">Loading popular items...</p>
              )}
            </div>
          </div>

          {/* Card 2 - Wait Time & Today's Stats */}
          <div className="group bg-white p-6 rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100 card-hover animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-white text-xl">⏱</span>
              </div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Est. Wait Time</h3>
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-2">{stats.estimatedWait}</p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-semibold text-indigo-600">{stats.todayOrders}</span>
              <span>orders placed today</span>
            </div>
          </div>

          {/* Card 3 - Canteen Hours */}
          <div className="group bg-white p-6 rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100 card-hover animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#c41e3a] to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                <span className="text-white text-xl">🕐</span>
              </div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Canteen Hours</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <span className="text-sm font-medium text-gray-700">Cafeteria</span>
                <span className="text-xs font-semibold text-gray-500">8:00 AM - 8:00 PM</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <span className="text-sm font-medium text-gray-700">Bakery</span>
                <span className="text-xs font-semibold text-gray-500">9:00 AM - 6:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closed Shop Warning Banner */}
      {closedShops > 0 && (
        <section className="bg-red-50 border-y border-red-100 py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-3 text-red-700">
              <span className="text-xl">⚠️</span>
              <p className="font-semibold">
                {closedShops === stats.shops.length
                  ? 'All shops are currently closed'
                  : `${stats.shops.filter(s => !s.isOpen).map(s => s.name).join(', ')} ${closedShops === 1 ? 'is' : 'are'} currently not accepting orders`
                }
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Why Pre-Order?
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-lg mx-auto">
            Join students who save time every day
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#c41e3a] to-red-600 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg shadow-red-500/30">
                ⚡
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Skip the Queue</h3>
              <p className="text-gray-400">No more waiting in long lines during rush hours</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg shadow-green-500/30">
                📱
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Live Tracking</h3>
              <p className="text-gray-400">Get notified when your order is ready to pickup</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg shadow-blue-500/30">
                🍽️
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Fresh & Hot</h3>
              <p className="text-gray-400">Your food starts cooking when you're nearby</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-[#c41e3a] py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Order?
          </h2>
          <p className="text-red-100 mb-8 text-lg">
            Your next meal is just a few taps away
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-white text-[#c41e3a] px-8 py-4 rounded-2xl font-bold text-lg hover:bg-red-50 transition-all shadow-2xl"
          >
            Browse Menu Now
            <span>🍔</span>
          </Link>
        </div>
      </section>
    </div>
  );
}