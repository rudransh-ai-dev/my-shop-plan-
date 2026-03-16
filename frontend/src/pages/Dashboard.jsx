import React, { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, Package, AlertCircle, AlertTriangle, PackageX, Calendar, ShoppingCart } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import client from '../api/client';
import { useTheme } from '../context/ThemeContext';

const Dashboard = () => {
  const { darkMode } = useTheme();
  const [metrics, setMetrics] = useState({
    daily_sales: 0,
    monthly_revenue: 0,
    filtered_revenue: 0,
    top_products: [],
    low_stock_products: [],
    low_stock_count: 0,
    out_of_stock_count: 0,
    sales_by_day: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Date filter state
  const [rangeType, setRangeType] = useState('current_month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      let params = {};
      if (rangeType === 'custom' && customFrom && customTo) {
        params = { date_from: customFrom, date_to: customTo };
      } else if (rangeType !== 'current_month') {
        params = { range_type: rangeType };
      } else {
        params = { range_type: 'current_month' };
      }
      const response = await client.get('/dashboard/metrics', { params });
      setMetrics(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [rangeType, customFrom, customTo]);

  const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];
  const chartTextColor = darkMode ? '#94a3b8' : '#64748b';
  const chartGridColor = darkMode ? '#1e293b' : '#e2e8f0';

  const cardClass = `rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
    darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'
  }`;

  const textPrimary = darkMode ? 'text-gray-100' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-slate-500';
  const textMuted = darkMode ? 'text-gray-500' : 'text-slate-400';

  if (loading) {
    return (
      <div className={`flex h-64 items-center justify-center ${textSecondary}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const getStockStatusBadge = (status) => {
    if (status === 'OUT_OF_STOCK') {
      return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500/10 text-red-500 border border-red-500/20">OUT OF STOCK</span>;
    }
    return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">LOW STOCK</span>;
  };

  return (
    <div className="pb-8">
      {/* Header with Date Filter */}
      <div className="md:flex md:items-center md:justify-between pb-6 border-b mb-8 transition-colors duration-300"
        style={{ borderColor: darkMode ? '#1e293b' : '#e2e8f0' }}>
        <div className="flex-1 min-w-0">
          <h2 className={`text-2xl font-bold leading-7 sm:text-3xl sm:truncate ${textPrimary}`}>
            Dashboard Overview
          </h2>
          <p className={`mt-1 text-sm ${textSecondary}`}>
            Welcome back! Here's what's happening with your shop.
          </p>
        </div>
        
        {/* Date Range Selector */}
        <div className="mt-4 flex items-center gap-2 flex-wrap md:mt-0 md:ml-4">
          <Calendar className={`h-4 w-4 ${textMuted}`} />
          <select
            value={rangeType}
            onChange={(e) => setRangeType(e.target.value)}
            className={`text-sm rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300 ${
              darkMode
                ? 'bg-gray-800 border-gray-700 text-gray-200'
                : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            <option value="current_month">Current Month</option>
            <option value="previous_month">Previous Month</option>
            <option value="last_3_months">Last 3 Months</option>
            <option value="custom">Custom Range</option>
          </select>
          
          {rangeType === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className={`text-sm rounded-lg border px-2 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-200'
                    : 'bg-white border-slate-300 text-slate-700'
                }`}
              />
              <span className={textMuted}>to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className={`text-sm rounded-lg border px-2 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-200'
                    : 'bg-white border-slate-300 text-slate-700'
                }`}
              />
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-8 bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center text-red-500">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Today's Sales */}
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Today's Sales</p>
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
          <p className={`text-3xl font-bold ${textPrimary}`}>₹{(metrics.daily_sales || 0).toFixed(2)}</p>
        </div>

        {/* Monthly Revenue */}
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Monthly Revenue</p>
            <div className="p-2 rounded-lg bg-indigo-500/10">
              <IndianRupee className="h-5 w-5 text-indigo-500" />
            </div>
          </div>
          <p className={`text-3xl font-bold ${textPrimary}`}>₹{(metrics.monthly_revenue || 0).toFixed(2)}</p>
        </div>

        {/* Low Stock Items */}
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Low Stock Items</p>
            <div className="p-2 rounded-lg bg-amber-500/10">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
          </div>
          <p className={`text-3xl font-bold ${textPrimary}`}>{metrics.low_stock_count || 0}</p>
          <p className="text-xs text-red-500 mt-1 font-medium">{metrics.out_of_stock_count || 0} out of stock</p>
        </div>

        {/* Top Products Count */}
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Top Active Products</p>
            <div className="p-2 rounded-lg bg-violet-500/10">
              <Package className="h-5 w-5 text-violet-500" />
            </div>
          </div>
          <p className={`text-3xl font-bold ${textPrimary}`}>{metrics.top_products?.length || 0}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Sales Trend (Last 7 Days) */}
        <div className={cardClass}>
          <h3 className={`text-lg font-bold mb-6 pb-4 border-b ${textPrimary}`}
            style={{ borderColor: darkMode ? '#1e293b' : '#f1f5f9' }}>
            Sales Trend (Last 7 Days)
          </h3>
          {metrics.sales_by_day && metrics.sales_by_day.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.sales_by_day} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: chartTextColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: chartTextColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.2)',
                      backgroundColor: darkMode ? '#1e293b' : '#fff',
                      color: darkMode ? '#e2e8f0' : '#1e293b'
                    }}
                    formatter={(value) => [`₹${value.toFixed(2)}`, 'Sales']}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2.5} fill="url(#salesGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className={`h-72 flex flex-col justify-center items-center ${textMuted}`}>
              <ShoppingCart className="h-12 w-12 mb-3 opacity-20" />
              <p>No sales data for chart.</p>
            </div>
          )}
        </div>

        {/* Top Selling Products */}
        <div className={cardClass}>
          <h3 className={`text-lg font-bold mb-6 pb-4 border-b ${textPrimary}`}
            style={{ borderColor: darkMode ? '#1e293b' : '#f1f5f9' }}>
            Top Selling Products
          </h3>
          {metrics.top_products && metrics.top_products.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metrics.top_products}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartGridColor} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fill: chartTextColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: darkMode ? '#1e293b' : '#f8fafc' }}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.2)',
                      backgroundColor: darkMode ? '#1e293b' : '#fff',
                      color: darkMode ? '#e2e8f0' : '#1e293b'
                    }}
                  />
                  <Bar dataKey="sold" radius={[0, 6, 6, 0]} barSize={28}>
                    {metrics.top_products.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className={`h-72 flex flex-col justify-center items-center ${textMuted}`}>
              <Package className="h-12 w-12 mb-3 opacity-20" />
              <p>No sales data to generate chart.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row - Low Stock & Restock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Low Stock Alert Panel */}
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-6 pb-4 border-b"
            style={{ borderColor: darkMode ? '#1e293b' : '#f1f5f9' }}>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h3 className={`text-lg font-bold ${textPrimary}`}>Low Stock Alerts</h3>
            {metrics.low_stock_count > 0 && (
              <span className="ml-auto px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                {metrics.low_stock_count} items
              </span>
            )}
          </div>
          
          {metrics.low_stock_products && metrics.low_stock_products.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {metrics.low_stock_products.filter(p => p.status !== 'OK').map((product) => (
                <div key={product.id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  darkMode
                    ? 'bg-gray-800/50 border-gray-700/50'
                    : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${textPrimary}`}>{product.name}</p>
                    <p className={`text-xs ${textMuted}`}>SKU: {product.sku}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <div className="text-right">
                      <span className={`text-sm font-bold ${
                        product.shop_stock === 0 ? 'text-red-500' : 'text-amber-500'
                      }`}>
                        {product.shop_stock} left
                      </span>
                    </div>
                    {getStockStatusBadge(product.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-12 ${textMuted}`}>
              <Package className="h-10 w-10 mb-2 opacity-20" />
              <p className="text-sm">All products are well-stocked!</p>
            </div>
          )}
        </div>

        {/* Restock Reminder Panel */}
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-6 pb-4 border-b"
            style={{ borderColor: darkMode ? '#1e293b' : '#f1f5f9' }}>
            <PackageX className="h-5 w-5 text-red-500" />
            <h3 className={`text-lg font-bold ${textPrimary}`}>Restock Reminders</h3>
            {metrics.out_of_stock_count > 0 && (
              <span className="ml-auto px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                {metrics.out_of_stock_count} urgent
              </span>
            )}
          </div>

          {metrics.low_stock_products && metrics.low_stock_products.filter(p => p.status !== 'OK').length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {/* OUT OF STOCK items first */}
              {metrics.low_stock_products.filter(p => p.status === 'OUT_OF_STOCK').map((product) => (
                <div key={product.id} className={`p-3 rounded-lg border-l-4 border-l-red-500 ${
                  darkMode ? 'bg-red-500/5 border border-red-500/10' : 'bg-red-50 border border-red-100'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-semibold ${textPrimary}`}>⚠️ {product.name}</p>
                      <p className="text-xs text-red-500 font-medium mt-0.5">Completely out of stock! Needs immediate restock.</p>
                    </div>
                    {product.store_room_stock > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {product.store_room_stock} in store room
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {/* LOW STOCK items */}
              {metrics.low_stock_products.filter(p => p.status === 'LOW_STOCK').map((product) => (
                <div key={product.id} className={`p-3 rounded-lg border-l-4 border-l-amber-500 ${
                  darkMode ? 'bg-amber-500/5 border border-amber-500/10' : 'bg-amber-50 border border-amber-100'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-semibold ${textPrimary}`}>{product.name}</p>
                      <p className="text-xs text-amber-600 font-medium mt-0.5">Only {product.shop_stock} left on shop shelf. Consider restocking.</p>
                    </div>
                    {product.store_room_stock > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {product.store_room_stock} in store room
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-12 ${textMuted}`}>
              <Package className="h-10 w-10 mb-2 opacity-20" />
              <p className="text-sm">No restock reminders right now. Great!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
