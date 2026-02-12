'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function VendorNavbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('vendor_user');
    router.push('/vendor/login');
  };

  return (
    <nav className="bg-gray-900 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="bg-white text-gray-900 font-bold px-2 py-1 rounded text-xs">VENDOR</span>
          <span className="font-bold text-lg">Admin Panel</span>
        </div>
        <button onClick={handleLogout} className="text-sm bg-gray-800 px-3 py-1 rounded hover:bg-gray-700">Logout</button>
      </div>
    </nav>
  );
}