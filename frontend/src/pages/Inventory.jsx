import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, PackagePlus, AlertCircle, Search, ArrowDownAZ, ArrowUpZA, ArrowRight, Warehouse, ShoppingCart } from 'lucide-react';
import client from '../api/client';
import { useTheme } from '../context/ThemeContext';

const Inventory = () => {
    const { darkMode } = useTheme();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modals state
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    
    // Form state
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        purchase_price: 0,
        selling_price: 0,
        stock: 0,
        store_room_stock: 0,
        gst_rate: 0,
        hsn_code: '',
        supplier: ''
    });
    const [stockData, setStockData] = useState({
        quantity: 1,
        movement_type: 'adjustment',
        remarks: ''
    });

    // Search & Sort
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState('az');

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

    const openAddModal = () => {
        setSelectedProduct(null);
        setFormData({
            sku: '', name: '', purchase_price: 0, selling_price: 0, 
            stock: 0, store_room_stock: 0, gst_rate: 0, hsn_code: '', supplier: ''
        });
        setIsProductModalOpen(true);
    };

    const openEditModal = (product) => {
        setSelectedProduct(product);
        setFormData({
            sku: product.sku,
            name: product.name,
            purchase_price: product.purchase_price,
            selling_price: product.selling_price,
            stock: product.stock,
            store_room_stock: product.store_room_stock || 0,
            gst_rate: product.gst_rate,
            hsn_code: product.hsn_code || '',
            supplier: product.supplier || ''
        });
        setIsProductModalOpen(true);
    };

    const openStockModal = (product, defaultType = 'adjustment') => {
        setSelectedProduct(product);
        setStockData({ quantity: 1, movement_type: defaultType, remarks: '' });
        setIsStockModalOpen(true);
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedProduct) {
                await client.put(`/inventory/${selectedProduct.id}`, formData);
            } else {
                await client.post('/inventory/', formData);
            }
            setIsProductModalOpen(false);
            fetchProducts();
        } catch (err) {
            alert('Failed to save product');
        }
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

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await client.delete(`/inventory/${id}`);
                fetchProducts();
            } catch (err) {
                alert('Failed to delete product');
            }
        }
    };

    const handleFormChange = (e, isStock = false) => {
        const { name, value, type } = e.target;
        const parsedValue = type === 'number' ? (value === '' ? '' : Number(value)) : value;
        
        if (isStock) {
            setStockData(prev => ({ ...prev, [name]: parsedValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: parsedValue }));
        }
    };

    const getStockStatus = (stock) => {
        if (stock === 0) return { label: 'OUT OF STOCK', color: 'bg-red-500/10 text-red-500 border-red-500/20' };
        if (stock <= 10) return { label: 'LOW STOCK', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
        return { label: 'OK', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
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
            p.sku?.toLowerCase().includes(search.toLowerCase()) ||
            p.hsn_code?.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => sortOrder === 'az'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        );

    return (
        <div className="relative pb-8">
            <div className={`md:flex md:items-center md:justify-between pb-6 border-b mb-8 transition-colors`}
                style={{ borderColor: darkMode ? '#1e293b' : '#e2e8f0' }}>
                <div className="flex-1 min-w-0">
                    <h2 className={`text-2xl font-bold leading-7 sm:text-3xl sm:truncate ${textPrimary}`}>
                        Inventory Management
                    </h2>
                    <p className={`mt-1 text-sm ${textSecondary}`}>
                        Manage products, stock levels, store room & shop shelf.
                    </p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                    <button
                        onClick={openAddModal}
                        type="button"
                        className="ml-3 inline-flex items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                    >
                        <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Add Product
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center text-red-500">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    {error}
                </div>
            )}

            {/* Search + Sort Bar */}
            <div className="flex gap-3 mb-4 items-center">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, SKU or HSN..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none ${inputClass}`}
                    />
                </div>
                <button
                    type="button"
                    onClick={() => setSortOrder(s => s === 'az' ? 'za' : 'az')}
                    title={sortOrder === 'az' ? 'Sorted A→Z (click for Z→A)' : 'Sorted Z→A (click for A→Z)'}
                    className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm font-medium transition ${
                        darkMode
                            ? 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'
                            : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    {sortOrder === 'az' ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpZA className="h-4 w-4" />}
                    {sortOrder === 'az' ? 'A→Z' : 'Z→A'}
                </button>
                {search && (
                    <span className={`text-xs ${textMuted}`}>
                        {filteredProducts.length} result(s)
                    </span>
                )}
            </div>

            {/* Products Table */}
            <div className={`shadow-sm rounded-xl border overflow-hidden transition-colors ${cardClass}`}>
                <div className="overflow-x-auto">
                    <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-800' : 'divide-slate-200'}`}>
                        <thead className={darkMode ? 'bg-gray-800/50' : 'bg-slate-50'}>
                            <tr>
                                <th scope="col" className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondary}`}>SKU</th>
                                <th scope="col" className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Product</th>
                                <th scope="col" className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Shop Stock</th>
                                <th scope="col" className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Store Room</th>
                                <th scope="col" className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Total Sold</th>
                                <th scope="col" className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Status</th>
                                <th scope="col" className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Price</th>
                                <th scope="col" className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-gray-800' : 'divide-slate-200'}`}>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className={`px-6 py-8 text-center ${textSecondary}`}>
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
                                            Loading products...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className={`px-6 py-8 text-center ${textSecondary}`}>No products found.</td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => {
                                    const status = getStockStatus(product.stock);
                                    return (
                                        <tr key={product.id} className={`transition-colors ${
                                            darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-slate-50'
                                        }`}>
                                            <td className={`px-4 py-3.5 whitespace-nowrap text-sm font-mono font-medium ${textPrimary}`}>{product.sku}</td>
                                            <td className="px-4 py-3.5 whitespace-nowrap text-sm">
                                                <div className={`font-medium ${textPrimary}`}>{product.name}</div>
                                                <div className={`text-xs ${textMuted}`}>HSN: {product.hsn_code || 'N/A'}</div>
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap text-sm text-center">
                                                <span className={`text-sm font-bold ${
                                                    product.stock === 0 ? 'text-red-500' : product.stock <= 10 ? 'text-amber-500' : darkMode ? 'text-emerald-400' : 'text-emerald-600'
                                                }`}>
                                                    {product.stock}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap text-sm text-center">
                                                <span className={`text-sm font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                                    {product.store_room_stock || 0}
                                                </span>
                                            </td>
                                            <td className={`px-4 py-3.5 whitespace-nowrap text-sm text-center font-medium ${textSecondary}`}>
                                                {product.total_sold || 0}
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className={`px-4 py-3.5 whitespace-nowrap text-sm text-right font-medium ${textPrimary}`}>₹{product.selling_price.toFixed(2)}</td>
                                            <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button onClick={() => openStockModal(product, 'move_to_shop')} 
                                                        className="p-1.5 rounded-md text-blue-500 hover:bg-blue-500/10 transition" title="Move to Shop">
                                                        <ShoppingCart className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button onClick={() => openStockModal(product, 'move_to_store')} 
                                                        className="p-1.5 rounded-md text-purple-500 hover:bg-purple-500/10 transition" title="Move to Store Room">
                                                        <Warehouse className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button onClick={() => openStockModal(product, 'sale')} 
                                                        className="p-1.5 rounded-md text-emerald-500 hover:bg-emerald-500/10 transition" title="Sell Product">
                                                        <ArrowRight className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button onClick={() => openStockModal(product)} 
                                                        className="p-1.5 rounded-md text-teal-500 hover:bg-teal-500/10 transition" title="Adjust Stock">
                                                        <PackagePlus className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button onClick={() => openEditModal(product)} 
                                                        className="p-1.5 rounded-md text-indigo-500 hover:bg-indigo-500/10 transition" title="Edit Product">
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button onClick={() => handleDelete(product.id)} 
                                                        className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10 transition" title="Delete Product">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Product Add/Edit Modal */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsProductModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className={`inline-block align-bottom rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full ${
                            darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white'
                        }`}>
                            <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                                <h3 className={`text-lg leading-6 font-bold mb-4 ${textPrimary}`} id="modal-title">
                                    {selectedProduct ? 'Edit Product' : 'Add New Product'}
                                </h3>
                                <form onSubmit={handleProductSubmit}>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className={`block text-sm font-medium ${textSecondary}`}>SKU</label>
                                            <input type="text" name="sku" required value={formData.sku} onChange={handleFormChange} className={`mt-1 block w-full border rounded-lg shadow-sm py-2 px-3 sm:text-sm ${inputClass}`} />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className={`block text-sm font-medium ${textSecondary}`}>Name</label>
                                            <input type="text" name="name" required value={formData.name} onChange={handleFormChange} className={`mt-1 block w-full border rounded-lg shadow-sm py-2 px-3 sm:text-sm ${inputClass}`} />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className={`block text-sm font-medium ${textSecondary}`}>Purchase Price</label>
                                            <input type="number" step="0.01" name="purchase_price" required value={formData.purchase_price} onChange={handleFormChange} className={`mt-1 block w-full border rounded-lg shadow-sm py-2 px-3 sm:text-sm ${inputClass}`} />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className={`block text-sm font-medium ${textSecondary}`}>Selling Price</label>
                                            <input type="number" step="0.01" name="selling_price" required value={formData.selling_price} onChange={handleFormChange} className={`mt-1 block w-full border rounded-lg shadow-sm py-2 px-3 sm:text-sm ${inputClass}`} />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className={`block text-sm font-medium ${textSecondary}`}>Shop Shelf Stock</label>
                                            <input type="number" name="stock" required disabled={!!selectedProduct} title={selectedProduct ? "Use Stock Actions instead" : ""} value={formData.stock} onChange={handleFormChange} className={`mt-1 block w-full border rounded-lg shadow-sm py-2 px-3 sm:text-sm disabled:opacity-50 ${inputClass}`} />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className={`block text-sm font-medium ${textSecondary}`}>Store Room Stock</label>
                                            <input type="number" name="store_room_stock" disabled={!!selectedProduct} title={selectedProduct ? "Use Stock Actions instead" : ""} value={formData.store_room_stock} onChange={handleFormChange} className={`mt-1 block w-full border rounded-lg shadow-sm py-2 px-3 sm:text-sm disabled:opacity-50 ${inputClass}`} />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className={`block text-sm font-medium ${textSecondary}`}>GST Rate (%)</label>
                                            <input type="number" step="0.1" name="gst_rate" required value={formData.gst_rate} onChange={handleFormChange} className={`mt-1 block w-full border rounded-lg shadow-sm py-2 px-3 sm:text-sm ${inputClass}`} />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className={`block text-sm font-medium ${textSecondary}`}>HSN Code</label>
                                            <input type="text" name="hsn_code" value={formData.hsn_code} onChange={handleFormChange} className={`mt-1 block w-full border rounded-lg shadow-sm py-2 px-3 sm:text-sm ${inputClass}`} />
                                        </div>
                                        <div className="col-span-2">
                                            <label className={`block text-sm font-medium ${textSecondary}`}>Supplier</label>
                                            <input type="text" name="supplier" value={formData.supplier} onChange={handleFormChange} className={`mt-1 block w-full border rounded-lg shadow-sm py-2 px-3 sm:text-sm ${inputClass}`} />
                                        </div>
                                    </div>
                                    <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                                        <button type="submit" className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2.5 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 transition sm:ml-3 sm:w-auto sm:text-sm">
                                            {selectedProduct ? 'Save Changes' : 'Add Product'}
                                        </button>
                                        <button type="button" onClick={() => setIsProductModalOpen(false)} className={`mt-3 w-full inline-flex justify-center rounded-lg border shadow-sm px-4 py-2.5 text-base font-medium transition sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
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

            {/* Stock Adjustment Modal */}
            {isStockModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsStockModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className={`inline-block align-bottom rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full ${
                            darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white'
                        }`}>
                            <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                                <h3 className={`text-lg leading-6 font-bold mb-2 ${textPrimary}`}>
                                    Stock Action: {selectedProduct.name}
                                </h3>
                                <div className={`flex gap-4 text-sm mb-4 p-3 rounded-lg ${
                                    darkMode ? 'bg-gray-800' : 'bg-slate-50'
                                }`}>
                                    <div>
                                        <span className={textMuted}>Shop:</span>
                                        <span className={`ml-1 font-bold ${textPrimary}`}>{selectedProduct.stock}</span>
                                    </div>
                                    <div>
                                        <span className={textMuted}>Store Room:</span>
                                        <span className={`ml-1 font-bold ${textPrimary}`}>{selectedProduct.store_room_stock || 0}</span>
                                    </div>
                                    <div>
                                        <span className={textMuted}>Sold:</span>
                                        <span className={`ml-1 font-bold ${textPrimary}`}>{selectedProduct.total_sold || 0}</span>
                                    </div>
                                </div>
                                
                                <form onSubmit={handleStockSubmit}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className={`block text-sm font-medium ${textSecondary}`}>Action Type</label>
                                            <select name="movement_type" value={stockData.movement_type} onChange={(e) => handleFormChange(e, true)} className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border rounded-lg sm:text-sm ${inputClass}`}>
                                                <optgroup label="📦 Inventory Flow">
                                                    <option value="move_to_shop">Store Room → Shop Shelf</option>
                                                    <option value="move_to_store">Shop Shelf → Store Room</option>
                                                    <option value="sale">Sell Product (from Shop)</option>
                                                </optgroup>
                                                <optgroup label="🚚 Restock from Supplier">
                                                    <option value="restock_store">Supplier → Store Room</option>
                                                    <option value="restock_shop">Supplier → Shop Shelf</option>
                                                </optgroup>
                                                <optgroup label="⚙️ Manual">
                                                    <option value="purchase">Purchase (Add to Shop)</option>
                                                    <option value="adjustment">Manual Adjustment</option>
                                                </optgroup>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium ${textSecondary}`}>Quantity</label>
                                            <input type="number" min="1" name="quantity" required value={stockData.quantity} onChange={(e) => handleFormChange(e, true)} className={`mt-1 block w-full border rounded-lg shadow-sm py-2 px-3 sm:text-sm ${inputClass}`} />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium ${textSecondary}`}>Remarks (Optional)</label>
                                            <input type="text" name="remarks" value={stockData.remarks} onChange={(e) => handleFormChange(e, true)} className={`mt-1 block w-full border rounded-lg shadow-sm py-2 px-3 sm:text-sm ${inputClass}`} />
                                        </div>
                                    </div>
                                    <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                                        <button type="submit" className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2.5 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 transition sm:ml-3 sm:w-auto sm:text-sm">
                                            Confirm
                                        </button>
                                        <button type="button" onClick={() => setIsStockModalOpen(false)} className={`mt-3 w-full inline-flex justify-center rounded-lg border shadow-sm px-4 py-2.5 text-base font-medium transition sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
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

export default Inventory;
