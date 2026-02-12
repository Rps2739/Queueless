'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

export default function Menu() {
  const [items, setItems] = useState([]);
  const [shops, setShops] = useState([]);
  const [shopStatus, setShopStatus] = useState({});
  const [activeTab, setActiveTab] = useState('');
  const [cart, setCart] = useState({});
  const [user, setUser] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const shopRes = await fetch('/api/shops');
      const shopList = await shopRes.json();
      setShops(shopList);
      if (shopList.length > 0) setActiveTab(shopList[0]);

      const menuRes = await fetch('/api/menu');
      const menuList = await menuRes.json();
      setItems(menuList);

      // Fetch shop status
      const statsRes = await fetch('/api/stats');
      const statsData = await statsRes.json();
      const statusMap = {};
      statsData.shops.forEach(s => { statusMap[s.name] = s.isOpen; });
      setShopStatus(statusMap);
    };

    fetchData();
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const getQty = (itemId) => cart[itemId] || 0;

  const cartItemsArray = Object.keys(cart).map(id => {
    const item = items.find(i => i.id === parseInt(id));
    return item ? { ...item, quantity: cart[id] } : null;
  }).filter(Boolean);

  const totalAmount = cartItemsArray.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const totalCount = cartItemsArray.reduce((sum, i) => sum + i.quantity, 0);

  const handleIncrement = (item) => {
    if (!user) {
      if (confirm("Please login to order food.")) router.push('/login');
      return;
    }

    // Check if shop is open
    if (shopStatus[item.shop] === false) {
      alert(`${item.shop} is currently not accepting orders.`);
      return;
    }

    if (cartItemsArray.length > 0) {
      const existingShop = cartItemsArray[0].shop;
      if (existingShop !== item.shop) {
        if (!confirm(`Your cart has items from ${existingShop}. Clear cart to order from ${item.shop}?`)) {
          return;
        }
        setCart({});
      }
    }

    const currentQty = getQty(item.id);
    if (currentQty >= item.stock_quantity) {
      alert(`Sorry, only ${item.stock_quantity} left!`);
      return;
    }
    setCart(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
  };

  const handleDecrement = (itemId) => {
    const currentQty = getQty(itemId);
    if (currentQty <= 0) return;
    const newCart = { ...cart };
    if (currentQty === 1) delete newCart[itemId]; else newCart[itemId] = currentQty - 1;
    setCart(newCart);
  };

  const placeOrder = async () => {
    if (cartItemsArray.length === 0) return;

    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, items: cartItemsArray, total: totalAmount })
      });
      const data = await res.json();

      if (data.success) {
        alert(`✅ Order ${data.displayId || '#' + data.orderId} Placed! Tracking it now...`);
        setCart({});
        setIsCartOpen(false);
        fetch('/api/menu').then(res => res.json()).then(setItems);
        router.push('/orders');
      } else {
        alert("❌ Order Failed: " + data.error);
      }
    } catch (err) {
      alert("Network Error: " + err.message);
    }
  };

  const displayedItems = items.filter(item => item.shop === activeTab);
  const isActiveShopOpen = shopStatus[activeTab] !== false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 pb-32">
      <Navbar cartCount={totalCount} onCartClick={() => setIsCartOpen(true)} />

      {/* Shop Tabs */}
      <div className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-[60px] z-30 border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-start md:justify-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {shops.length === 0 && <p className="text-gray-500 italic">Loading shops...</p>}
            {shops.map(shop => (
              <button
                key={shop}
                onClick={() => setActiveTab(shop)}
                className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === shop
                  ? 'bg-[#c41e3a] text-white shadow-lg shadow-red-500/30'
                  : 'bg-white border-2 border-gray-100 text-gray-600 hover:border-red-200 hover:bg-red-50'
                  }`}
              >
                {shop}
                {shopStatus[shop] === false && (
                  <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full">Closed</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Closed Shop Banner */}
      {!isActiveShopOpen && (
        <div className="bg-red-100 border-b border-red-200 py-3">
          <div className="container mx-auto px-4 text-center">
            <p className="text-red-700 font-semibold">⚠️ {activeTab} is currently not accepting orders</p>
          </div>
        </div>
      )}

      {/* Menu Grid */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{activeTab || 'Menu'}</h1>
          <p className="text-gray-500">Select your favorite items from the menu below</p>
        </div>

        {displayedItems.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 animate-fade-in">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-bold text-gray-400">Menu Coming Soon</h3>
            <p className="text-gray-400 mt-2">The vendor hasn't added any items yet.</p>
          </div>
        )}

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${!isActiveShopOpen ? 'opacity-50' : ''}`}>
          {displayedItems.map((item, index) => {
            const qty = getQty(item.id);
            const isOut = item.stock_quantity === 0;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100 overflow-hidden flex flex-col transition-all hover:shadow-xl hover:-translate-y-1 animate-slide-up ${isOut ? 'opacity-60 grayscale' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="h-44 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
                  {item.image_emoji?.startsWith('/uploads/') ? (
                    <img src={item.image_emoji} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-7xl">{item.image_emoji}</span>
                  )}
                  {isOut && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm">SOLD OUT</span>
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">
                    {item.category}
                  </span>
                </div>

                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{item.name}</h3>
                    <p className="text-gray-400 text-xs">{item.stock_quantity} available</p>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-2xl font-bold text-gray-900">₹{item.price}</span>
                    {!isOut && isActiveShopOpen && (
                      qty === 0 ? (
                        <button
                          onClick={() => handleIncrement(item)}
                          className="bg-[#c41e3a] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-red-500/30 hover:bg-[#a01830] hover:-translate-y-0.5 transition-all"
                        >
                          ADD
                        </button>
                      ) : (
                        <div className="flex items-center bg-red-50 border-2 border-red-200 rounded-xl overflow-hidden">
                          <button onClick={() => handleDecrement(item.id)} className="px-4 py-2 text-[#c41e3a] font-bold hover:bg-red-100 transition-colors">−</button>
                          <span className="px-3 font-bold text-[#c41e3a]">{qty}</span>
                          <button onClick={() => handleIncrement(item)} className="px-4 py-2 text-[#c41e3a] font-bold hover:bg-red-100 transition-colors">+</button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Cart */}
      {totalCount > 0 && (
        <div className="fixed bottom-6 left-4 right-4 max-w-lg mx-auto z-40 animate-bounce-in">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl shadow-2xl p-4 flex justify-between items-center hover:shadow-3xl transition-all transform hover:scale-[1.02]"
          >
            <div className="flex items-center gap-4">
              <div className="bg-[#c41e3a] text-white w-10 h-10 flex items-center justify-center rounded-xl font-bold">
                {totalCount}
              </div>
              <div className="text-left">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total</span>
                <span className="block text-xl font-bold">₹{totalAmount}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-5 py-2.5 rounded-xl font-semibold">
              View Cart <span className="text-lg">→</span>
            </div>
          </button>
        </div>
      )}

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-5 bg-[#c41e3a] flex justify-between items-center">
              <div>
                <h2 className="font-bold text-xl text-white">Your Cart</h2>
                <p className="text-red-100 text-sm">{totalCount} items</p>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="text-white/80 hover:text-white font-bold text-2xl w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center">✕</button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-5 space-y-4">
              {cartItemsArray.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                  <div className="flex items-center gap-3">
                    {item.image_emoji?.startsWith('/uploads/') ? (
                      <img src={item.image_emoji} alt={item.name} className="w-12 h-12 object-cover rounded-xl" />
                    ) : (
                      <span className="text-3xl">{item.image_emoji}</span>
                    )}
                    <div>
                      <p className="font-bold text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-500">₹{item.price} × {item.quantity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900 text-lg">₹{item.price * item.quantity}</span>
                    <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
                      <button onClick={() => handleDecrement(item.id)} className="px-3 py-1.5 text-[#c41e3a] font-bold hover:bg-red-50">−</button>
                      <button onClick={() => handleIncrement(item)} className="px-3 py-1.5 text-[#c41e3a] font-bold hover:bg-red-50">+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500 font-medium">Total Amount</span>
                <span className="font-bold text-gray-900 text-2xl">₹{totalAmount}</span>
              </div>
              <button onClick={placeOrder} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-green-500/30 transition-all hover:-translate-y-0.5">
                Confirm & Pay ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}