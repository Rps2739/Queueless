'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const userData = JSON.parse(storedUser);

    fetchOrders(userData.id);

    const interval = setInterval(() => {
      fetchOrders(userData.id);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  async function fetchOrders(userId) {
    try {
      const res = await fetch(`/api/user/orders?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Ready':
        return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg shadow-green-500/30';
      case 'Preparing':
        return 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-lg shadow-blue-500/30';
      case 'Completed':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Ready': return '✓';
      case 'Preparing': return '🍳';
      case 'Completed': return '✓✓';
      default: return '⏳';
    }
  };

  // Format order display ID
  const formatOrderId = (order) => {
    if (order.daily_order_number && order.order_date) {
      const day = new Date(order.order_date).getDate().toString().padStart(2, '0');
      const shopCode = (order.items?.[0]?.shop || 'CAN').substring(0, 3).toUpperCase();
      return `${shopCode}-${day}-${order.daily_order_number.toString().padStart(3, '0')}`;
    }
    return `#${order.id}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-500">Track your order status in real-time</p>
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-red-200 border-t-[#c41e3a] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading your orders...</p>
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 animate-fade-in">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-bold text-gray-400 mb-2">No orders yet</h3>
            <p className="text-gray-400 mb-6">Start ordering your favorite food!</p>
            <button onClick={() => router.push('/menu')} className="bg-[#c41e3a] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#a01830] hover:shadow-lg hover:shadow-red-500/30 transition-all">
              Browse Menu
            </button>
          </div>
        )}

        <div className="space-y-6">
          {orders.map((order, index) => {
            const shopName = order.items && order.items.length > 0 ? order.items[0].shop : 'General';
            const isActive = order.status !== 'Completed';
            const displayId = formatOrderId(order);

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl shadow-lg shadow-gray-100/50 overflow-hidden border-2 transition-all animate-slide-up ${isActive ? 'border-red-200' : 'border-gray-100'}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`p-5 ${isActive ? 'bg-gradient-to-r from-red-50 to-rose-50' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl font-bold text-gray-900">{displayId}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-[#c41e3a] font-semibold">{shopName}</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <span className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${getStatusStyle(order.status)}`}>
                      <span>{getStatusIcon(order.status)}</span>
                      {order.status === 'Ready' ? 'READY FOR PICKUP' : order.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="p-5 border-t border-gray-100">
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-red-100 text-[#c41e3a] rounded-lg flex items-center justify-center text-sm font-bold">
                            {item.qty}×
                          </span>
                          <span className="text-gray-800 font-medium">{item.name}</span>
                        </div>
                        <span className="text-gray-600 font-semibold">₹{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Total Amount</span>
                  <span className="text-2xl font-bold text-gray-900">₹{order.total_amount}</span>
                </div>

                {order.status === 'Ready' && (
                  <div className="p-5 bg-gradient-to-r from-green-500 to-emerald-500 text-center">
                    <p className="text-white font-bold text-lg flex items-center justify-center gap-2">
                      <span className="text-2xl">🎉</span>
                      Your order is ready! Pick it up now.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}