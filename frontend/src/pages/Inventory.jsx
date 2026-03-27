import React, { useState, useEffect } from 'react';
import { Search, Loader2, Package } from 'lucide-react';
import client from '../api/client';
import { useTheme } from '../context/ThemeContext';

const Inventory = () => {
  const { darkMode } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 50;

  const fetchProducts = async (currentPage = 1, searchQuery = '') => {
    try {
      setLoading(true);
      const skip = (currentPage - 1) * limit;
      const params = { skip, limit };
      if (searchQuery) params.search = searchQuery;
      
      const response = await client.get('/inventory', { params });
      setProducts(response.data.data);
      setTotalCount(response.data.total);
      setTotalPages(Math.ceil(response.data.total / limit));
      setError(null);
    } catch (err) {
      setError('Failed to load products portfolio.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(page, search), 400);
    return () => clearTimeout(timer);
  }, [page, search]);

  const textPrimary = darkMode ? 'text-gray-100' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-slate-500';
  const bgCard = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200';
  const bgInput = darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-slate-300 text-slate-900';

  return (
    <div className="pb-8">
      <div className="md:flex md:items-center md:justify-between pb-6 border-b mb-8"
        style={{ borderColor: darkMode ? '#1e293b' : '#e2e8f0' }}>
        <div>
          <h2 className={`text-2xl font-bold leading-7 sm:text-3xl ${textPrimary}`}>Product Portfolio</h2>
          <p className={`mt-1 text-sm ${textSecondary}`}>Viewing complete product catalog ({totalCount.toLocaleString()} items).</p>
        </div>
        <div className="mt-4 md:mt-0 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className={`block w-full sm:w-80 pl-10 pr-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors ${bgInput}`}
            placeholder="Search by product name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {error && <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">{error}</div>}

      <div className={`overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-xl ${bgCard} border`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-800">
            <thead className={darkMode ? 'bg-gray-800' : 'bg-slate-50'}>
              <tr>
                <th className={`py-3.5 pl-4 pr-3 text-left text-sm font-semibold ${textPrimary}`}>Product ID</th>
                <th className={`px-3 py-3.5 text-left text-sm font-semibold ${textPrimary}`}>Category</th>
                <th className={`px-3 py-3.5 text-left text-sm font-semibold ${textPrimary}`}>Sub-Category</th>
                <th className={`px-3 py-3.5 text-left text-sm font-semibold ${textPrimary}`}>Name</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-gray-200 dark:divide-gray-800 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-gray-500">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500 mb-3" />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-gray-500">No products found.</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className={`transition-colors duration-150 ${darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-slate-50'}`}>
                    <td className={`whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium ${textPrimary}`}>
                      {product.product_id}
                    </td>
                    <td className={`whitespace-nowrap px-3 py-4 text-sm ${textSecondary}`}>
                      <span className="inline-flex items-center rounded-md bg-indigo-50/10 px-2 py-1 text-xs font-medium text-indigo-500 ring-1 ring-inset ring-indigo-500/20">
                        {product.category}
                      </span>
                    </td>
                    <td className={`whitespace-nowrap px-3 py-4 text-sm ${textSecondary}`}>
                      {product.sub_category}
                    </td>
                    <td className={`whitespace-normal px-3 py-4 text-sm ${textPrimary}`}>
                      {product.name}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className={`flex items-center justify-between border-t px-4 py-3 sm:px-6 ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex flex-1 justify-between sm:hidden">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm">Previous</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm">Next</button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className={`text-sm ${textSecondary}`}>
                Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, totalCount)}</span> of <span className="font-medium">{totalCount.toLocaleString()}</span> products
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
