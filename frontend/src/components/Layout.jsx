import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useTheme } from '../context/ThemeContext';

const Layout = () => {
    const { darkMode } = useTheme();

    return (
        <div className={`flex h-screen w-full overflow-hidden font-sans transition-colors duration-300 ${
            darkMode ? 'bg-gray-950' : 'bg-gray-50'
        }`}>
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className={`flex-1 overflow-y-auto p-6 md:p-8 transition-colors duration-300 ${
                    darkMode ? 'bg-gray-950' : 'bg-slate-50'
                }`}>
                    <div className="mx-auto max-w-7xl">
                       <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
