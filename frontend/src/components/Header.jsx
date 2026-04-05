import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Header = ({ sidebarCollapsed }) => {
    const { darkMode, toggleDarkMode } = useTheme();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <header
            className={`sticky top-0 z-10 w-full flex h-16 flex-shrink-0 shadow-sm border-b transition-colors duration-300 ${
                darkMode
                    ? 'bg-gray-900/80 border-gray-800 backdrop-blur-xl'
                    : 'bg-white/80 border-gray-100 backdrop-blur-xl'
            }`}
        >
            <div className="flex flex-1 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3">
                    <motion.div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                            darkMode
                                ? 'bg-indigo-500/10 border border-indigo-500/20'
                                : 'bg-indigo-50 border border-indigo-100'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Clock className={`h-4 w-4 ${darkMode ? 'text-indigo-400' : 'text-indigo-500'}`} />
                        <span className={`text-sm font-mono font-semibold tracking-wide ${
                            darkMode ? 'text-indigo-300' : 'text-indigo-700'
                        }`}>
                            {formatTime(currentTime)}
                        </span>
                    </motion.div>
                    <div className={`hidden sm:block text-sm font-medium ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                        {formatDate(currentTime)}
                    </div>
                </div>

                <div className="flex items-center">
                    <motion.button
                        onClick={toggleDarkMode}
                        className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                            darkMode
                                ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.9 }}
                        title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        <motion.div
                            key={darkMode ? 'moon' : 'sun'}
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </motion.div>
                        <span className="hidden sm:inline">{darkMode ? 'Light' : 'Dark'}</span>
                    </motion.button>
                </div>
            </div>
        </header>
    );
};

export default Header;
