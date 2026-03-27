import React from 'react';
import { NavLink } from 'react-router-dom';
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
  Cpu
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

const Sidebar = () => {
    const { logout } = useAuth();
    const { darkMode } = useTheme();
    
    return (
        <div className={`flex flex-col w-64 border-r transition-colors duration-300 ${
            darkMode 
                ? 'bg-gray-900 border-gray-800 text-gray-300' 
                : 'bg-slate-900 border-slate-800 text-slate-300'
        }`}>
            <div className="flex h-16 shrink-0 items-center px-6">
                <span className="text-xl font-bold tracking-tight text-white">BusinessHub</span>
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
                <nav className="flex-1 space-y-1 px-3">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) =>
                                `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    isActive
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                        : darkMode
                                            ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`
                            }
                        >
                            <item.icon
                                className="mr-3 flex-shrink-0 h-5 w-5"
                                aria-hidden="true"
                            />
                            {item.name}
                        </NavLink>
                    ))}

                    {/* Advanced Modules Divider */}
                    <div className={`pt-4 pb-2 px-3`}>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${
                            darkMode ? 'text-gray-600' : 'text-slate-600'
                        }`}>🚀 ADVANCED MODULES</p>
                    </div>

                    {advancedModules.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) =>
                                `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    isActive
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                        : darkMode
                                            ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`
                            }
                        >
                            <item.icon
                                className="mr-3 flex-shrink-0 h-5 w-5"
                                aria-hidden="true"
                            />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>
            </div>
            <div className={`flex flex-shrink-0 border-t p-4 ${
                darkMode ? 'border-gray-800' : 'border-slate-800'
            }`}>
                <div className="flex w-full items-center mb-1">
                     <button
                        onClick={logout}
                        className={`group flex w-full items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                            darkMode
                                ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                     >
                        <LogOut className="mr-3 flex-shrink-0 h-5 w-5" />
                        Logout
                     </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
