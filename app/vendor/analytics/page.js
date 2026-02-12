'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VendorAnalytics() {
    const router = useRouter();
    const [vendor, setVendor] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('week');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const storedVendor = localStorage.getItem('vendor');
        if (!storedVendor) {
            router.push('/vendor/login');
        } else {
            const v = JSON.parse(storedVendor);
            setVendor(v);
            fetchAnalytics(v.shop_name, period);
        }
    }, []);

    async function fetchAnalytics(shopName, selectedPeriod, start, end) {
        setLoading(true);
        try {
            let url = `/api/vendor/analytics?shop=${encodeURIComponent(shopName)}&period=${selectedPeriod}`;
            if (selectedPeriod === 'custom' && start && end) {
                url += `&startDate=${start}&endDate=${end}`;
            }
            const res = await fetch(url);
            const result = await res.json();
            setData(result);
        } catch (err) {
            console.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    }

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
        if (vendor && newPeriod !== 'custom') {
            fetchAnalytics(vendor.shop_name, newPeriod);
        }
    };

    const handleCustomSearch = () => {
        if (vendor && startDate && endDate) {
            fetchAnalytics(vendor.shop_name, 'custom', startDate, endDate);
        }
    };

    if (!vendor) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Loading...</div>;

    const maxHourlyOrders = data?.hourlyData?.length ? Math.max(...data.hourlyData.map(h => Number(h.order_count) || 0), 1) : 1;
    const maxCategoryRevenue = data?.categoryData?.length ? Math.max(...data.categoryData.map(c => Number(c.revenue) || 0), 1) : 1;
    const maxDailyRevenue = data?.dailyTrend?.length ? Math.max(...data.dailyTrend.map(d => Number(d.revenue) || 0), 1) : 1;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
            {/* Header */}
            <nav className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/vendor/dashboard" className="text-slate-400 hover:text-white transition">
                            ← Back
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-white">Analytics Dashboard</h1>
                            <p className="text-sm text-slate-400">{vendor.shop_name}</p>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-8">
                {/* Period Selector */}
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-4 mb-8 border border-slate-700/50 flex flex-wrap items-center gap-4">
                    <span className="text-slate-400 font-medium">Time Period:</span>
                    <div className="flex gap-2">
                        {['today', 'week', 'month'].map(p => (
                            <button
                                key={p}
                                onClick={() => handlePeriodChange(p)}
                                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${period === p
                                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    }`}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePeriodChange('custom')}
                            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${period === 'custom'
                                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                        >
                            Custom
                        </button>
                    </div>

                    {period === 'custom' && (
                        <div className="flex items-center gap-2 ml-4">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded-lg text-sm"
                            />
                            <span className="text-slate-400">to</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded-lg text-sm"
                            />
                            <button
                                onClick={handleCustomSearch}
                                className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-semibold text-sm hover:bg-indigo-400"
                            >
                                Apply
                            </button>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-400">Loading analytics...</p>
                    </div>
                ) : data ? (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl shadow-lg shadow-green-500/30">
                                <p className="text-white/70 text-sm font-medium">Total Revenue</p>
                                <p className="text-4xl font-bold text-white mt-2">₹{data.kpis.totalRevenue.toLocaleString()}</p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl shadow-lg shadow-blue-500/30">
                                <p className="text-white/70 text-sm font-medium">Total Orders</p>
                                <p className="text-4xl font-bold text-white mt-2">{data.kpis.totalOrders}</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-2xl shadow-lg shadow-purple-500/30">
                                <p className="text-white/70 text-sm font-medium">Avg Order Value</p>
                                <p className="text-4xl font-bold text-white mt-2">₹{data.kpis.avgOrderValue}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            {/* Top Selling Items */}
                            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
                                <h3 className="text-lg font-bold text-white mb-4">🏆 Top Selling Items</h3>
                                {data.topItems.length === 0 ? (
                                    <p className="text-slate-500 text-center py-8">No data available</p>
                                ) : (
                                    <div className="space-y-3">
                                        {data.topItems.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 bg-slate-700/50 p-3 rounded-xl">
                                                <span className="text-2xl">{item.image_emoji?.startsWith('/uploads/') ? '🍽️' : item.image_emoji}</span>
                                                <div className="flex-grow">
                                                    <p className="font-medium text-white">{item.name}</p>
                                                    <p className="text-sm text-slate-400">{item.total_qty} sold • ₹{item.revenue}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">#{idx + 1}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Hourly Distribution */}
                            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-white">⏰ Peak Hours</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded bg-gradient-to-t from-indigo-600 to-cyan-400"></div>
                                        <span className="text-xs text-slate-400">Orders</span>
                                    </div>
                                </div>
                                {data.hourlyData.length === 0 ? (
                                    <p className="text-slate-500 text-center py-8">No data available</p>
                                ) : (
                                    <div className="flex">
                                        {/* Y-Axis */}
                                        <div className="flex flex-col justify-between pr-2 text-right" style={{ height: '140px' }}>
                                            <span className="text-xs text-slate-500">{maxHourlyOrders}</span>
                                            <span className="text-xs text-slate-500">{Math.round(maxHourlyOrders / 2)}</span>
                                            <span className="text-xs text-slate-500">0</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-end gap-1" style={{ height: '140px' }}>
                                                {Array.from({ length: 24 }, (_, i) => {
                                                    const hourData = data.hourlyData.find(h => h.hour === `${i}:00`);
                                                    const count = Number(hourData?.order_count) || 0;
                                                    const barHeight = maxHourlyOrders > 0 ? Math.max((count / maxHourlyOrders) * 130, count > 0 ? 8 : 2) : 2;
                                                    return (
                                                        <div key={i} className="flex-1 flex items-end" style={{ height: '140px' }}>
                                                            <div
                                                                className="w-full bg-gradient-to-t from-indigo-600 to-cyan-400 rounded-t transition-all hover:from-indigo-500 hover:to-cyan-300"
                                                                style={{ height: `${barHeight}px`, minHeight: '2px' }}
                                                                title={`${i}:00 - ${count} orders`}
                                                            ></div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="flex gap-1 mt-1 border-t border-slate-700 pt-1">
                                                {Array.from({ length: 24 }, (_, i) => (
                                                    <div key={i} className="flex-1 text-center">
                                                        {i % 4 === 0 && <span className="text-xs text-slate-500">{i}h</span>}
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-center text-xs text-slate-500 mt-1">Hour of Day</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Category Distribution */}
                            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
                                <h3 className="text-lg font-bold text-white mb-4">📊 Category Breakdown</h3>
                                {data.categoryData.length === 0 ? (
                                    <p className="text-slate-500 text-center py-8">No data available</p>
                                ) : (
                                    <div className="space-y-3">
                                        {data.categoryData.map((cat, idx) => {
                                            const percentage = (Number(cat.revenue) / maxCategoryRevenue) * 100;
                                            const colors = ['from-blue-500 to-indigo-500', 'from-green-500 to-emerald-500', 'from-amber-500 to-orange-500', 'from-purple-500 to-pink-500', 'from-cyan-500 to-teal-500'];
                                            return (
                                                <div key={idx}>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-white font-medium">{cat.category}</span>
                                                        <span className="text-slate-400">₹{cat.revenue}</span>
                                                    </div>
                                                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full bg-gradient-to-r ${colors[idx % colors.length]} rounded-full transition-all`}
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Daily Trend */}
                            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-white">📈 Last 7 Days Revenue</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded bg-gradient-to-t from-emerald-600 to-green-400"></div>
                                        <span className="text-xs text-slate-400">Revenue (₹)</span>
                                    </div>
                                </div>
                                {data.dailyTrend.length === 0 ? (
                                    <p className="text-slate-500 text-center py-8">No data available</p>
                                ) : (
                                    <div className="flex">
                                        {/* Y-Axis */}
                                        <div className="flex flex-col justify-between pr-2 text-right" style={{ height: '140px' }}>
                                            <span className="text-xs text-slate-500">₹{Math.round(maxDailyRevenue)}</span>
                                            <span className="text-xs text-slate-500">₹{Math.round(maxDailyRevenue / 2)}</span>
                                            <span className="text-xs text-slate-500">₹0</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-end gap-2" style={{ height: '140px' }}>
                                                {data.dailyTrend.map((day, idx) => {
                                                    const barHeight = maxDailyRevenue > 0 ? Math.max((Number(day.revenue) / maxDailyRevenue) * 130, 8) : 8;
                                                    return (
                                                        <div key={idx} className="flex-1 flex flex-col items-center justify-end" style={{ height: '140px' }}>
                                                            <div
                                                                className="w-full bg-gradient-to-t from-emerald-600 to-green-400 rounded-t transition-all hover:from-emerald-500"
                                                                style={{ height: `${barHeight}px`, minHeight: '8px' }}
                                                                title={`₹${Number(day.revenue).toLocaleString()}`}
                                                            ></div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="flex gap-2 mt-1 border-t border-slate-700 pt-1">
                                                {data.dailyTrend.map((day, idx) => (
                                                    <div key={idx} className="flex-1 text-center">
                                                        <span className="text-xs text-slate-400">{day.date}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-center text-xs text-slate-500 mt-1">Date</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recommendations Section */}
                        <h2 className="text-2xl font-bold text-white mb-6">💡 Smart Recommendations</h2>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Market Basket Analysis */}
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50">
                                <h3 className="text-lg font-bold text-white mb-2">🛒 Frequently Bought Together</h3>
                                <p className="text-slate-400 text-sm mb-4">Create combo offers with these pairs</p>
                                {data.recommendations.basket.length === 0 ? (
                                    <p className="text-slate-500 text-center py-4">No data yet</p>
                                ) : (
                                    <div className="space-y-3">
                                        {data.recommendations.basket.map((pair, idx) => (
                                            <div key={idx} className="bg-slate-700/50 p-3 rounded-xl">
                                                <div className="flex items-center gap-2 text-white">
                                                    <span className="font-medium">{pair.item1}</span>
                                                    <span className="text-slate-400">+</span>
                                                    <span className="font-medium">{pair.item2}</span>
                                                </div>
                                                <p className="text-xs text-emerald-400 mt-1">{pair.frequency}× ordered together</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Upsell Opportunities */}
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50">
                                <h3 className="text-lg font-bold text-white mb-2">📈 Upsell Opportunities</h3>
                                <p className="text-slate-400 text-sm mb-4">Promote these premium items</p>
                                {data.recommendations.upsell.length === 0 ? (
                                    <p className="text-slate-500 text-center py-4">No data yet</p>
                                ) : (
                                    <div className="space-y-3">
                                        {data.recommendations.upsell.map((item, idx) => (
                                            <div key={idx} className="bg-slate-700/50 p-3 rounded-xl flex items-center gap-3">
                                                <span className="text-2xl">{item.image_emoji?.startsWith('/uploads/') ? '🍽️' : item.image_emoji}</span>
                                                <div>
                                                    <p className="font-medium text-white">{item.name}</p>
                                                    <p className="text-xs text-slate-400">₹{item.price} • Avg qty: {Number(item.avg_qty).toFixed(1)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Cross-sell */}
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50">
                                <h3 className="text-lg font-bold text-white mb-2">🎯 Cross-Sell Targets</h3>
                                <p className="text-slate-400 text-sm mb-4">Most popular among customers</p>
                                {data.recommendations.crossSell.length === 0 ? (
                                    <p className="text-slate-500 text-center py-4">No data yet</p>
                                ) : (
                                    <div className="space-y-3">
                                        {data.recommendations.crossSell.map((item, idx) => (
                                            <div key={idx} className="bg-slate-700/50 p-3 rounded-xl flex items-center gap-3">
                                                <span className="text-2xl">{item.image_emoji?.startsWith('/uploads/') ? '🍽️' : item.image_emoji}</span>
                                                <div>
                                                    <p className="font-medium text-white">{item.name}</p>
                                                    <p className="text-xs text-cyan-400">{item.buyer_count} unique buyers</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-slate-400">Failed to load analytics data</p>
                    </div>
                )}
            </div>
        </div>
    );
}
