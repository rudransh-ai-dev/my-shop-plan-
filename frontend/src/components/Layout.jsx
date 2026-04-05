import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import { useTheme } from '../context/ThemeContext';

const pageVariants = {
    initial: { opacity: 0, y: 12, scale: 0.98 },
    in: { opacity: 1, y: 0, scale: 1 },
    out: { opacity: 0, y: -12, scale: 0.98 },
};

const pageTransition = {
    type: 'spring',
    stiffness: 260,
    damping: 30,
    duration: 0.35,
};

const Layout = () => {
    const { darkMode } = useTheme();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const location = useLocation();

    return (
        <div className={`flex h-screen w-full overflow-hidden font-sans transition-colors duration-300 ${
            darkMode ? 'bg-gray-950' : 'bg-gray-50'
        }`}>
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header sidebarCollapsed={sidebarCollapsed} />
                <main className={`flex-1 overflow-y-auto p-6 md:p-8 transition-colors duration-300 ${
                    darkMode ? 'bg-gray-950' : 'bg-slate-50'
                }`}>
                    <div className="mx-auto max-w-7xl">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial="initial"
                                animate="in"
                                exit="out"
                                variants={pageVariants}
                                transition={pageTransition}
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
