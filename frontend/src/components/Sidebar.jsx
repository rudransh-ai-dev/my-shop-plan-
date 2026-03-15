import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  Package, 
  FileText, 
  Clock, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'GST Reports', href: '/reports', icon: Clock },
];

const Sidebar = () => {
    const { logout } = useAuth();
    
    return (
        <div className="flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300">
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
                                `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                    isActive
                                        ? 'bg-indigo-600 text-white shadow-sm'
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
            <div className="flex flex-shrink-0 border-t border-slate-800 p-4">
                <div className="flex w-full items-center mb-1">
                     <button
                        onClick={logout}
                        className="group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
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
