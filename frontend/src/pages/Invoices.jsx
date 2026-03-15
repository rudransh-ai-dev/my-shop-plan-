import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, FileText, Eye } from 'lucide-react';
import client from '../api/client';

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [viewInvoice, setViewInvoice] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_gstin: '',
    });
    const [items, setItems] = useState([]);
    
    const [selectedProductId, setSelectedProductId] = useState('');
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    
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

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddItem = () => {
        if (!selectedProductId) return;
        const product = products.find(p => p.id === parseInt(selectedProductId));
        if (!product) return;

        if (product.stock < selectedQuantity) {
            alert(`Insufficient stock. Only ${product.stock} available.`);
            return;
        }

        // Add to items list if not already there, else update quantity
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

    const handleRemoveItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (items.length === 0) {
            alert('Please add at least one item to the invoice.');
            return;
        }

        const payload = {
            customer_name: formData.customer_name,
            customer_gstin: formData.customer_gstin || null,
            items: items.map(i => ({
                product_id: i.product_id,
                quantity: i.quantity,
                unit_price: i.unit_price,
                total: i.quantity * i.unit_price // Server calculates GST, this is just base amount hint
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

    const calculateCartTotal = () => {
        return items.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
    };

    return (
        <div className="relative">
            <div className="md:flex md:items-center md:justify-between pb-6 border-b border-slate-200 mb-8">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl sm:truncate">
                        Invoices
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Create invoices, calculate GST automatically, and track payments.
                    </p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        type="button"
                        className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition"
                    >
                        <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Create Invoice
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 p-4 rounded-md flex items-center text-red-700">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    {error}
                </div>
            )}

            {/* Invoices List */}
            <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Invoice #</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Total Amount</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">Loading invoices...</td>
                                </tr>
                            ) : invoices.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No invoices found. Generate one to get started.</td>
                                </tr>
                            ) : (
                                invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{invoice.invoice_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {new Date(invoice.invoice_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {invoice.customer_name}
                                            {invoice.customer_gstin && <div className="text-xs text-slate-500">GSTIN: {invoice.customer_gstin}</div>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 text-right">
                                            ₹{invoice.total_amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {invoice.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => setViewInvoice(invoice)} className="text-indigo-600 hover:text-indigo-900" title="View Details">
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
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" onClick={() => setIsCreateModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                            <div className="bg-slate-50 px-4 py-4 border-b border-slate-200">
                                <h3 className="text-lg leading-6 font-bold text-slate-900 flex items-center">
                                    <FileText className="mr-2 h-5 w-5 text-indigo-600" />
                                    Create New Invoice
                                </h3>
                            </div>
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Customer Name</label>
                                        <input type="text" name="customer_name" required value={formData.customer_name} onChange={handleFormChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Customer GSTIN (Optional)</label>
                                        <input type="text" name="customer_gstin" value={formData.customer_gstin} onChange={handleFormChange} placeholder="e.g. 27AAAAA0000A1Z5" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm uppercase" />
                                        <p className="text-xs text-slate-500 mt-1">If same state as yours, applies CGST/SGST. If different, applies IGST.</p>
                                    </div>
                                </div>

                                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 mb-6">
                                    <h4 className="text-md font-semibold text-slate-800 mb-3">Line Items</h4>
                                    
                                    {/* Add Item Row */}
                                    <div className="flex flex-col md:flex-row gap-3 mb-4 items-end">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-slate-700">Product</label>
                                            <select 
                                                value={selectedProductId}
                                                onChange={(e) => setSelectedProductId(e.target.value)}
                                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            >
                                                <option value="">Select a product...</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock} | ₹{p.selling_price})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-24">
                                            <label className="block text-sm font-medium text-slate-700">Qty</label>
                                            <input type="number" min="1" value={selectedQuantity} onChange={(e) => setSelectedQuantity(e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={handleAddItem}
                                            className="bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-700 text-sm font-medium transition"
                                        >
                                            Add Item
                                        </button>
                                    </div>

                                    {/* Items Table */}
                                    {items.length > 0 && (
                                        <div className="mt-4 border border-slate-200 rounded-md overflow-hidden bg-white">
                                            <table className="min-w-full divide-y divide-slate-200">
                                                <thead className="bg-slate-100">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Item Name</th>
                                                        <th className="px-4 py-2 text-right text-xs font-semibold text-slate-600">Rate</th>
                                                        <th className="px-4 py-2 text-right text-xs font-semibold text-slate-600">Qty</th>
                                                        <th className="px-4 py-2 text-right text-xs font-semibold text-slate-600">Amount (Excl. GST)</th>
                                                        <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200">
                                                    {items.map((it, idx) => (
                                                        <tr key={idx}>
                                                            <td className="px-4 py-3 text-sm text-slate-900">{it.name}</td>
                                                            <td className="px-4 py-3 text-sm text-slate-900 text-right">₹{it.unit_price.toFixed(2)}</td>
                                                            <td className="px-4 py-3 text-sm text-slate-900 text-right">{it.quantity}</td>
                                                            <td className="px-4 py-3 text-sm text-slate-900 text-right font-medium">₹{(it.quantity * it.unit_price).toFixed(2)}</td>
                                                            <td className="px-4 py-3 text-sm text-center">
                                                                <button onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-700">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    <tr className="bg-slate-50">
                                                        <td colSpan="3" className="px-4 py-3 text-sm font-bold text-slate-900 text-right">Base Total (pre-GST):</td>
                                                        <td className="px-4 py-3 text-sm font-bold text-indigo-700 text-right">₹{calculateCartTotal().toFixed(2)}</td>
                                                        <td></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="bg-slate-50 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg border-t border-slate-200">
                                <button type="button" onClick={handleSubmit} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-6 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">
                                    Generate & Save Invoice
                                </button>
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Invoice Modal */}
            {viewInvoice && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" onClick={() => setViewInvoice(null)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full p-8 border-t-8 border-t-indigo-600">
                            
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-800">INVOICE</h2>
                                    <p className="text-slate-500 font-medium">{viewInvoice.invoice_number}</p>
                                </div>
                                <div className="text-right">
                                    <h4 className="font-bold text-slate-800 mb-1">Billed To:</h4>
                                    <p className="text-slate-600">{viewInvoice.customer_name}</p>
                                    {viewInvoice.customer_gstin && <p className="text-slate-600">GSTIN: {viewInvoice.customer_gstin}</p>}
                                    <p className="text-slate-500 text-sm mt-2">Date: {new Date(viewInvoice.invoice_date).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-lg overflow-hidden mb-8">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Item</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Qty</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Rate</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">CGST</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">SGST</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">IGST</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {viewInvoice.items && viewInvoice.items.map((item, idx) => {
                                            const product = products.find(p => p.id === item.product_id);
                                            return (
                                                <tr key={idx}>
                                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{product ? product.name : `Item #${item.product_id}`}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600 text-right">{item.quantity}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600 text-right">₹{item.unit_price.toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600 text-right">₹{item.cgst.toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600 text-right">₹{item.sgst.toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600 text-right">₹{item.igst.toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-sm font-bold text-slate-900 text-right">₹{item.total.toFixed(2)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end">
                                <div className="w-64 bg-slate-50 p-4 rounded-lg flex justify-between items-center border border-slate-200">
                                    <span className="font-bold text-slate-700">Grand Total:</span>
                                    <span className="text-2xl font-bold text-indigo-700">₹{viewInvoice.total_amount.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button onClick={() => setViewInvoice(null)} className="px-6 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition">
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
