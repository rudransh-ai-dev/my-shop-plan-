import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Package, RefreshCw, Zap, Activity } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';
import client from '../api/client';
import { useTheme } from '../context/ThemeContext';

const AIInsights = () => {
  const { darkMode } = useTheme();
  const [forecast, setForecast] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('forecast');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [f, a, r] = await Promise.all([
        client.get('/analytics/forecast'),
        client.get('/analytics/anomalies'),
        client.get('/analytics/inventory-optimization'),
      ]);
      setForecast(f.data);
      setAnomalies(a.data);
      setRecommendations(r.data);
    } catch (err) {
      console.error('AI Insights fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const cardClass = `rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
    darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'
  }`;
  const textPrimary = darkMode ? 'text-gray-100' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-slate-500';
  const textMuted = darkMode ? 'text-gray-500' : 'text-slate-400';
  const chartTextColor = darkMode ? '#94a3b8' : '#64748b';
  const chartGridColor = darkMode ? '#1e293b' : '#e2e8f0';

  const tabs = [
    { id: 'forecast', label: 'Sales Forecast', icon: TrendingUp, color: 'indigo' },
    { id: 'anomalies', label: 'Anomaly Detection', icon: AlertTriangle, color: 'red' },
    { id: 'restock', label: 'Smart Restock', icon: Package, color: 'emerald' },
  ];

  if (loading) {
    return (
      <div className={`flex h-64 items-center justify-center ${textSecondary}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          <span>Training models...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between pb-6 border-b mb-8"
        style={{ borderColor: darkMode ? '#1e293b' : '#e2e8f0' }}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold leading-7 sm:text-3xl ${textPrimary}`}>
                AI Insights
              </h2>
              <p className={`mt-0.5 text-sm ${textSecondary}`}>
                BCA6004 — Data Science & Machine Learning
              </p>
            </div>
          </div>
        </div>
        <button onClick={fetchAll}
          className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20">
          <RefreshCw className="h-4 w-4" /> Refresh Models
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>ML Model</p>
            <div className="p-2 rounded-lg bg-indigo-500/10"><Zap className="h-5 w-5 text-indigo-500" /></div>
          </div>
          <p className={`text-xl font-bold ${textPrimary}`}>Linear Regression</p>
          <p className={`text-xs mt-1 ${textMuted}`}>sklearn.linear_model</p>
        </div>
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Anomalies Detected</p>
            <div className="p-2 rounded-lg bg-red-500/10"><AlertTriangle className="h-5 w-5 text-red-500" /></div>
          </div>
          <p className={`text-3xl font-bold ${textPrimary}`}>{anomalies.length}</p>
          <p className={`text-xs mt-1 ${textMuted}`}>Z-Score threshold: |2.5|</p>
        </div>
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Restock Alerts</p>
            <div className="p-2 rounded-lg bg-emerald-500/10"><Activity className="h-5 w-5 text-emerald-500" /></div>
          </div>
          <p className={`text-3xl font-bold ${textPrimary}`}>{recommendations.length}</p>
          <p className={`text-xs mt-1 ${textMuted}`}>Products running low</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? `bg-${tab.color}-600 text-white shadow-lg shadow-${tab.color}-600/20`
                : darkMode
                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            style={activeTab === tab.id ? {
              backgroundColor: tab.color === 'indigo' ? '#4f46e5' : tab.color === 'red' ? '#dc2626' : '#059669'
            } : {}}>
            <tab.icon className="h-4 w-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'forecast' && (
        <div className={cardClass}>
          <h3 className={`text-lg font-bold mb-2 ${textPrimary}`}>📈 Sales Forecast (Next 7 Days)</h3>
          <p className={`text-sm mb-6 ${textMuted}`}>Predicted using <code className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-xs">sklearn.linear_model.LinearRegression</code> trained on 30-day historical data</p>
          {forecast.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: chartTextColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: chartTextColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px', border: 'none',
                      boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.2)',
                      backgroundColor: darkMode ? '#1e293b' : '#fff',
                      color: darkMode ? '#e2e8f0' : '#1e293b'
                    }}
                    formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Predicted Sales']}
                  />
                  <Area type="monotone" dataKey="estimated_value" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#forecastGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-16 ${textMuted}`}>
              <Brain className="h-12 w-12 mb-3 opacity-20" />
              <p>Not enough historical data to train the model yet.</p>
              <p className="text-xs mt-1">Need at least 7 days of sales data.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'anomalies' && (
        <div className={cardClass}>
          <h3 className={`text-lg font-bold mb-2 ${textPrimary}`}>🔍 Transaction Anomaly Detection</h3>
          <p className={`text-sm mb-6 ${textMuted}`}>Statistical outliers identified using <code className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-xs">Z-Score = (X - μ) / σ</code></p>
          {anomalies.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-slate-200'}`}>
                    <th className={`text-left py-3 px-4 font-semibold ${textSecondary}`}>Invoice</th>
                    <th className={`text-left py-3 px-4 font-semibold ${textSecondary}`}>Amount</th>
                    <th className={`text-left py-3 px-4 font-semibold ${textSecondary}`}>Z-Score</th>
                    <th className={`text-left py-3 px-4 font-semibold ${textSecondary}`}>Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {anomalies.map((a, i) => (
                    <tr key={i} className={`border-b ${darkMode ? 'border-gray-800' : 'border-slate-100'}`}>
                      <td className={`py-3 px-4 font-mono text-xs ${textPrimary}`}>{a.invoice_number}</td>
                      <td className={`py-3 px-4 font-bold ${textPrimary}`}>₹{Number(a.amount).toFixed(2)}</td>
                      <td className={`py-3 px-4 font-mono ${Math.abs(a.z_score) > 3.5 ? 'text-red-500' : 'text-amber-500'}`}>{a.z_score}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                          a.severity === 'HIGH'
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>{a.severity}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-16 ${textMuted}`}>
              <AlertTriangle className="h-12 w-12 mb-3 opacity-20" />
              <p>No anomalies detected. All transactions are within normal range.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'restock' && (
        <div className={cardClass}>
          <h3 className={`text-lg font-bold mb-2 ${textPrimary}`}>📦 Smart Restock Recommendations</h3>
          <p className={`text-sm mb-6 ${textMuted}`}>Predicted using <code className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs">Consumption Velocity = Σ(sold) / days</code></p>
          {recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((r, i) => (
                <div key={i} className={`p-4 rounded-xl border-l-4 ${
                  r.status === 'RESTOCK_URGENT'
                    ? 'border-l-red-500 ' + (darkMode ? 'bg-red-500/5 border border-red-500/10' : 'bg-red-50 border border-red-100')
                    : 'border-l-amber-500 ' + (darkMode ? 'bg-amber-500/5 border border-amber-500/10' : 'bg-amber-50 border border-amber-100')
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`font-bold ${textPrimary}`}>{r.product_name}</p>
                      <p className={`text-xs mt-1 ${textMuted}`}>
                        Velocity: <span className="font-mono">{r.daily_velocity}</span> units/day
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      r.status === 'RESTOCK_URGENT'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-amber-500/10 text-amber-500'
                    }`}>{r.days_to_zero} days left</span>
                  </div>
                  <div className="mt-3 flex items-center gap-4">
                    <div className={`text-xs ${textMuted}`}>Current Stock: <span className="font-bold">{r.current_stock}</span></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-16 ${textMuted}`}>
              <Package className="h-12 w-12 mb-3 opacity-20" />
              <p>All products have sufficient stock. No restocking needed.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIInsights;
