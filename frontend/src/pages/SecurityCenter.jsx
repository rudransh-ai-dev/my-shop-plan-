import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Lock, KeyRound, RefreshCw, Hash, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import client from '../api/client';
import { useTheme } from '../context/ThemeContext';

const SecurityCenter = () => {
  const { darkMode } = useTheme();
  const [threats, setThreats] = useState([]);
  const [compliance, setCompliance] = useState(null);
  const [loading, setLoading] = useState(true);

  // PII Hasher demo state
  const [piiInput, setPiiInput] = useState('');
  const [hashedOutput, setHashedOutput] = useState('');
  const [showInput, setShowInput] = useState(false);

  const fetchSecurity = async () => {
    setLoading(true);
    try {
      const [t, c] = await Promise.all([
        client.get('/analytics/security-threats'),
        client.get('/analytics/security-compliance'),
      ]);
      setThreats(t.data);
      setCompliance(c.data);
    } catch (err) {
      console.error('Security fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSecurity(); }, []);

  // Client-side SHA-256 demo
  const hashPII = async () => {
    if (!piiInput) return;
    const encoder = new TextEncoder();
    const data = encoder.encode(piiInput);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    setHashedOutput(hex);
  };

  useEffect(() => { hashPII(); }, [piiInput]);

  const cardClass = `rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
    darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'
  }`;
  const textPrimary = darkMode ? 'text-gray-100' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-slate-500';
  const textMuted = darkMode ? 'text-gray-500' : 'text-slate-400';

  if (loading) {
    return (
      <div className={`flex h-64 items-center justify-center ${textSecondary}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          <span>Running security scan...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between pb-6 border-b mb-8"
        style={{ borderColor: darkMode ? '#1e293b' : '#e2e8f0' }}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 shadow-lg shadow-red-500/25">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold leading-7 sm:text-3xl ${textPrimary}`}>
                Security Center
              </h2>
              <p className={`mt-0.5 text-sm ${textSecondary}`}>
                BCA6001 — Information & Cyber Security
              </p>
            </div>
          </div>
        </div>
        <button onClick={fetchSecurity}
          className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20">
          <RefreshCw className="h-4 w-4" /> Re-scan
        </button>
      </div>

      {/* Compliance Status + Threat Count */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Encryption</p>
            <div className="p-2 rounded-lg bg-emerald-500/10"><Lock className="h-5 w-5 text-emerald-500" /></div>
          </div>
          <div className="flex items-center gap-2">
            {compliance?.is_encrypted ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            ) : (
              <XCircle className="h-6 w-6 text-red-500" />
            )}
            <p className={`text-xl font-bold ${textPrimary}`}>
              {compliance?.is_encrypted ? 'ENCRYPTED' : 'VULNERABLE'}
            </p>
          </div>
          <p className={`text-xs mt-1 ${textMuted}`}>{compliance?.algorithm}</p>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Key Rotation</p>
            <div className="p-2 rounded-lg bg-indigo-500/10"><KeyRound className="h-5 w-5 text-indigo-500" /></div>
          </div>
          <p className={`text-xl font-bold ${textPrimary}`}>{compliance?.key_rotation_status}</p>
          <p className={`text-xs mt-1 ${textMuted}`}>Last scan: {compliance?.last_scan?.split('T')[0]}</p>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Active Threats</p>
            <div className="p-2 rounded-lg bg-red-500/10"><ShieldAlert className="h-5 w-5 text-red-500" /></div>
          </div>
          <p className={`text-3xl font-bold ${threats.length > 0 ? 'text-red-500' : textPrimary}`}>{threats.length}</p>
          <p className={`text-xs mt-1 ${textMuted}`}>{threats.length > 0 ? 'Immediate attention required' : 'All clear'}</p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Threat Monitor */}
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-6 pb-4 border-b"
            style={{ borderColor: darkMode ? '#1e293b' : '#f1f5f9' }}>
            <ShieldAlert className="h-5 w-5 text-red-500" />
            <h3 className={`text-lg font-bold ${textPrimary}`}>Threat Monitor</h3>
          </div>
          {threats.length > 0 ? (
            <div className="space-y-3">
              {threats.map((t, i) => (
                <div key={i} className={`p-4 rounded-xl border-l-4 ${
                  t.severity === 'CRITICAL'
                    ? 'border-l-red-500 ' + (darkMode ? 'bg-red-500/5 border border-red-500/10' : 'bg-red-50 border border-red-100')
                    : 'border-l-amber-500 ' + (darkMode ? 'bg-amber-500/5 border border-amber-500/10' : 'bg-amber-50 border border-amber-100')
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-bold ${textPrimary}`}>{t.type.replace(/_/g, ' ')}</span>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      t.severity === 'CRITICAL'
                        ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>{t.severity}</span>
                  </div>
                  <p className={`text-xs ${textMuted}`}>{t.details}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-12 ${textMuted}`}>
              <Shield className="h-10 w-10 mb-2 opacity-20" />
              <p className="text-sm">No active threats detected. System is secure.</p>
            </div>
          )}
        </div>

        {/* PII Hasher - Cryptography Demo */}
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-6 pb-4 border-b"
            style={{ borderColor: darkMode ? '#1e293b' : '#f1f5f9' }}>
            <Hash className="h-5 w-5 text-indigo-500" />
            <h3 className={`text-lg font-bold ${textPrimary}`}>SHA-256 Cryptography Demo</h3>
          </div>
          <p className={`text-sm mb-4 ${textMuted}`}>
            Demonstrates one-way hashing for PII protection. This is how passwords and sensitive data are secured.
          </p>

          {/* Input */}
          <div className="mb-4">
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${textSecondary}`}>
              Enter Sensitive Data (e.g., Aadhaar, PAN, Phone)
            </label>
            <div className="relative">
              <input
                type={showInput ? 'text' : 'password'}
                value={piiInput}
                onChange={(e) => setPiiInput(e.target.value)}
                placeholder="Enter any text..."
                className={`w-full px-4 py-3 rounded-lg border text-sm transition-colors ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-600'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              <button onClick={() => setShowInput(!showInput)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${textMuted} hover:text-indigo-500`}>
                {showInput ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Output */}
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${textSecondary}`}>
              SHA-256 Hash (One-Way, Irreversible)
            </label>
            <div className={`px-4 py-3 rounded-lg border font-mono text-xs break-all ${
              darkMode
                ? 'bg-gray-800/50 border-gray-700 text-emerald-400'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              {hashedOutput || 'Hash will appear here...'}
            </div>
          </div>

          {/* Info */}
          <div className={`mt-4 p-3 rounded-lg text-xs ${
            darkMode ? 'bg-indigo-500/5 border border-indigo-500/10 text-indigo-300' : 'bg-indigo-50 border border-indigo-100 text-indigo-700'
          }`}>
            <strong>Key Concept:</strong> SHA-256 produces a fixed 256-bit (64 hex character) output. Even a single character change produces a completely different hash (Avalanche Effect).
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityCenter;
