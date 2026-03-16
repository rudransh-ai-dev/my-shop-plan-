import React, { useState, useEffect } from 'react';
import { Warehouse, Search, ArrowDownAZ, ArrowUpZA, ArrowRight, ShoppingCart, PackagePlus, AlertCircle, Truck } from 'lucide-react';
import client from '../api/client';
import { useTheme } from '../context/ThemeContext';

const StoreRoom = () => {
    const { darkMode } = useTheme();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState('az');

    // Stock action modal
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [stockData, setStockData] = useState({
        quantity: 1,
        movement_type: 'move_to_shop',
        remarks: ''
    });

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await client.get('/inventory/');
            setProducts(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch products');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const openStockModal = (product, defaultType = 'move_to_shop') => {
        setSelectedProduct(product);
        setStockData({ quantity: 1, movement_type: defaultType, remarks: '' });
        setIsStockModalOpen(true);
    };

    const handleStockSubmit = async (e) => {
        e.preventDefault();
        try {
            await client.post(`/inventory/${selectedProduct.id}/stock`, stockData);
            setIsStockModalOpen(false);
            fetchProducts();
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to update stock');
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type } = e.target;
        const parsedValue = type === 'number' ? (value === '' ? '' : Number(value)) : value;
        setStockData(prev => ({ ...prev, [name]: parsedValue }));
    };

    const cardClass = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200';
    const textPrimary = darkMode ? 'text-gray-100' : 'text-slate-900';
    const textSecondary = darkMode ? 'text-gray-400' : 'text-slate-500';
    const textMuted = darkMode ? 'text-gray-500' : 'text-slate-400';
    const inputClass = darkMode
        ? 'bg-gray-800 border-gray-700 text-gray-200 focus:ring-indigo-500 focus:border-indigo-500'
        : 'border-slate-300 text-slate-900 focus:ring-indigo-500 focus:border-indigo-500';

    const filteredProducts = products
        .filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku?.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => sortOrder === 'az'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        );

    const totalStoreRoomItems = products.reduce((sum, p) => sum + (p.store_room_stock || 0), 0);
    const productsInStoreRoom = products.filter(p => (p.store_room_stock || 0) > 0).length;

    return (
        <div className="relative pb-8">
            <div className={`md:flex md:items-center md:justify-between pb-6 border-b mb-8`}
                style={{ borderColor: darkMode ? '#1e293b' : '#e2e8f0' }}>
                <div className="flex-1 min-w-0">
                    <h2 className={`text-2xl font-bold leading-7 sm:text-3xl sm:truncate ${textPrimary}`}>
                        <Warehouse className="inline h-7 w-7 mr-2 text-indigo-500" />
                        Store Room
                    </h2>
                    <p className={`mt-1 text-sm ${textSecondary}`}>
                        Manage store room inventory. Move products to shop shelves when needed.
                    </p>
                </div>
            </div>

            {error && (
                <div className="mb-4 bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center text-red-500">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    {error}
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                <div className={`rounded-xl shadow-sm border p-5 ${cardClass}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Total Items in Store Room</p>
                    <p className={`text-3xl font-bold mt-2 ${textPrimary}`}>{totalStoreRoomItems}</p>
                </div>
                <div className={`rounded-xl shadow-sm border p-5 ${cardClass}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Products with Store Stock</p>
                    <p className={`text-3xl font-bold mt-2 ${textPrimary}`}>{productsInStoreRoom}</p>
                </div>
                <div className={`rounded-xl shadow-sm border p-5 ${cardClass}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Total Products</p>
                    <p className={`text-3xl font-bold mt-2 ${textPrimary}`}>{products.length}</p>
                </div>
            </div>

            {/* Search + Sort */}
            <div className="flex gap-3 mb-4 items-center">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none ${inputClass}`}
                    />
                </div>
                <button
                    type="button"
                    onClick={() => setSortOrder(s => s === 'az' ? 'za' : 'az')}
                    className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm font-medium transition ${
                        darkMode ? 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    {sortOrder === 'az' ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpZA className="h-4 w-4" />}
                </button>
            </div>

            {/* Store Room Table */}
            <div className={`shadow-sm rounded-xl border overflow-hidden ${cardClass}`}>
                <div className="overflow-x-auto">
                    <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-800' : 'divide-slate-200'}`}>
                        <thead className={darkMode ? 'bg-gray-800/50' : 'bg-slate-50'}>
                            <tr>
                                <th className={`px-5 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Product</th>
                                <th className={`px-5 py-3 text-center text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Store Room Qty</th>
                                <th className={`px-5 py-3 text-center text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Shop Shelf Qty</th>
                                <th className={`px-5 py-3 text-center text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Total Sold</th>
                                <th className={`px-5 py-3 text-center text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-gray-800' : 'divide-slate-200'}`}>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className={`px-6 py-8 text-center ${textSecondary}`}>
                                        <div className="animate-spin inline-block rounded-full h-5 w-5 border-b-2 border-indigo-500 mr-2"></div>
                                        Loading...
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className={`px-6 py-8 text-center ${textSecondary}`}>No products found.</td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className={`transition-colors ${
                                        darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-slate-50'
                                    }`}>
                                        <td className="px-5 py-3.5">
                                            <div className={`text-sm font-medium ${textPrimary}`}>{product.name}</div>
                                            <div className={`text-xs ${textMuted}`}>SKU: {product.sku}</div>
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <span className={`text-lg font-bold ${
                                                (product.store_room_stock || 0) === 0 ? textMuted : darkMode ? 'text-blue-400' : 'text-blue-600'
                                            }`}>
                                                {product.store_room_stock || 0}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <span className={`text-sm font-semibold ${
                                                product.stock === 0 ? 'text-red-500' : product.stock <= 10 ? 'text-amber-500' : darkMode ? 'text-emerald-400' : 'text-emerald-600'
                                            }`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className={`px-5 py-3.5 text-center text-sm font-medium ${textSecondary}`}>
                                            {product.total_sold || 0}
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => openStockModal(product, 'move_to_shop')}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20 transition"
                                                    title="Move to Shop"
                                                >
                                                    <ShoppingCart className="h-3 w-3" /> To Shop
                                                </button>
                                                <button
                                                    onClick={() => openStockModal(product, 'restock_store')}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 transition"
                                                    title="Restock Store Room from Supplier"
                                                >
                                                    <Truck className="h-3 w-3" /> Restock
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Stock Action Modal */}
            {isStockModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsStockModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className={`inline-block align-bottom rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full ${
                            darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white'
                        }`}>
                            <div className={`px-4 pt-5 pb-4 sm:p-6 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                                <h3 className={`text-lg font-bold mb-2 ${textPrimary}`}>
                                    Store Room Action: {selectedProduct.name}
                                </h3>
                                <div className={`flex gap-4 text-sm mb-4 p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-slate-50'}`}>
                                    <div>
                                        <span className={textMuted}>Store Room:</span>
                                        <span className={`ml-1 font-bold ${textPrimary}`}>{selectedProduct.store_room_stock || 0}</span>
                                    </div>
                                    <div>
                                        <span className={textMuted}>Shop:</span>
                                        <span className={`ml-1 font-bold ${textPrimary}`}>{selectedProduct.stock}</span>
                                    </div>
                                </div>
                                <form onSubmit={handleStockSubmit}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className={`block text-sm font-medium ${textSecondary}`}>Action</label>
                                            <select name="movement_type" value={stockData.movement_type} onChange={handleFormChange} className={`mt-1 block w-full pl-3 pr-10 py-2 border rounded-lg sm:text-sm ${inputClass}`}>
                                                <option value="move_to_shop">Move to Shop Shelf</option>
                                                <option value="restock_store">Restock Store Room (from Supplier)</option>
                                                <option value="restock_shop">Restock Shop (from Supplier)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium ${textSecondary}`}>Quantity</label>
                                            <input type="number" min="1" name="quantity" required value={stockData.quantity} onChange={handleFormChange} className={`mt-1 block w-full border rounded-lg shadow-sm py-2 px-3 sm:text-sm ${inputClass}`} />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium ${textSecondary}`}>Remarks</label>
                                            <input type="text" name="remarks" value={stockData.remarks} onChange={handleFormChange} className={`mt-1 block w-full border rounded-lg shadow-sm py-2 px-3 sm:text-sm ${inputClass}`} />
                                        </div>
                                    </div>
                                    <div className="mt-5 sm:flex sm:flex-row-reverse">
                                        <button type="submit" className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2.5 bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition sm:ml-3 sm:w-auto sm:text-sm">
                                            Confirm
                                        </button>
                                        <button type="button" onClick={() => setIsStockModalOpen(false)} className={`mt-3 w-full inline-flex justify-center rounded-lg border shadow-sm px-4 py-2.5 font-medium transition sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
                                            darkMode ? 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                                        }`}>
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoreRoom;
