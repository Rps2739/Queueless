'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar({ cartCount = 0, onCartClick = null }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
      ? 'bg-white/95 backdrop-blur-lg shadow-lg'
      : 'bg-[#c41e3a]'
      }`}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* SIBM Logo and Brand */}
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          {/* Logo placeholder - will be replaced with actual SIBM logo */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${scrolled ? 'bg-[#c41e3a] text-white' : 'bg-white text-[#c41e3a]'
            }`}>
            S
          </div>
          <div className="flex flex-col">
            <span className={`text-lg font-bold tracking-tight ${scrolled ? 'text-[#c41e3a]' : 'text-white'
              }`}>
              SIBM Canteen
            </span>
            <span className={`text-[10px] uppercase tracking-widest ${scrolled ? 'text-gray-500' : 'text-white/70'
              }`}>
              Bengaluru
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-3">
          <Link
            href="/menu"
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${scrolled
              ? 'text-gray-700 hover:bg-red-50 hover:text-[#c41e3a]'
              : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
          >
            Menu
          </Link>

          {onCartClick && (
            <button
              onClick={onCartClick}
              className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${scrolled
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-white/15 text-white hover:bg-white/25'
                }`}
            >
              <span>🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-900 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {user ? (
            <>
              <Link
                href="/orders"
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${scrolled
                  ? 'bg-red-50 text-[#c41e3a] hover:bg-red-100'
                  : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
              >
                <span>📄</span>
                <span className="hidden sm:inline">My Orders</span>
              </Link>

              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${scrolled ? 'bg-gray-100' : 'bg-white/15'
                }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${scrolled
                  ? 'bg-[#c41e3a] text-white'
                  : 'bg-white text-[#c41e3a]'
                  }`}>
                  {user.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className={`text-sm font-medium hidden md:block ${scrolled ? 'text-gray-700' : 'text-white'
                  }`}>
                  {user.full_name?.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all ${scrolled
                    ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                >
                  Logout
                </button>
                <button
                  onClick={async () => {
                    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
                    try {
                      const res = await fetch(`/api/user/profile?id=${user.id}`, { method: 'DELETE' });
                      if (res.ok) {
                        alert('Account deleted successfully');
                        localStorage.removeItem('user');
                        router.push('/login');
                      } else {
                        alert('Failed to delete account');
                      }
                    } catch (e) {
                      alert('Error deleting account');
                    }
                  }}
                  className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all ml-1 ${scrolled
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-red-500/20 text-red-100 hover:bg-red-500/40' // distinct red
                    }`}
                  title="Delete Account"
                >
                  🗑️
                </button>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all ${scrolled
                ? 'bg-[#c41e3a] text-white hover:bg-[#a01830] shadow-lg shadow-red-500/30'
                : 'bg-white text-[#c41e3a] hover:bg-red-50 shadow-lg'
                }`}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}