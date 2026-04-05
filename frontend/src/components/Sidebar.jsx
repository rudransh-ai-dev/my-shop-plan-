import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Package, 
  FileText, 
  Clock, 
  LogOut,
  Warehouse,
  Brain,
  Shield,
  ShoppingCart,
  Cpu,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Billing', href: '/billing', icon: ShoppingCart },
  { name: 'Orders', href: '/orders', icon: FileText },
  { name: 'Store Room', href: '/storeroom', icon: Warehouse },
  { name: 'Inventory', href: '/inventory', icon: Package },
];

const advancedModules = [
  { name: 'AI Insights', href: '/ai-insights', icon: Brain },
  { name: 'Security', href: '/security', icon: Shield },
  { name: 'IoT Monitor', href: '/iot', icon: Cpu },
];

const sidebarVariants = {
  expanded: { width: 256, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  collapsed: { width: 72, transition: { type: 'spring', stiffness: 300, damping: 30 } },
};

const navVariants = (i) => ({
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { delay: i * 0.05, type: 'spring', stiffness: 200, damping: 20 } },
});

const Sidebar = ({ collapsed, onToggle }) => {
    const { logout } = useAuth();
    const { darkMode } = useTheme();
    
    return (
        <motion.div
            className={`flex flex-col border-r transition-colors duration-300 overflow-hidden ${
                darkMode 
                    ? 'bg-gray-900 border-gray-800 text-gray-300' 
                    : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}
            variants={sidebarVariants}
            animate={collapsed ? 'collapsed' : 'expanded'}
            initial="expanded"
        >
            <div className={`flex h-16 shrink-0 items-center ${collapsed ? 'justify-center px-2' : 'px-6'}`}>
                <AnimatePresence mode="wait">
                    {!collapsed ? (
                        <motion.span
                            key="full-logo"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="text-xl font-bold tracking-tight text-white whitespace-nowrap"
                        >
                            BusinessHub
                        </motion.span>
                    ) : (
                        <motion.span
                            key="mini-logo"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="text-lg font-bold text-white"
                        >
                            BH
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
                <nav className="flex-1 space-y-1 px-3">
                    {navigation.map((item, i) => (
                        <motion.div key={item.name} variants={navVariants(i)} initial="hidden" animate="visible">
                            <NavLink
                                to={item.href}
                                className={({ isActive }) =>
                                    `group flex items-center ${collapsed ? 'justify-center px-2' : 'px-3'} py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                                        isActive
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                            : darkMode
                                                ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`
                                }
                                title={collapsed ? item.name : undefined}
                            >
                                <item.icon className={`${collapsed ? '' : 'mr-3'} flex-shrink-0 h-5 w-5`} aria-hidden="true" />
                                <AnimatePresence mode="wait">
                                    {!collapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: 'auto' }}
                                            exit={{ opacity: 0, width: 0 }}
                                            transition={{ duration: 0.15 }}
                                            className="whitespace-nowrap overflow-hidden"
                                        >
                                            {item.name}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </NavLink>
                        </motion.div>
                    ))}

                    <AnimatePresence mode="wait">
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="pt-4 pb-2 px-3 overflow-hidden"
                            >
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${
                                    darkMode ? 'text-gray-600' : 'text-slate-600'
                                }`}>🚀 ADVANCED MODULES</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {advancedModules.map((item, i) => (
                        <motion.div key={item.name} variants={navVariants(i + navigation.length)} initial="hidden" animate="visible">
                            <NavLink
                                to={item.href}
                                className={({ isActive }) =>
                                    `group flex items-center ${collapsed ? 'justify-center px-2' : 'px-3'} py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                                        isActive
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                            : darkMode
                                                ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`
                                }
                                title={collapsed ? item.name : undefined}
                            >
                                <item.icon className={`${collapsed ? '' : 'mr-3'} flex-shrink-0 h-5 w-5`} aria-hidden="true" />
                                <AnimatePresence mode="wait">
                                    {!collapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: 'auto' }}
                                            exit={{ opacity: 0, width: 0 }}
                                            transition={{ duration: 0.15 }}
                                            className="whitespace-nowrap overflow-hidden"
                                        >
                                            {item.name}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </NavLink>
                        </motion.div>
                    ))}
                </nav>
            </div>

            <div className={`flex flex-shrink-0 border-t p-4 ${
                darkMode ? 'border-gray-800' : 'border-slate-800'
            }`}>
                <div className="flex flex-col w-full gap-1 overflow-hidden">
                    <button
                        onClick={() => onToggle()}
                        className={`group flex w-full items-center ${collapsed ? 'justify-center px-2' : 'px-3'} py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                            darkMode
                                ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="mr-3 flex-shrink-0 h-5 w-5" />}
                        <AnimatePresence mode="wait">
                            {!collapsed && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="ml-3 whitespace-nowrap overflow-hidden"
                                >
                                    Collapse
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                    <button
                        onClick={logout}
                        className={`group flex w-full items-center ${collapsed ? 'justify-center px-2' : 'px-3'} py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                            darkMode
                                ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                        title={collapsed ? 'Logout' : undefined}
                    >
                        <LogOut className={`${collapsed ? '' : 'mr-3'} flex-shrink-0 h-5 w-5`} />
                        <AnimatePresence mode="wait">
                            {!collapsed && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="ml-3 whitespace-nowrap overflow-hidden"
                                >
                                    Logout
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default Sidebar;
