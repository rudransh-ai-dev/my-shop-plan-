import React, { useState, useEffect } from 'react';
import { IndianRupee, PieChart as PieChartIcon, TrendingUp, AlertCircle, FileText } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import client from '../api/client';
import { useTheme } from '../context/ThemeContext';

const Reports = () => {
    const { darkMode } = useTheme();
    const [metrics, setMetrics] = useState({
        daily_sales: 0,
        monthly_revenue: 0,
        top_products: [],
        gst_summary: { cgst: 0, sgst: 0, igst: 0, total_tax: 0 }
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
                setError('Failed to load reports data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, []);

    const PRODUCT_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];
    const GST_COLORS = ['#3b82f6', '#10b981', '#f59e0b'];
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mr-3"></div>
                Loading reports...
            </div>
        );
    }

    const { gst_summary } = metrics;
    const gstData = [
        { name: 'CGST', value: gst_summary?.cgst || 0 },
        { name: 'SGST', value: gst_summary?.sgst || 0 },
        { name: 'IGST', value: gst_summary?.igst || 0 },
    ].filter(item => item.value > 0);

    return (
        <div className="pb-12">
            <div className={`md:flex md:items-center md:justify-between pb-6 border-b mb-8`}
                style={{ borderColor: darkMode ? '#1e293b' : '#e2e8f0' }}>
                <div className="flex-1 min-w-0">
                    <h2 className={`text-2xl font-bold leading-7 sm:text-3xl sm:truncate ${textPrimary}`}>
                        GST & Financial Reports
                    </h2>
                    <p className={`mt-1 text-sm ${textSecondary}`}>
                        View your monthly sales performance and tax liabilities.
                    </p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                    <button type="button" onClick={() => window.print()}
                        className={`inline-flex items-center px-4 py-2.5 border rounded-lg shadow-sm text-sm font-medium transition ${
                            darkMode ? 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                        }`}>
                        <FileText className="-ml-1 mr-2 h-5 w-5" /> Export PDF
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-8 bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center text-red-500">
                    <AlertCircle className="h-5 w-5 mr-2" /> {error}
                </div>
            )}

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <div className={cardClass}>
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                        <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Today's Sales</h3>
                    </div>
                    <p className={`text-3xl font-bold ${textPrimary}`}>₹{(metrics.daily_sales || 0).toFixed(2)}</p>
                </div>
                <div className={cardClass}>
                    <div className="flex items-center gap-2 mb-2">
                        <IndianRupee className="h-5 w-5 text-indigo-500" />
                        <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Monthly Revenue</h3>
                    </div>
                    <p className="text-3xl font-bold text-indigo-500">₹{(metrics.monthly_revenue || 0).toFixed(2)}</p>
                </div>
                <div className={cardClass}>
                    <div className="flex items-center gap-2 mb-2">
                        <PieChartIcon className="h-5 w-5 text-red-500" />
                        <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Total GST Liability</h3>
                    </div>
                    <p className="text-3xl font-bold text-red-500">₹{(gst_summary?.total_tax || 0).toFixed(2)}</p>
                </div>
                <div className={`${cardClass} flex flex-col justify-end`}>
                    <div className={`flex justify-between items-center text-sm border-b pb-2 mb-2 ${darkMode ? 'border-gray-700' : 'border-slate-100'}`}>
                        <span className={`font-medium ${textSecondary}`}>CGST</span>
                        <span className={`font-bold ${textPrimary}`}>₹{(gst_summary?.cgst || 0).toFixed(2)}</span>
                    </div>
                    <div className={`flex justify-between items-center text-sm border-b pb-2 mb-2 ${darkMode ? 'border-gray-700' : 'border-slate-100'}`}>
                        <span className={`font-medium ${textSecondary}`}>SGST</span>
                        <span className={`font-bold ${textPrimary}`}>₹{(gst_summary?.sgst || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className={`font-medium ${textSecondary}`}>IGST</span>
                        <span className={`font-bold ${textPrimary}`}>₹{(gst_summary?.igst || 0).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Top Products Bar Chart */}
                <div className={cardClass}>
                    <h3 className={`text-lg font-bold mb-6 pb-4 border-b ${textPrimary}`}
                        style={{ borderColor: darkMode ? '#1e293b' : '#f1f5f9' }}>
                        Top Selling Products
                    </h3>
                    <div className="h-72">
                        {metrics.top_products && metrics.top_products.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <BarChart data={metrics.top_products} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                                    <XAxis dataKey="name" tick={{fill: chartTextColor, fontSize: 12}} axisLine={false} tickLine={false} />
                                    <YAxis tick={{fill: chartTextColor, fontSize: 12}} axisLine={false} tickLine={false} />
                                    <Tooltip 
                                        cursor={{fill: darkMode ? '#1e293b' : '#f8fafc'}}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.2)', backgroundColor: darkMode ? '#1e293b' : '#fff', color: darkMode ? '#e2e8f0' : '#1e293b' }}
                                    />
                                    <Bar dataKey="sold" name="Units Sold" radius={[6, 6, 0, 0]} barSize={40}>
                                        {metrics.top_products.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PRODUCT_COLORS[index % PRODUCT_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className={`h-full flex items-center justify-center ${textMuted}`}>No product data available</div>
                        )}
                    </div>
                </div>

                {/* GST Distribution Pie Chart */}
                <div className={cardClass}>
                    <h3 className={`text-lg font-bold mb-6 pb-4 border-b ${textPrimary}`}
                        style={{ borderColor: darkMode ? '#1e293b' : '#f1f5f9' }}>
                        GST Distribution (Current Month)
                    </h3>
                    <div className="h-72">
                        {gstData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <PieChart>
                                    <Pie data={gstData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                                        {gstData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={GST_COLORS[index % GST_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value) => `₹${value.toFixed(2)}`}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.2)', backgroundColor: darkMode ? '#1e293b' : '#fff', color: darkMode ? '#e2e8f0' : '#1e293b' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: chartTextColor }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className={`h-full flex items-center justify-center ${textMuted}`}>No GST data available yet</div>
                        )}
                    </div>
                </div>
            </div>
            
            <div className={`border rounded-xl p-5 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-slate-50 border-slate-200'}`}>
                 <h4 className={`font-semibold ${textPrimary}`}>Notes on GST Liability</h4>
                 <p className={`text-sm mt-2 ${textSecondary}`}>
                     The GST values shown above represent your total tax liability for the current month based on generated invoices. 
                     CGST (Central Tax) and SGST (State Tax) apply to intra-state sales, while IGST applies to inter-state sales. 
                     Ensure you file your GST returns (GSTR-1, GSTR-3B) before their respective due dates using these calculated figures.
                 </p>
            </div>
        </div>
    );
};

export default Reports;
