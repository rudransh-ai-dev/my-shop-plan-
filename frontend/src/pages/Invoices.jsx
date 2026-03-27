import React, { useState, useEffect } from 'react';
import { Search, Loader2, ArrowRight } from 'lucide-react';
import client from '../api/client';
import { useTheme } from '../context/ThemeContext';

const Orders = () => {
  const { darkMode } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 50;

  const fetchOrders = async (currentPage = 1, searchQuery = '') => {
    try {
      setLoading(true);
      const skip = (currentPage - 1) * limit;
      const params = { skip, limit };
      if (searchQuery) {
        params.customer_name = searchQuery;
      }
      const response = await client.get('/orders', { params });
      setOrders(response.data.data);
      setTotalCount(response.data.total);
      setTotalPages(Math.ceil(response.data.total / limit));
      setError(null);
    } catch (err) {
      setError('Failed to fetch orders data. Ensure backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders(page, search);
    }, 400); // debounce search
    return () => clearTimeout(timer);
  }, [page, search]);

  const textPrimary = darkMode ? 'text-gray-100' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-slate-500';
  const bgCard = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200';
  const bgInput = darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-slate-300 text-slate-900';
  const rowHover = darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-slate-50';

  return (
    <div className="pb-8">
      <div className="md:flex md:items-center md:justify-between pb-6 border-b mb-8"
        style={{ borderColor: darkMode ? '#1e293b' : '#e2e8f0' }}>
        <div>
          <h2 className={`text-2xl font-bold leading-7 sm:text-3xl ${textPrimary}`}>Orders List</h2>
          <p className={`mt-1 text-sm ${textSecondary}`}>Viewing {totalCount.toLocaleString()} lifetime orders.</p>
        </div>
        <div className="mt-4 md:mt-0 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className={`block w-full sm:w-80 pl-10 pr-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors ${bgInput}`}
            placeholder="Search by customer name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // reset to first page on search
            }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
          {error}
        </div>
      )}

      <div className={`overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-xl ${bgCard} border`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-800">
            <thead className={darkMode ? 'bg-gray-800' : 'bg-slate-50'}>
              <tr>
                <th className={`py-3.5 pl-4 pr-3 text-left text-sm font-semibold ${textPrimary}`}>Order ID</th>
                <th className={`px-3 py-3.5 text-left text-sm font-semibold ${textPrimary}`}>Date</th>
                <th className={`px-3 py-3.5 text-left text-sm font-semibold ${textPrimary}`}>Customer</th>
                <th className={`px-3 py-3.5 text-left text-sm font-semibold ${textPrimary}`}>Segment</th>
                <th className={`px-3 py-3.5 text-right text-sm font-semibold ${textPrimary}`}>Items</th>
                <th className={`px-3 py-3.5 text-right text-sm font-semibold ${textPrimary}`}>Total Revenue</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-gray-200 dark:divide-gray-800 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500 mb-3" />
                    Loading big data...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">No orders found.</td>
                </tr>
              ) : (
                orders.map((order) => {
                  const totalItems = order.item_count ?? (order.items?.reduce((acc, curr) => acc + curr.quantity, 0) ?? 0);
                  const totalRevenue = order.total_sales ?? (order.items?.reduce((acc, curr) => acc + Number(curr.sales), 0) ?? 0);
                  const totalProfit = order.total_profit ?? 0;
                  
                  return (
                    <tr key={order.id} className={`transition-colors duration-150 ${rowHover}`}>
                      <td className={`whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium ${textPrimary}`}>
                        {order.order_id}
                      </td>
                      <td className={`whitespace-nowrap px-3 py-4 text-sm ${textSecondary}`}>
                        {order.order_date}
                      </td>
                      <td className={`whitespace-nowrap px-3 py-4 text-sm font-medium ${textPrimary}`}>
                        {order.customer_name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          order.customer_region === 'North' ? 'bg-blue-50/10 text-blue-500 ring-blue-500/20' :
                          order.customer_region === 'South' ? 'bg-purple-50/10 text-purple-500 ring-purple-500/20' :
                          order.customer_region === 'East' ? 'bg-amber-50/10 text-amber-500 ring-amber-500/20' :
                          'bg-emerald-50/10 text-emerald-500 ring-emerald-500/20'
                        }`}>
                          {order.customer_region || 'N/A'}
                        </span>
                      </td>
                      <td className={`whitespace-nowrap px-3 py-4 text-sm text-right ${textSecondary}`}>
                        {totalItems} units
                      </td>
                      <td className={`whitespace-nowrap px-3 py-4 text-sm text-right font-medium ${textPrimary}`}>
                        ₹{Number(totalRevenue).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className={`flex items-center justify-between border-t px-4 py-3 sm:px-6 ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex flex-1 justify-between sm:hidden">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Previous</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Next</button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className={`text-sm ${textSecondary}`}>
                Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, totalCount)}</span> of <span className="font-medium">{totalCount.toLocaleString()}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 border ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50' } disabled:opacity-50 transition-colors`}
                >
                  <span className="sr-only">Previous</span>
                  ←
                </button>
                <span className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white text-gray-900 border-gray-300'}`}>
                   Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 border ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50' } disabled:opacity-50 transition-colors`}
                >
                  <span className="sr-only">Next</span>
                  →
                </button>
              </nav>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Orders;
