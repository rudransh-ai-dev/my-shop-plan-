import React, { useState, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Mail, Lock, ArrowRight, Loader2, CheckCircle2,
  Database, Shield, Cpu, Brain, BarChart3, TrendingUp,
  Package, FileText, Zap, Globe
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const floatingShapes = [
  { size: 300, x: '10%', y: '-20%', duration: 20, delay: 0, color: 'from-indigo-500/10 to-purple-500/10', rotate: 45 },
  { size: 200, x: '70%', y: '60%', duration: 15, delay: 2, color: 'from-cyan-500/10 to-teal-500/10', rotate: -30 },
  { size: 150, x: '80%', y: '-10%', duration: 18, delay: 4, color: 'from-rose-500/10 to-pink-500/10', rotate: 60 },
  { size: 250, x: '-5%', y: '50%', duration: 22, delay: 1, color: 'from-amber-500/10 to-orange-500/10', rotate: -45 },
];

const particles = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 2,
  duration: Math.random() * 10 + 10,
  delay: Math.random() * 5,
}));

const AnimatedCounter = ({ target, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHasStarted(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasStarted) return;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / 2000, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [hasStarted, target]);

  const format = (n) => {
    if (n >= 10000000) return `${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K+`;
    return n.toString();
  };

  return <span>{prefix}{format(count)}{suffix}</span>;
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { darkMode } = useTheme();
  const controls = useAnimation();

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      setIsSuccess(true);
      await controls.start({ scale: 0.95, opacity: 0, transition: { duration: 0.3 } });
      setTimeout(() => navigate('/dashboard'), 600);
    } catch (err) {
      setError('Invalid email or password');
      controls.start({ x: [-10, 10, -10, 10, 0], transition: { duration: 0.5 } });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden transition-colors duration-500 ${
      darkMode ? 'bg-gray-950' : 'bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50'
    }`}>
      {/* Background - all non-interactive */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floatingShapes.map((shape, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full bg-gradient-to-br ${shape.color} blur-3xl`}
            style={{ width: shape.size, height: shape.size }}
            animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], rotate: [0, shape.rotate, -shape.rotate, 0], scale: [1, 1.1, 0.95, 1] }}
            transition={{ duration: shape.duration, repeat: Infinity, ease: 'easeInOut', delay: shape.delay }}
            initial={{ left: shape.x, top: shape.y }}
          />
        ))}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className={`absolute rounded-full ${darkMode ? 'bg-indigo-400/20' : 'bg-indigo-500/15'}`}
            style={{ width: p.size, height: p.size }}
            animate={{ y: [0, -100, 0], x: [0, Math.sin(p.id) * 30, 0], opacity: [0, 0.8, 0] }}
            transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
            initial={{ left: `${p.x}%`, top: `${p.y}%` }}
          />
        ))}
        <motion.div
          className={`absolute inset-0 ${darkMode ? 'opacity-[0.03]' : 'opacity-[0.04]'}`}
          style={{ backgroundImage: `radial-gradient(circle, ${darkMode ? '#fff' : '#6366f1'} 1px, transparent 1px)`, backgroundSize: '40px 40px' }}
          animate={{ opacity: [0.02, 0.05, 0.02] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">

        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: 'spring', stiffness: 100, damping: 15 }}
        >
          <motion.div
            className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-500/30 mb-4"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
          >
            <Building2 className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${darkMode ? 'text-gray-100' : 'text-slate-900'}`}>
            Welcome to{' '}
            <motion.span
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              style={{ backgroundSize: '200% 200%' }}
            >
              BusinessHub
            </motion.span>
          </h1>
          <p className={`mt-2 text-sm sm:text-base ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
            Sign in to your ERP dashboard
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 max-w-2xl w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {[
            { label: 'Products', value: 100000, icon: Package, prefix: '', suffix: '+' },
            { label: 'Orders', value: 100000, icon: FileText, prefix: '', suffix: '+' },
            { label: 'Revenue', value: 2508441014, icon: TrendingUp, prefix: '₹', suffix: '' },
            { label: 'Customers', value: 100000, icon: Database, prefix: '', suffix: '+' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className={`rounded-xl border p-3 text-center backdrop-blur-sm ${
                darkMode ? 'bg-gray-900/60 border-gray-800' : 'bg-white/60 border-white/50'
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.4, type: 'spring' }}
              whileHover={{ y: -3 }}
            >
              <stat.icon className={`h-4 w-4 mx-auto mb-1 ${darkMode ? 'text-indigo-400' : 'text-indigo-500'}`} />
              <p className={`text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-slate-900'}`}>
                <AnimatedCounter target={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-slate-400'}`}>{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Login Card */}
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7, type: 'spring', stiffness: 80, damping: 15 }}
        >
          <div className={`rounded-xl border shadow-2xl backdrop-blur-sm overflow-hidden ${
            darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-white/50'
          }`}>
            {/* Card Header */}
            <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-800 bg-gray-900/50' : 'border-slate-100 bg-slate-50/50'}`}>
              <h2 className={`text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-slate-900'}`}>Sign In</h2>
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-slate-400'}`}>Enter your credentials to continue</p>
            </div>

            {/* Form */}
            <form className="p-6 space-y-5" onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    className="bg-red-500/10 border-l-4 border-red-500 p-3 rounded-r-lg"
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    <p className="text-sm text-red-500">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div>
                <label htmlFor="email" className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                  Email address
                </label>
                <div className="relative">
                  <motion.div className="absolute left-3 top-1/2 -translate-y-1/2"
                    animate={{ color: focusedField === 'email' ? '#6366f1' : darkMode ? '#6b7280' : '#94a3b8' }}
                  >
                    <Mail className="h-5 w-5" />
                  </motion.div>
                  <input
                    id="email" name="email" type="email" autoComplete="email" required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                    className={`block w-full pl-10 pr-10 py-2.5 border rounded-lg text-sm focus:outline-none transition-all duration-300 ${
                      darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'border-slate-300 text-slate-900'
                    } ${focusedField === 'email' ? 'ring-2 ring-indigo-500 border-indigo-500 shadow-lg shadow-indigo-500/10' : ''}`}
                  />
                  <AnimatePresence>
                    {email && (
                      <motion.div className="absolute right-3 top-1/2 -translate-y-1/2"
                        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                  Password
                </label>
                <div className="relative">
                  <motion.div className="absolute left-3 top-1/2 -translate-y-1/2"
                    animate={{ color: focusedField === 'password' ? '#6366f1' : darkMode ? '#6b7280' : '#94a3b8' }}
                  >
                    <Lock className="h-5 w-5" />
                  </motion.div>
                  <input
                    id="password" name="password" type="password" autoComplete="current-password" required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none transition-all duration-300 ${
                      darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'border-slate-300 text-slate-900'
                    } ${focusedField === 'password' ? 'ring-2 ring-indigo-500 border-indigo-500 shadow-lg shadow-indigo-500/10' : ''}`}
                  />
                </div>
              </div>

              {/* Login Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full"
              >
                <button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all relative overflow-hidden"
                >
                  {isSuccess ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Welcome back!</span>
                    </>
                  ) : isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </motion.div>
            </form>

            {/* Demo creds */}
            <div className={`px-6 py-3 border-t text-center ${darkMode ? 'border-gray-800 bg-gray-900/50' : 'border-slate-100 bg-slate-50/50'}`}>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                Demo: <span className="font-mono">admin@businesshub.com</span> / <span className="font-mono">admin123</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 max-w-2xl w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          {[
            { icon: BarChart3, label: 'Analytics' },
            { icon: Brain, label: 'AI Insights' },
            { icon: Shield, label: 'Security' },
            { icon: Cpu, label: 'IoT Monitor' },
          ].map((f, i) => (
            <motion.div
              key={i}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                darkMode ? 'bg-gray-900/40 text-gray-400' : 'bg-white/40 text-slate-500'
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              whileHover={{ y: -2 }}
            >
              <f.icon className="h-4 w-4" />
              <span className="text-xs font-medium">{f.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 pointer-events-none"
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
        transition={{ delay: 1, duration: 1, ease: 'easeOut' }}
        style={{ transformOrigin: 'left' }}
      />
    </div>
  );
};

export default Login;
