import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, PackagePlus, AlertCircle } from 'lucide-react';
import client from '../api/client';

const Inventory = () => {
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
        gst_rate: 0,
        hsn_code: '',
        supplier: ''
    });
    const [stockData, setStockData] = useState({
        quantity: 1,
        movement_type: 'adjustment',
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

    const openAddModal = () => {
        setSelectedProduct(null);
        setFormData({
            sku: '', name: '', purchase_price: 0, selling_price: 0, 
            stock: 0, gst_rate: 0, hsn_code: '', supplier: ''
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
            gst_rate: product.gst_rate,
            hsn_code: product.hsn_code || '',
            supplier: product.supplier || ''
        });
        setIsProductModalOpen(true);
    };

    const openStockModal = (product) => {
        setSelectedProduct(product);
        setStockData({ quantity: 1, movement_type: 'adjustment', remarks: '' });
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

    return (
        <div className="relative">
            <div className="md:flex md:items-center md:justify-between pb-6 border-b border-slate-200 mb-8">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl sm:truncate">
                        Inventory Management
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage your products, stock levels, and pricing.
                    </p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                    <button
                        onClick={openAddModal}
                        type="button"
                        className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                    >
                        <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Add Product
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 p-4 rounded-md flex items-center text-red-700">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    {error}
                </div>
            )}

            {/* Products Table */}
            <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">SKU</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Stock</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Price (Sell)</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">GST %</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">Loading products...</td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No products found. Click "Add Product" to get started.</td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{product.sku}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            <div className="font-medium text-slate-900">{product.name}</div>
                                            <div className="text-xs text-slate-400">HSN: {product.hsn_code || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock <= 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">₹{product.selling_price.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">{product.gst_rate}%</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openStockModal(product)} className="text-emerald-600 hover:text-emerald-900 mx-2" title="Adjust Stock">
                                                <PackagePlus className="h-4 w-4 inline" />
                                            </button>
                                            <button onClick={() => openEditModal(product)} className="text-indigo-600 hover:text-indigo-900 mx-2" title="Edit Product">
                                                <Edit2 className="h-4 w-4 inline" />
                                            </button>
                                            <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900 mx-2" title="Delete Product">
                                                <Trash2 className="h-4 w-4 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Product Add/Edit Modal */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" onClick={() => setIsProductModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-slate-900 mb-4" id="modal-title">
                                    {selectedProduct ? 'Edit Product' : 'Add New Product'}
                                </h3>
                                <form onSubmit={handleProductSubmit}>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-medium text-slate-700">SKU</label>
                                            <input type="text" name="sku" required value={formData.sku} onChange={handleFormChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-medium text-slate-700">Name</label>
                                            <input type="text" name="name" required value={formData.name} onChange={handleFormChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-medium text-slate-700">Purchase Price</label>
                                            <input type="number" step="0.01" name="purchase_price" required value={formData.purchase_price} onChange={handleFormChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-medium text-slate-700">Selling Price</label>
                                            <input type="number" step="0.01" name="selling_price" required value={formData.selling_price} onChange={handleFormChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-medium text-slate-700">Initial Stock</label>
                                            <input type="number" name="stock" required disabled={!!selectedProduct} title={selectedProduct ? "Use Stock Adjustment instead" : ""} value={formData.stock} onChange={handleFormChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-100" />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-medium text-slate-700">GST Rate (%)</label>
                                            <input type="number" step="0.1" name="gst_rate" required value={formData.gst_rate} onChange={handleFormChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-medium text-slate-700">HSN Code</label>
                                            <input type="text" name="hsn_code" value={formData.hsn_code} onChange={handleFormChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-medium text-slate-700">Supplier</label>
                                            <input type="text" name="supplier" value={formData.supplier} onChange={handleFormChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                        </div>
                                    </div>
                                    <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                                        <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">
                                            {selectedProduct ? 'Save Changes' : 'Add Product'}
                                        </button>
                                        <button type="button" onClick={() => setIsProductModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
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
                        <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" onClick={() => setIsStockModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-slate-900 mb-2">
                                    Adjust Stock: {selectedProduct.name}
                                </h3>
                                <p className="text-sm text-slate-500 mb-4">Current Stock: <span className="font-bold text-slate-900">{selectedProduct.stock}</span></p>
                                
                                <form onSubmit={handleStockSubmit}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Movement Type</label>
                                            <select name="movement_type" value={stockData.movement_type} onChange={(e) => handleFormChange(e, true)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                                <option value="purchase">Purchase (Add Stock)</option>
                                                <option value="sale">Sale (Deduct Stock)</option>
                                                <option value="adjustment">Manual Adjustment</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Quantity</label>
                                            <input type="number" min="1" name="quantity" required value={stockData.quantity} onChange={(e) => handleFormChange(e, true)} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Remarks (Optional)</label>
                                            <input type="text" name="remarks" value={stockData.remarks} onChange={(e) => handleFormChange(e, true)} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                        </div>
                                    </div>
                                    <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                                        <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm">
                                            Confirm
                                        </button>
                                        <button type="button" onClick={() => setIsStockModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
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
