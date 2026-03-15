import React, { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, Package, AlertCircle } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import client from '../api/client';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    daily_sales: 0,
    monthly_revenue: 0,
    top_products: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await client.get('/dashboard/metrics');
        setMetrics(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const COLORS = ['#4f46e5', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];

  if (loading) {
     return <div className="flex h-64 items-center justify-center text-slate-500">Loading dashboard...</div>;
  }

  return (
    <div>
        <div className="md:flex md:items-center md:justify-between pb-6 border-b border-slate-200 mb-8">
            <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl sm:truncate">
                    Dashboard Overview
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Welcome back! Here's what's happening today.
                </p>
            </div>
        </div>

        {error && (
            <div className="mb-8 bg-red-50 p-4 rounded-md flex items-center text-red-700">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
            </div>
        )}

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Daily Sales Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
                <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 mr-4">
                    <TrendingUp className="h-8 w-8" />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Today's Sales</p>
                    <p className="text-3xl font-bold text-slate-900">₹{metrics.daily_sales.toFixed(2)}</p>
                </div>
            </div>

            {/* Monthly Revenue Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                    <IndianRupee className="h-8 w-8" />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Monthly Revenue</p>
                    <p className="text-3xl font-bold text-slate-900">₹{metrics.monthly_revenue.toFixed(2)}</p>
                </div>
            </div>

            {/* Active Inventory Products */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
                <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
                    <Package className="h-8 w-8" />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Top Active Products</p>
                    <p className="text-3xl font-bold text-slate-900">{metrics.top_products.length}</p>
                </div>
            </div>
        </div>

        {/* Charts & Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Top Products Bar Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">
                    Top Selling Products (Lifetime)
                </h3>
                {metrics.top_products.length === 0 ? (
                    <div className="h-64 flex flex-col justify-center items-center text-slate-400">
                        <Package className="h-12 w-12 mb-3 opacity-20" />
                        <p>No sales data to generate chart.</p>
                    </div>
                ) : (
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={metrics.top_products}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="sold" radius={[0, 4, 4, 0]} barSize={32}>
                                    {metrics.top_products.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
                 <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">
                    Performance Summary
                </h3>
                <div className="flex-1 flex flex-col justify-center space-y-6">
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-5 border-l-4 border-l-indigo-500">
                        <h4 className="font-semibold text-slate-800">Business Health</h4>
                        <p className="text-sm text-slate-600 mt-1">
                            Your monthly revenue stands at <span className="font-bold text-indigo-600 font-mono">₹{metrics.monthly_revenue.toFixed(2)}</span>. 
                            Ensure you actively restock your top moving items to maintain momentum!
                        </p>
                    </div>
                    {metrics.top_products[0] && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-5 border-l-4 border-l-emerald-500">
                             <h4 className="font-semibold text-emerald-900">Top Performer</h4>
                             <p className="text-sm text-emerald-800 mt-1">
                                 The product <strong>{metrics.top_products[0].name}</strong> is currently your highest selling item with {metrics.top_products[0].sold} units sold.
                             </p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    </div>
  );
};

export default Dashboard;
