import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Activity, FileText, ShoppingCart, Loader2 } from 'lucide-react';
import client from '../api/client';
import { useTheme } from '../context/ThemeContext';
import ReactMarkdown from 'react-markdown';

const AIInsights = () => {
    const { darkMode } = useTheme();
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hello! I am your AI Business Assistant. I am connected to your live ERP database.\n\nAsk me anything about your revenue, GST summary, top selling items, or low stock warnings.'
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (text) => {
        if (!text.trim()) return;

        const userMsg = { role: 'user', content: text };
        setMessages((prev) => [...prev, userMsg]);
        setInputValue('');
        setLoading(true);

        try {
            const response = await client.post('/analytics/chat', {
                message: text
            });
            const botMsg = { role: 'assistant', content: response.data.response };
            setMessages((prev) => [...prev, botMsg]);
        } catch (error) {
            console.error('AI chat failed:', error);
            const errorMsg = { role: 'assistant', content: '❌ Sorry, I encountered an error connecting to the database analytics engine.' };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAction = (action) => {
        handleSend(action);
    };

    const quickActions = [
        { label: 'Revenue this month', icon: Activity },
        { label: 'Top selling products', icon: ShoppingCart },
        { label: 'GST liability summary', icon: FileText },
        { label: 'What should I improve?', icon: Sparkles }
    ];

    const bgClass = darkMode ? 'bg-[#0f172a]' : 'bg-slate-50';
    const cardClass = darkMode ? 'bg-[#1e293b] border-gray-800' : 'bg-white border-slate-200';
    const textPrimary = darkMode ? 'text-gray-100' : 'text-slate-900';
    const textSecondary = darkMode ? 'text-gray-400' : 'text-slate-500';
    const borderClass = darkMode ? 'border-gray-800' : 'border-slate-200';
    const inputBg = darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-slate-300 text-slate-900';

    return (
        <div className={`flex flex-col h-[calc(100vh-64px)] -m-8 sm:-m-6 lg:-m-8 p-0 ${bgClass}`}>
            {/* Header */}
            <div className={`shrink-0 border-b p-6 bg-gradient-to-r ${darkMode ? 'from-indigo-900/50 to-purple-900/50 border-gray-800' : 'from-indigo-50 to-purple-50 border-slate-200'}`}>
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
                        <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h2 className={`text-2xl font-bold ${textPrimary}`}>AI Assistant</h2>
                        <p className={`text-sm ${textSecondary}`}>
                            Advanced Data Science & Insights
                        </p>
                    </div>
                </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {message.role === 'assistant' && (
                            <div className="shrink-0 h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                                <Bot className="h-6 w-6 text-white" />
                            </div>
                        )}
                        <div
                            className={`max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm text-sm/relaxed ${
                                message.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                                    : `${cardClass} border rounded-tl-sm ${textPrimary}`
                            }`}
                        >
                            <ReactMarkdown className="prose prose-sm dark:prose-invert">
                                {message.content}
                            </ReactMarkdown>
                        </div>
                        {message.role === 'user' && (
                            <div className="shrink-0 h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                <User className="h-5 w-5 text-slate-600 dark:text-gray-300" />
                            </div>
                        )}
                    </div>
                ))}
                
                {loading && (
                    <div className="flex gap-4 justify-start">
                        <div className="shrink-0 h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                            <Bot className="h-6 w-6 text-white" />
                        </div>
                        <div className={`${cardClass} border rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center`}>
                            <Loader2 className={`h-5 w-5 animate-spin ${textSecondary}`} />
                            <span className={`ml-3 text-sm font-medium ${textSecondary}`}>Analyzing business data...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions & Input Area */}
            <div className={`shrink-0 border-t p-6 ${darkMode ? 'bg-[#1e293b] border-gray-800' : 'bg-white border-slate-200'}`}>
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {quickActions.map((action, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleQuickAction(action.label)}
                            className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 shadow-sm ${
                                darkMode 
                                ? 'bg-gray-800 border-gray-700 text-indigo-300 hover:bg-gray-700 hover:text-indigo-200' 
                                : 'bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800'
                            }`}
                        >
                            <action.icon className="h-3.5 w-3.5 mr-2" />
                            {action.label}
                        </button>
                    ))}
                </div>

                {/* Input Box */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend(inputValue);
                    }}
                    className="flex gap-3"
                >
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask me anything about your 6 million records..."
                        className={`flex-1 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm border ${inputBg} transition-colors`}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || loading}
                        className="px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium flex items-center justify-center shadow-lg shadow-indigo-600/20 transition-all duration-200"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AIInsights;
