import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Tag, IndianRupee, Printer, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import client from '../api/client';

const Billing = () => {
    const { darkMode } = useTheme();
    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    // Search trigger
    useEffect(() => {
        const fetchInventory = async () => {
            if (search.length < 2) {
                setProducts([]);
                return;
            }
            setLoading(true);
            try {
                const res = await client.get(`/inventory/?search=${search}&limit=12`);
                setProducts(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        const timeoutId = setTimeout(fetchInventory, 300);
        return () => clearTimeout(timeoutId);
    }, [search]);

    const addToCart = (product) => {
        const item = cart.find(i => i.id === product.id);
        if (item) {
            setCart(cart.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
        } else {
            // Price is randomized here for demonstration since the new dataset doesn't have a strict retail price column
            setCart([...cart, { ...product, price: Math.floor(Math.random() * 500) + 100, qty: 1 }]);
        }
    };

    const checkout = async () => {
        if (cart.length === 0 || !customerName) return alert("Cart empty or missing Customer ID.");
        setCheckoutLoading(true);
        try {
            const payload = {
                customer_id: customerName,
                items: cart.map(i => ({ id: i.id, quantity: i.qty, price: i.price }))
            };
            const res = await client.post('/orders/', payload);
            alert(`Success! Invoice ${res.data.order_id} generated.`);
            setCart([]);
            setCustomerName('');
            setSearch('');
        } catch (err) {
            alert("Error: " + (err.response?.data?.detail || err.message));
        } finally {
            setCheckoutLoading(false);
        }
    };

    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const textPrimary = darkMode ? 'text-gray-100' : 'text-slate-900';
    const textSecondary = darkMode ? 'text-gray-400' : 'text-slate-500';
    const cardClass = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200';
    const inputClass = darkMode 
        ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500'
        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-indigo-500 focus:border-indigo-500';

    return (
        <div className="pb-8">
            <div className="md:flex md:items-center md:justify-between pb-6 border-b mb-8" style={{ borderColor: darkMode ? '#1e293b' : '#e2e8f0' }}>
                <div className="flex-1 min-w-0">
                    <h2 className={`text-2xl font-bold leading-7 sm:text-3xl ${textPrimary}`}>
                        <ShoppingCart className="inline h-7 w-7 mr-2 text-indigo-500" />
                        Billing System
                    </h2>
                    <p className={`mt-1 text-sm ${textSecondary}`}>Create new sale invoices quickly via dynamic database matching.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product Selection */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search products by Name (e.g., Pizza, Phone)..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border text-sm ${inputClass}`} 
                        />
                        {loading && <Loader2 className="absolute right-4 top-3.5 h-4 w-4 animate-spin text-indigo-500" />}
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                        {products.length === 0 && search.length >= 2 && !loading ? (
                            <div className={`col-span-full text-center py-6 ${textSecondary}`}>No products found.</div>
                        ) : (
                            products.map(product => (
                                <div 
                                    key={product.id} 
                                    onClick={() => addToCart(product)}
                                    className={`p-4 rounded-xl border cursor-pointer hover:border-indigo-500 transition-colors ${cardClass}`}
                                >
                                    <Tag className="h-5 w-5 text-indigo-500 mb-2" />
                                    <h3 className={`font-bold text-sm ${textPrimary} truncate`} title={product.name}>{product.name}</h3>
                                    <p className={`text-xs mt-1 ${textSecondary}`}>ID: {product.product_id}</p>
                                    <p className={`text-xs font-semibold mt-1 text-emerald-500`}>In Stock: {product.stock}</p>
                                </div>
                            ))
                        )}
                        {search.length < 2 && (
                            <div className={`col-span-full text-center py-10 ${textSecondary}`}>
                                Type at least 2 characters to search the 100k+ inventory.
                            </div>
                        )}
                    </div>
                </div>

                {/* Cart & Checkout */}
                <div className={`rounded-xl border shadow-sm flex flex-col h-[500px] ${cardClass}`}>
                    <div className="p-4 border-b border-inherit">
                        <h3 className={`font-bold text-lg ${textPrimary}`}>Current Invoice</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        <input 
                            type="text" 
                            placeholder="Customer ID (e.g., CUST000001)" 
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border text-sm mb-2 ${inputClass}`} 
                        />
                        {cart.length === 0 ? (
                            <p className={`text-sm text-center mt-10 ${textSecondary}`}>Cart is empty</p>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className={`flex justify-between items-center text-sm ${textPrimary}`}>
                                    <div className="max-w-[150px]">
                                        <span className="truncate block">{item.name}</span>
                                        <div className={`text-xs ${textSecondary}`}>₹{item.price} x {item.qty}</div>
                                    </div>
                                    <div className="font-bold whitespace-nowrap">₹{item.price * item.qty}</div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-4 border-t border-inherit bg-slate-50/5 dark:bg-gray-800/20">
                        <div className={`flex justify-between items-center mb-4 ${textPrimary}`}>
                            <span className="font-medium text-lg">Total Amount</span>
                            <span className="font-bold text-xl text-indigo-500 flex items-center">
                                <IndianRupee className="h-5 w-5 mr-0.5" />
                                {total.toLocaleString()}
                            </span>
                        </div>
                        <button 
                            onClick={checkout}
                            disabled={checkoutLoading || cart.length === 0 || !customerName}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3 rounded-lg font-bold shadow-lg shadow-indigo-500/30 transition-all"
                        >
                            {checkoutLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Printer className="h-5 w-5" />} 
                            {checkoutLoading ? 'Processing...' : 'Generate Invoice'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Billing;
