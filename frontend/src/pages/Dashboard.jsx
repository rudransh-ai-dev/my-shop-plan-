import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, TrendingUp, Package, AlertCircle, TrendingDown, Target, Calendar } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import client from '../api/client';
import { useTheme } from '../context/ThemeContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 25 } },
};

const chartVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 25 } },
};

const FILTER_OPTIONS = [
  { label: 'All Time', value: 'all' },
  { label: 'This Year', value: 'year' },
  { label: 'This Month', value: 'month' },
  { label: 'Custom', value: 'custom' },
];

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const Dashboard = () => {
  const { darkMode } = useTheme();
  const [metrics, setMetrics] = useState({
    total_sales: 0,
    total_profit: 0,
    avg_discount: 0,
    total_orders: 0,
    sales_by_region: [],
    sales_by_segment: [],
    top_categories: [],
    monthly_trend: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterMode, setFilterMode] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      let params = '';
      if (filterMode === 'year') params = `?year=${currentYear}`;
      else if (filterMode === 'month') params = `?year=${currentYear}&month=${currentMonth}`;
      else if (filterMode === 'custom' && customStart && customEnd) params = `?start_date=${customStart}&end_date=${customEnd}`;
      const response = await client.get(`/dashboard/metrics${params}`);
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
  }, [filterMode, customStart, customEnd]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#facc15'];
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
          <span>Loading advanced metrics...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div className="pb-8" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div className="md:flex md:items-center md:justify-between pb-6 border-b mb-8 transition-colors duration-300 flex-wrap gap-4"
        style={{ borderColor: darkMode ? '#1e293b' : '#e2e8f0' }}
        variants={itemVariants}
      >
        <div className="flex-1 min-w-0">
          <h2 className={`text-2xl font-bold leading-7 sm:text-3xl sm:truncate ${textPrimary}`}>
            Executive Dashboard
          </h2>
          <p className={`mt-1 text-sm ${textSecondary}`}>
            Performance metrics — filter by time period.
          </p>
        </div>
        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {FILTER_OPTIONS.map(opt => (
            <motion.button 
              key={opt.value} 
              onClick={() => setFilterMode(opt.value)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                filterMode === opt.value 
                  ? 'bg-indigo-600 border-indigo-600 text-white' 
                  : darkMode ? 'border-gray-700 text-gray-400 hover:bg-gray-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Calendar className="h-3 w-3" />
              {opt.label}
            </motion.button>
          ))}
          {filterMode === 'custom' && (
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
                className={`px-2 py-1.5 rounded-lg border text-xs ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'border-slate-300 text-slate-700'}`} />
              <span className={`text-xs ${textMuted}`}>to</span>
              <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
                className={`px-2 py-1.5 rounded-lg border text-xs ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'border-slate-300 text-slate-700'}`} />
            </div>
          )}
        </div>
      </motion.div>

      {error && (
        <motion.div className="mb-8 bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center text-red-500"
          variants={itemVariants}
        >
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </motion.div>
      )}

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {[
          { label: 'Total Sales (Lifetime)', value: `₹${(metrics.total_sales || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, icon: TrendingUp, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-500/10' },
          { label: 'Total Profit', value: `₹${(metrics.total_profit || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, icon: IndianRupee, iconColor: 'text-indigo-500', iconBg: 'bg-indigo-500/10' },
          { label: 'Average Discount Given', value: `${(metrics.avg_discount * 100 || 0).toFixed(1)}%`, icon: Target, iconColor: 'text-amber-500', iconBg: 'bg-amber-500/10' },
        ].map((card, i) => (
          <motion.div key={i} className={cardClass} variants={itemVariants} whileHover={{ y: -4, boxShadow: '0 12px 24px -8px rgba(0,0,0,0.15)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>{card.label}</p>
              <div className={`p-2 rounded-lg ${card.iconBg}`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
            <p className={`text-3xl font-bold ${textPrimary}`}>{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales by Region */}
        <motion.div className={cardClass} variants={chartVariants}>
          <h3 className={`text-lg font-bold mb-6 pb-4 border-b ${textPrimary}`}
            style={{ borderColor: darkMode ? '#1e293b' : '#f1f5f9' }}>
            Revenue by Region
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={metrics.sales_by_region} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                <XAxis dataKey="name" tick={{ fill: chartTextColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chartTextColor, fontSize: 12 }} tickFormatter={(value) => `₹${value / 1000}k`} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: darkMode ? '#1e293b' : '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: darkMode ? '#1e293b' : '#fff', color: darkMode ? '#e2e8f0' : '#1e293b' }}
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Sales']}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {metrics.sales_by_region.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Customer Segments */}
        <motion.div className={cardClass} variants={chartVariants}>
          <h3 className={`text-lg font-bold mb-6 pb-4 border-b ${textPrimary}`}
            style={{ borderColor: darkMode ? '#1e293b' : '#f1f5f9' }}>
            Sales by Customer Segment
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie
                  data={metrics.sales_by_segment}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {metrics.sales_by_segment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Sales']}
                  contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: darkMode ? '#1e293b' : '#fff', color: darkMode ? '#e2e8f0' : '#1e293b' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <motion.div className="grid grid-cols-1 gap-6" variants={chartVariants}>
        <div className={cardClass}>
          <h3 className={`text-lg font-bold mb-6 pb-4 border-b ${textPrimary}`}
            style={{ borderColor: darkMode ? '#1e293b' : '#f1f5f9' }}>
            Most Profitable Product Categories
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart layout="vertical" data={metrics.top_categories} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartGridColor} />
                <XAxis type="number" tick={{ fill: chartTextColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fill: chartTextColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: darkMode ? '#1e293b' : '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: darkMode ? '#1e293b' : '#fff', color: darkMode ? '#e2e8f0' : '#1e293b' }}
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Profit generated']}
                />
                <Bar dataKey="profit" radius={[0, 6, 6, 0]} barSize={24}>
                  {metrics.top_categories?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={'#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
