'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VendorDashboard() {
  const router = useRouter();
  const [vendor, setVendor] = useState(null);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [newItem, setNewItem] = useState({ name: '', price: '', category: '', emoji: '🍽️', stock: '' });
  const [imageMode, setImageMode] = useState('emoji');
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Shop status
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);
  const [scheduleClose, setScheduleClose] = useState('');
  const [scheduleOpen, setScheduleOpen] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    const storedVendor = localStorage.getItem('vendor');
    if (!storedVendor) {
      router.push('/vendor/login');
    } else {
      const v = JSON.parse(storedVendor);
      setVendor(v);
      fetchData(v.shop_name);
      fetchShopStatus(v.shop_name);
    }
  }, []);

  async function fetchShopStatus(shopName) {
    try {
      const res = await fetch(`/api/vendor/status?shop=${encodeURIComponent(shopName)}`);
      const data = await res.json();
      setIsAcceptingOrders(data.isAcceptingOrders);
      setScheduleClose(data.scheduledCloseTime || '');
      setScheduleOpen(data.scheduledOpenTime || '');
    } catch (err) {
      console.error('Failed to fetch shop status');
    }
  }

  async function toggleShopStatus() {
    if (!vendor) return;
    setStatusLoading(true);
    try {
      const res = await fetch('/api/vendor/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopName: vendor.shop_name,
          isAcceptingOrders: !isAcceptingOrders,
          scheduledCloseTime: scheduleClose || null,
          scheduledOpenTime: scheduleOpen || null
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsAcceptingOrders(!isAcceptingOrders);
      }
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  }

  async function fetchData(shopName) {
    const ordersRes = await fetch(`/api/vendor/orders?shop=${encodeURIComponent(shopName)}`);
    setOrders(await ordersRes.json());
    const inventoryRes = await fetch(`/api/vendor/inventory?shop=${encodeURIComponent(shopName)}`);
    setInventory(await inventoryRes.json());
  }

  async function updateStatus(orderId, newStatus) {
    await fetch('/api/vendor/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status: newStatus })
    });
    fetchData(vendor.shop_name);
  }

  async function deleteAccount() {
    if (!confirm('Are you sure you want to delete your shop? This cannot be undone and will remove your shop from the app.')) return;
    try {
      const res = await fetch(`/api/vendor/profile?shop=${encodeURIComponent(vendor.shop_name)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('Shop deleted successfully');
        localStorage.removeItem('vendor');
        router.push('/vendor/login');
      } else {
        alert('Failed to delete shop: ' + data.error);
      }
    } catch (err) {
      alert('Error deleting shop');
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setNewItem({ ...newItem, emoji: data.path });
      } else {
        alert('Upload failed: ' + data.error);
        setImagePreview(null);
      }
    } catch (err) {
      alert('Upload error');
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  }

  async function addItem(e) {
    e.preventDefault();
    const imageEmoji = imageMode === 'image' && newItem.emoji.startsWith('/uploads/') ? newItem.emoji : newItem.emoji;
    await fetch('/api/vendor/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newItem, shop: vendor.shop_name, imageEmoji })
    });
    setNewItem({ name: '', price: '', category: '', emoji: '🍽️', stock: '' });
    setImageMode('emoji');
    setImagePreview(null);
    fetchData(vendor.shop_name);
  }

  async function updateStock(itemId, newStock) {
    await fetch('/api/vendor/inventory', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: itemId, stock: newStock })
    });
    fetchData(vendor.shop_name);
  }

  async function deleteItem(itemId) {
    if (!confirm('Delete this item?')) return;
    await fetch('/api/vendor/inventory', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: itemId })
    });
    fetchData(vendor.shop_name);
  }

  if (!vendor) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Loading...</div>;

  const activeOrders = orders.filter(o => o.status !== 'Completed');
  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const preparingCount = orders.filter(o => o.status === 'Preparing').length;
  const readyCount = orders.filter(o => o.status === 'Ready').length;
  const inputClass = 'w-full p-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-slate-900 bg-white';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      {/* Header */}
      <nav className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
              {vendor.shop_name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{vendor.shop_name}</h1>
              <p className="text-sm text-slate-400">Vendor Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/vendor/analytics"
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-500 transition-all flex items-center gap-2"
            >
              📊 Analytics
            </Link>
            <button onClick={deleteAccount} className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-semibold text-sm hover:bg-red-500 hover:text-white transition-all">
              Delete Shop
            </button>
            <button onClick={() => { localStorage.removeItem('vendor'); router.push('/vendor/login'); }} className="px-4 py-2 bg-slate-700 text-white rounded-xl font-semibold text-sm hover:bg-slate-600 transition-all">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Shop Status Toggle Card */}
        <div className="mb-8 bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Shop Status</h2>
              <p className="text-slate-400 text-sm">Control whether you accept new orders</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleShopStatus}
                  disabled={statusLoading}
                  className={`relative w-16 h-8 rounded-full transition-all ${isAcceptingOrders ? 'bg-green-500' : 'bg-red-500'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-lg ${isAcceptingOrders ? 'left-9' : 'left-1'}`}></div>
                </button>
                <span className={`font-bold ${isAcceptingOrders ? 'text-green-400' : 'text-red-400'}`}>
                  {isAcceptingOrders ? 'ACCEPTING ORDERS' : 'NOT ACCEPTING'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <label className="text-slate-400">Schedule Close:</label>
                <input
                  type="time"
                  value={scheduleClose}
                  onChange={(e) => setScheduleClose(e.target.value)}
                  className="bg-slate-700 border border-slate-600 text-white px-3 py-1 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-6 rounded-2xl shadow-lg shadow-orange-500/30">
            <p className="text-white/70 text-sm font-medium">Pending Orders</p>
            <p className="text-4xl font-bold text-white mt-2">{pendingCount}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-6 rounded-2xl shadow-lg shadow-green-500/30">
            <p className="text-white/70 text-sm font-medium">Ready for Pickup</p>
            <p className="text-4xl font-bold text-white mt-2">{readyCount}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-6 rounded-2xl shadow-lg shadow-blue-500/30">
            <p className="text-white/70 text-sm font-medium">Preparing 🍳</p>
            <p className="text-4xl font-bold text-white mt-2">{preparingCount}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-2xl shadow-lg shadow-purple-500/30">
            <p className="text-white/70 text-sm font-medium">Today's Orders</p>
            <p className="text-4xl font-bold text-white mt-2">{orders.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button onClick={() => setActiveTab('orders')} className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'orders' ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            📋 Live Orders {activeOrders.length > 0 && <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-sm">{activeOrders.length}</span>}
          </button>
          <button onClick={() => setActiveTab('inventory')} className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'inventory' ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            📦 Inventory
          </button>
        </div>

        {/* Live Orders Tab */}
        {activeTab === 'orders' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeOrders.length === 0 && (
              <div className="col-span-full text-center py-20 bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-700">
                <div className="text-6xl mb-4">☕</div>
                <h3 className="text-xl font-bold text-slate-500">No active orders</h3>
                <p className="text-slate-500 mt-2">New orders will appear here</p>
              </div>
            )}
            {activeOrders.map((order) => (
              <div key={order.id} className={`bg-slate-800/80 rounded-2xl overflow-hidden border-2 ${order.status === 'Pending' ? 'border-amber-500/50' :
                order.status === 'Preparing' ? 'border-blue-500/50' :
                  'border-green-500/50'
                } shadow-xl`}>
                <div className={`p-4 ${order.status === 'Pending' ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20' :
                  order.status === 'Preparing' ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20' :
                    'bg-gradient-to-r from-green-500/20 to-emerald-500/20'
                  }`}>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-white">#{order.id}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${order.status === 'Pending' ? 'bg-amber-500 text-white' :
                      order.status === 'Preparing' ? 'bg-blue-500 text-white' :
                        'bg-green-500 text-white'
                      }`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mt-1">{order.customer_name}</p>
                </div>

                <div className="p-4 space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-slate-200">
                      <span>{item.qty}× {item.name}</span>
                      <span className="text-slate-400">₹{item.price * item.qty}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-slate-900/50 flex justify-between items-center">
                  <span className="text-xl font-bold text-white">₹{order.total}</span>
                  <div className="flex gap-2">
                    {order.status === 'Pending' && (
                      <button onClick={() => updateStatus(order.id, 'Preparing')} className="px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all">
                        🍳 Start Preparing
                      </button>
                    )}
                    {order.status === 'Preparing' && (
                      <button onClick={() => updateStatus(order.id, 'Ready')} className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-green-500/30 transition-all">
                        ✓ Mark Ready
                      </button>
                    )}
                    {order.status === 'Ready' && (
                      <button onClick={() => updateStatus(order.id, 'Completed')} className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all">
                        ✓✓ Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Item Form */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-xl h-fit">
              <h3 className="font-bold text-lg text-slate-800 mb-4">Add New Item</h3>
              <form onSubmit={addItem} className="space-y-4">
                <input placeholder="Item Name" className={inputClass} value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} required />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Price ₹" type="number" className={inputClass} value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} required />
                  <input placeholder="Stock" type="number" className={inputClass} value={newItem.stock} onChange={e => setNewItem({ ...newItem, stock: e.target.value })} required />
                </div>
                <input placeholder="Category" className={inputClass} value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} required />

                {/* Image Mode Toggle */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-600">Item Image</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setImageMode('emoji')} className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition ${imageMode === 'emoji' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>🎨 Emoji</button>
                    <button type="button" onClick={() => setImageMode('image')} className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition ${imageMode === 'image' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>📷 Image</button>
                  </div>

                  {imageMode === 'emoji' && (
                    <div className="flex items-center gap-2">
                      <input placeholder="Enter emoji 🍔" className={`${inputClass} text-center text-2xl`} value={newItem.emoji} onChange={e => setNewItem({ ...newItem, emoji: e.target.value })} />
                      <span className="text-4xl bg-slate-100 p-2 rounded">{newItem.emoji || '🍽️'}</span>
                    </div>
                  )}

                  {imageMode === 'image' && (
                    <div className="space-y-2">
                      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                      <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition">
                        {imagePreview ? (
                          <div className="relative">
                            <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                            {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg"><span className="text-white font-bold">Uploading...</span></div>}
                          </div>
                        ) : (
                          <div className="py-4"><span className="text-3xl">📷</span><p className="text-sm text-slate-500 mt-2">Click to upload image</p></div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button type="submit" className="w-full py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
                  Add Item +
                </button>
              </form>
            </div>

            {/* Inventory List */}
            <div className="lg:col-span-2 space-y-4">
              {inventory.length === 0 && (
                <div className="text-center py-20 bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-700">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-xl font-bold text-slate-500">No items yet</h3>
                  <p className="text-slate-500 mt-2">Add your first menu item</p>
                </div>
              )}
              {inventory.map(item => (
                <div key={item.id} className="bg-slate-800 p-5 rounded-2xl flex items-center justify-between gap-4 border border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-700 rounded-xl flex items-center justify-center overflow-hidden">
                      {item.image_emoji?.startsWith('/uploads/') ? (
                        <img src={item.image_emoji} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">{item.image_emoji}</span>
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-white block">{item.name}</span>
                      <span className="text-slate-400 text-sm">₹{item.price} • {item.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateStock(item.id, Math.max(0, item.stock_quantity - 1))} className="w-8 h-8 bg-slate-700 text-white rounded-lg font-bold hover:bg-slate-600">−</button>
                      <input
                        type="number"
                        min="0"
                        value={item.stock_quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          updateStock(item.id, Math.max(0, val));
                        }}
                        className="w-16 h-8 text-center bg-slate-700 text-white font-bold rounded-lg border border-slate-600 focus:border-indigo-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button onClick={() => updateStock(item.id, item.stock_quantity + 1)} className="w-8 h-8 bg-slate-700 text-white rounded-lg font-bold hover:bg-slate-600">+</button>
                    </div>
                    <button onClick={() => deleteItem(item.id)} className="text-red-400 hover:text-red-300 font-bold text-sm">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}