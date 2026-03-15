import React, { useState, useEffect } from 'react';
import { IndianRupee, PieChart as PieChartIcon, TrendingUp, AlertCircle, FileText } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import client from '../api/client';

const Reports = () => {
    const [metrics, setMetrics] = useState({
        daily_sales: 0,
        monthly_revenue: 0,
        top_products: [],
        gst_summary: {
            cgst: 0,
            sgst: 0,
            igst: 0,
            total_tax: 0
        }
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

    const PRODUCT_COLORS = ['#4f46e5', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];
    const GST_COLORS = ['#3b82f6', '#10b981', '#f59e0b']; // Blue for CGST, Green SGST, Yellow IGST

    if (loading) {
        return <div className="flex h-64 items-center justify-center text-slate-500">Loading reports...</div>;
    }

    const { gst_summary } = metrics;
    // Prepare data for GST Pie Chart
    const gstData = [
        { name: 'CGST', value: gst_summary?.cgst || 0 },
        { name: 'SGST', value: gst_summary?.sgst || 0 },
        { name: 'IGST', value: gst_summary?.igst || 0 },
    ].filter(item => item.value > 0); // Only show non-zero taxes

    return (
        <div className="pb-12">
            <div className="md:flex md:items-center md:justify-between pb-6 border-b border-slate-200 mb-8">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl sm:truncate">
                        GST & Financial Reports
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        View your monthly sales performance and tax liabilities.
                    </p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition"
                    >
                        <FileText className="-ml-1 mr-2 h-5 w-5 text-slate-500" aria-hidden="true" />
                        Export PDF
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-8 bg-red-50 p-4 rounded-md flex items-center text-red-700">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    {error}
                </div>
            )}

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center text-slate-500 mb-2">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        <h3 className="text-sm font-medium uppercase tracking-wider">Today's Sales</h3>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">₹{metrics.daily_sales.toFixed(2)}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center text-indigo-500 mb-2">
                        <IndianRupee className="h-5 w-5 mr-2" />
                        <h3 className="text-sm font-medium uppercase tracking-wider text-slate-500">Monthly Revenue</h3>
                    </div>
                    <p className="text-3xl font-bold text-indigo-700">₹{metrics.monthly_revenue.toFixed(2)}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center text-red-500 mb-2">
                        <PieChartIcon className="h-5 w-5 mr-2" />
                        <h3 className="text-sm font-medium uppercase tracking-wider text-slate-500">Total GST Liability</h3>
                    </div>
                    <p className="text-3xl font-bold text-red-600">₹{(gst_summary?.total_tax || 0).toFixed(2)}</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-end">
                    <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 mb-2">
                        <span className="text-slate-500 font-medium">CGST</span>
                        <span className="font-bold text-slate-800">₹{(gst_summary?.cgst || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 mb-2">
                        <span className="text-slate-500 font-medium">SGST</span>
                        <span className="font-bold text-slate-800">₹{(gst_summary?.sgst || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">IGST</span>
                        <span className="font-bold text-slate-800">₹{(gst_summary?.igst || 0).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                
                {/* Top Products Bar Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">
                        Top Selling Products
                    </h3>
                    <div className="h-72">
                        {metrics.top_products && metrics.top_products.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={metrics.top_products}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                                    <YAxis tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                                    <Tooltip 
                                        cursor={{fill: '#f8fafc'}}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="sold" name="Units Sold" radius={[4, 4, 0, 0]} barSize={40}>
                                        {metrics.top_products.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PRODUCT_COLORS[index % PRODUCT_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400">No product data available</div>
                        )}
                    </div>
                </div>

                {/* GST Distribution Pie Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">
                        GST Distribution (Current Month)
                    </h3>
                    <div className="h-72">
                        {gstData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={gstData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {gstData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={GST_COLORS[index % GST_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value) => `₹${value.toFixed(2)}`}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400">No GST data available yet</div>
                        )}
                    </div>
                </div>

            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                 <h4 className="font-semibold text-slate-800">Notes on GST Liability</h4>
                 <p className="text-sm text-slate-600 mt-2">
                     The GST values shown above represent your total tax liability for the current month based on generated invoices. 
                     CGST (Central Tax) and SGST (State Tax) apply to intra-state sales, while IGST applies to inter-state sales. 
                     Ensure you file your GST returns (GSTR-1, GSTR-3B) before their respective due dates using these calculated figures.
                 </p>
            </div>
        </div>
    );
};

export default Reports;
