import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, AlertCircle, FileText, Eye, Search, ArrowDownAZ, ArrowUpZA, ChevronDown } from 'lucide-react';
import client from '../api/client';
import { useTheme } from '../context/ThemeContext';

const Invoices = () => {
    const { darkMode } = useTheme();
    const [invoices, setInvoices] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [viewInvoice, setViewInvoice] = useState(null);

    const [formData, setFormData] = useState({ customer_name: '', customer_gstin: '' });
    const [items, setItems] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [productSearch, setProductSearch] = useState('');
    const [sortOrder, setSortOrder] = useState('az');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const cardClass = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200';
    const textPrimary = darkMode ? 'text-gray-100' : 'text-slate-900';
    const textSecondary = darkMode ? 'text-gray-400' : 'text-slate-500';
    const textMuted = darkMode ? 'text-gray-500' : 'text-slate-400';
    const inputClass = darkMode
        ? 'bg-gray-800 border-gray-700 text-gray-200 focus:ring-indigo-500 focus:border-indigo-500'
        : 'border-slate-300 text-slate-900 focus:ring-indigo-500 focus:border-indigo-500';
    
    const fetchData = async () => {
        try {
            setLoading(true);
            const [invoicesRes, productsRes] = await Promise.all([
                client.get('/invoices/'),
                client.get('/inventory/')
            ]);
            setInvoices(invoicesRes.data);
            setProducts(productsRes.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredProducts = products
        .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku?.toLowerCase().includes(productSearch.toLowerCase()))
        .sort((a, b) => sortOrder === 'az' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));

    const selectedProduct = products.find(p => p.id === parseInt(selectedProductId));

    const handleAddItem = () => {
        if (!selectedProductId) return;
        const product = products.find(p => p.id === parseInt(selectedProductId));
        if (!product) return;
        if (product.stock < selectedQuantity) {
            alert(`Insufficient stock. Only ${product.stock} available.`);
            return;
        }
        const existingItemIndex = items.findIndex(i => i.product_id === product.id);
        if (existingItemIndex >= 0) {
            const newItems = [...items];
            newItems[existingItemIndex].quantity += parseInt(selectedQuantity);
            setItems(newItems);
        } else {
            setItems([...items, {
                product_id: product.id,
                name: product.name,
                quantity: parseInt(selectedQuantity),
                unit_price: product.selling_price,
            }]);
        }
        setSelectedProductId('');
        setSelectedQuantity(1);
    };

    const handleRemoveItem = (index) => setItems(items.filter((_, i) => i !== index));
    const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (items.length === 0) { alert('Please add at least one item.'); return; }
        const payload = {
            customer_name: formData.customer_name,
            customer_gstin: formData.customer_gstin || null,
            items: items.map(i => ({
                product_id: i.product_id,
                quantity: i.quantity,
                unit_price: i.unit_price,
                total: i.quantity * i.unit_price
            }))
        };
        try {
            await client.post('/invoices/', payload);
            setIsCreateModalOpen(false);
            setFormData({ customer_name: '', customer_gstin: '' });
            setItems([]);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to create invoice');
        }
    };

    const calculateCartTotal = () => items.reduce((total, item) => total + (item.quantity * item.unit_price), 0);

    return (
        <div className="relative pb-8">
            <div className={`md:flex md:items-center md:justify-between pb-6 border-b mb-8`}
                style={{ borderColor: darkMode ? '#1e293b' : '#e2e8f0' }}>
                <div className="flex-1 min-w-0">
                    <h2 className={`text-2xl font-bold leading-7 sm:text-3xl sm:truncate ${textPrimary}`}>Invoices</h2>
                    <p className={`mt-1 text-sm ${textSecondary}`}>Create invoices, calculate GST automatically, and track payments.</p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                    <button onClick={() => setIsCreateModalOpen(true)} className="ml-3 inline-flex items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all">
                        <Plus className="-ml-1 mr-2 h-5 w-5" /> Create Invoice
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center text-red-500">
                    <AlertCircle className="h-5 w-5 mr-2" /> {error}
                </div>
            )}

            {/* Invoices List */}
            <div className={`shadow-sm rounded-xl border overflow-hidden ${cardClass}`}>
                <div className="overflow-x-auto">
                    <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-800' : 'divide-slate-200'}`}>
                        <thead className={darkMode ? 'bg-gray-800/50' : 'bg-slate-50'}>
                            <tr>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Invoice #</th>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Date</th>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Customer</th>
                                <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Total Amount</th>
                                <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Status</th>
                                <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-gray-800' : 'divide-slate-200'}`}>
                            {loading ? (
                                <tr><td colSpan="6" className={`px-6 py-8 text-center ${textSecondary}`}>Loading invoices...</td></tr>
                            ) : invoices.length === 0 ? (
                                <tr><td colSpan="6" className={`px-6 py-8 text-center ${textSecondary}`}>No invoices found.</td></tr>
                            ) : (
                                invoices.map((invoice) => (
                                    <tr key={invoice.id} className={`transition-colors ${darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-slate-50'}`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-500">{invoice.invoice_number}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${textSecondary}`}>
                                            {new Date(invoice.invoice_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={textPrimary}>{invoice.customer_name}</span>
                                            {invoice.customer_gstin && <div className={`text-xs ${textMuted}`}>GSTIN: {invoice.customer_gstin}</div>}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${textPrimary}`}>₹{invoice.total_amount.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                invoice.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                            }`}>
                                                {invoice.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <button onClick={() => setViewInvoice(invoice)} className="text-indigo-500 hover:text-indigo-400 transition" title="View Details">
                                                <Eye className="h-5 w-5 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Invoice Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className={`inline-block align-bottom rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full ${
                            darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white'
                        }`}>
                            <div className={`px-4 py-4 border-b ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-slate-50 border-slate-200'}`}>
                                <h3 className={`text-lg font-bold flex items-center ${textPrimary}`}>
                                    <FileText className="mr-2 h-5 w-5 text-indigo-500" /> Create New Invoice
                                </h3>
                            </div>
                            <div className={`px-4 pt-5 pb-4 sm:p-6 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div>
                                        <label className={`block text-sm font-medium ${textSecondary}`}>Customer Name</label>
                                        <input type="text" name="customer_name" required value={formData.customer_name} onChange={handleFormChange} className={`mt-1 block w-full border rounded-lg shadow-sm py-2 px-3 sm:text-sm ${inputClass}`} />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium ${textSecondary}`}>Customer GSTIN (Optional)</label>
                                        <input type="text" name="customer_gstin" value={formData.customer_gstin} onChange={handleFormChange} placeholder="e.g. 27AAAAA0000A1Z5" className={`mt-1 block w-full border rounded-lg shadow-sm py-2 px-3 sm:text-sm uppercase ${inputClass}`} />
                                    </div>
                                </div>

                                <div className={`border rounded-xl p-4 mb-6 ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-slate-50 border-slate-200'}`}>
                                    <h4 className={`text-md font-semibold mb-3 ${textPrimary}`}>Line Items</h4>
                                    
                                    <div className="flex flex-col md:flex-row gap-3 mb-4 items-end">
                                        <div className="flex-1" ref={dropdownRef}>
                                            <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>Product</label>
                                            <div className="flex gap-2 mb-2">
                                                <div className="relative flex-1">
                                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                                    <input type="text" placeholder="Search..." value={productSearch}
                                                        onChange={(e) => { setProductSearch(e.target.value); setDropdownOpen(true); }}
                                                        onFocus={() => setDropdownOpen(true)}
                                                        className={`w-full pl-8 pr-3 py-2 border rounded-lg text-sm focus:outline-none ${inputClass}`}
                                                    />
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <button type="button" onClick={() => setDropdownOpen(o => !o)}
                                                    className={`w-full flex items-center justify-between border rounded-lg py-2 px-3 text-sm text-left focus:outline-none ${inputClass}`}>
                                                    <span className={selectedProduct ? textPrimary : textMuted}>
                                                        {selectedProduct ? `${selectedProduct.name} (Stock: ${selectedProduct.stock} | ₹${selectedProduct.selling_price})` : 'Select a product...'}
                                                    </span>
                                                    <ChevronDown className="h-4 w-4" />
                                                </button>
                                                {dropdownOpen && (
                                                    <div className={`absolute z-50 mt-1 w-full border rounded-lg shadow-lg max-h-56 overflow-y-auto ${
                                                        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
                                                    }`}>
                                                        {filteredProducts.length === 0 ? (
                                                            <div className={`px-4 py-3 text-sm ${textMuted}`}>No products found.</div>
                                                        ) : filteredProducts.map(p => (
                                                            <div key={p.id}
                                                                onClick={() => { setSelectedProductId(String(p.id)); setDropdownOpen(false); setProductSearch(''); }}
                                                                className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition ${
                                                                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-indigo-50 hover:text-indigo-700'
                                                                } ${String(selectedProductId) === String(p.id) ? (darkMode ? 'bg-gray-700 text-indigo-400' : 'bg-indigo-50 text-indigo-700 font-medium') : ''}`}
                                                            >
                                                                <span>{p.name}</span>
                                                                <span className={`text-xs ${textMuted}`}>Stock: {p.stock} | ₹{p.selling_price}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-24">
                                            <label className={`block text-sm font-medium ${textSecondary}`}>Qty</label>
                                            <input type="number" min="1" value={selectedQuantity} onChange={(e) => setSelectedQuantity(e.target.value)}
                                                className={`mt-1 block w-full border rounded-lg shadow-sm py-2 px-3 sm:text-sm ${inputClass}`} />
                                        </div>
                                        <button type="button" onClick={handleAddItem}
                                            className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 text-sm font-medium transition dark:bg-indigo-600 dark:hover:bg-indigo-700">
                                            Add Item
                                        </button>
                                    </div>

                                    {items.length > 0 && (
                                        <div className={`mt-4 border rounded-lg overflow-hidden ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-slate-200 bg-white'}`}>
                                            <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-800' : 'divide-slate-200'}`}>
                                                <thead className={darkMode ? 'bg-gray-800' : 'bg-slate-100'}>
                                                    <tr>
                                                        <th className={`px-4 py-2 text-left text-xs font-semibold ${textSecondary}`}>Item</th>
                                                        <th className={`px-4 py-2 text-right text-xs font-semibold ${textSecondary}`}>Rate</th>
                                                        <th className={`px-4 py-2 text-right text-xs font-semibold ${textSecondary}`}>Qty</th>
                                                        <th className={`px-4 py-2 text-right text-xs font-semibold ${textSecondary}`}>Amount</th>
                                                        <th className="px-4 py-2 text-center text-xs font-semibold"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className={`divide-y ${darkMode ? 'divide-gray-800' : 'divide-slate-200'}`}>
                                                    {items.map((it, idx) => (
                                                        <tr key={idx}>
                                                            <td className={`px-4 py-3 text-sm ${textPrimary}`}>{it.name}</td>
                                                            <td className={`px-4 py-3 text-sm text-right ${textPrimary}`}>₹{it.unit_price.toFixed(2)}</td>
                                                            <td className={`px-4 py-3 text-sm text-right ${textPrimary}`}>{it.quantity}</td>
                                                            <td className={`px-4 py-3 text-sm text-right font-medium ${textPrimary}`}>₹{(it.quantity * it.unit_price).toFixed(2)}</td>
                                                            <td className="px-4 py-3 text-sm text-center">
                                                                <button onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-400">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    <tr className={darkMode ? 'bg-gray-800' : 'bg-slate-50'}>
                                                        <td colSpan="3" className={`px-4 py-3 text-sm font-bold text-right ${textPrimary}`}>Base Total:</td>
                                                        <td className="px-4 py-3 text-sm font-bold text-indigo-500 text-right">₹{calculateCartTotal().toFixed(2)}</td>
                                                        <td></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={`px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-xl border-t ${
                                darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-slate-50 border-slate-200'
                            }`}>
                                <button type="button" onClick={handleSubmit} className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-6 py-2.5 bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition sm:ml-3 sm:w-auto sm:text-sm">
                                    Generate & Save Invoice
                                </button>
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className={`mt-3 w-full inline-flex justify-center rounded-lg border shadow-sm px-4 py-2.5 font-medium transition sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
                                    darkMode ? 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                                }`}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Invoice Modal */}
            {viewInvoice && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewInvoice(null)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className={`inline-block align-bottom rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full p-8 border-t-4 border-t-indigo-600 ${
                            darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white'
                        }`}>
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className={`text-3xl font-bold ${textPrimary}`}>INVOICE</h2>
                                    <p className={`font-medium ${textSecondary}`}>{viewInvoice.invoice_number}</p>
                                </div>
                                <div className="text-right">
                                    <h4 className={`font-bold mb-1 ${textPrimary}`}>Billed To:</h4>
                                    <p className={textSecondary}>{viewInvoice.customer_name}</p>
                                    {viewInvoice.customer_gstin && <p className={textSecondary}>GSTIN: {viewInvoice.customer_gstin}</p>}
                                    <p className={`text-sm mt-2 ${textMuted}`}>Date: {new Date(viewInvoice.invoice_date).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className={`border rounded-xl overflow-hidden mb-8 ${darkMode ? 'border-gray-700' : 'border-slate-200'}`}>
                                <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-700' : 'divide-slate-200'}`}>
                                    <thead className={darkMode ? 'bg-gray-800' : 'bg-slate-50'}>
                                        <tr>
                                            <th className={`px-4 py-3 text-left text-xs font-semibold ${textSecondary}`}>Item</th>
                                            <th className={`px-4 py-3 text-right text-xs font-semibold ${textSecondary}`}>Qty</th>
                                            <th className={`px-4 py-3 text-right text-xs font-semibold ${textSecondary}`}>Rate</th>
                                            <th className={`px-4 py-3 text-right text-xs font-semibold ${textSecondary}`}>CGST</th>
                                            <th className={`px-4 py-3 text-right text-xs font-semibold ${textSecondary}`}>SGST</th>
                                            <th className={`px-4 py-3 text-right text-xs font-semibold ${textSecondary}`}>IGST</th>
                                            <th className={`px-4 py-3 text-right text-xs font-semibold ${textSecondary}`}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-slate-200'}`}>
                                        {viewInvoice.items && viewInvoice.items.map((item, idx) => {
                                            const product = products.find(p => p.id === item.product_id);
                                            return (
                                                <tr key={idx}>
                                                    <td className={`px-4 py-3 text-sm font-medium ${textPrimary}`}>{product ? product.name : `Item #${item.product_id}`}</td>
                                                    <td className={`px-4 py-3 text-sm text-right ${textSecondary}`}>{item.quantity}</td>
                                                    <td className={`px-4 py-3 text-sm text-right ${textSecondary}`}>₹{item.unit_price.toFixed(2)}</td>
                                                    <td className={`px-4 py-3 text-sm text-right ${textSecondary}`}>₹{item.cgst.toFixed(2)}</td>
                                                    <td className={`px-4 py-3 text-sm text-right ${textSecondary}`}>₹{item.sgst.toFixed(2)}</td>
                                                    <td className={`px-4 py-3 text-sm text-right ${textSecondary}`}>₹{item.igst.toFixed(2)}</td>
                                                    <td className={`px-4 py-3 text-sm font-bold text-right ${textPrimary}`}>₹{item.total.toFixed(2)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end">
                                <div className={`w-64 p-4 rounded-xl flex justify-between items-center border ${
                                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-slate-50 border-slate-200'
                                }`}>
                                    <span className={`font-bold ${textSecondary}`}>Grand Total:</span>
                                    <span className="text-2xl font-bold text-indigo-500">₹{viewInvoice.total_amount.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button onClick={() => setViewInvoice(null)} className="px-6 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition dark:bg-indigo-600 dark:hover:bg-indigo-700">
                                    Close Receipt
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Invoices;
