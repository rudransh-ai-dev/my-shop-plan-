import React, { useState, useEffect } from 'react';
import { Cpu, Wifi, WifiOff, Router, RefreshCw, Radio, Zap, ArrowRightLeft } from 'lucide-react';
import client from '../api/client';
import { useTheme } from '../context/ThemeContext';

const IoTMonitor = () => {
  const { darkMode } = useTheme();
  const [devices, setDevices] = useState([]);
  const [sensorReading, setSensorReading] = useState(null);
  const [syncResult, setSyncResult] = useState(null);
  const [skuInput, setSkuInput] = useState('');
  const [syncQty, setSyncQty] = useState('');
  const [syncSku, setSyncSku] = useState('');
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await client.get('/analytics/iot-device-health');
      setDevices(res.data);
    } catch (err) {
      console.error('IoT fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const simulateSensor = async () => {
    if (!skuInput) return;
    setSimulating(true);
    try {
      const res = await client.get(`/analytics/iot-simulate-reading/${skuInput}`);
      setSensorReading(res.data);
    } catch (err) {
      console.error('Sensor simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  const syncToCloud = async () => {
    if (!syncSku || !syncQty) return;
    setSyncing(true);
    try {
      const res = await client.post(`/analytics/iot-sync-stock?sku=${encodeURIComponent(syncSku)}&quantity=${syncQty}`);
      setSyncResult(res.data);
    } catch (err) {
      console.error('Sync error:', err);
      setSyncResult({ status: 'ERROR', message: err.response?.data?.detail || 'Sync failed' });
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => { fetchDevices(); }, []);

  const cardClass = `rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
    darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'
  }`;
  const textPrimary = darkMode ? 'text-gray-100' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-slate-500';
  const textMuted = darkMode ? 'text-gray-500' : 'text-slate-400';
  const inputClass = `w-full px-4 py-3 rounded-lg border text-sm transition-colors ${
    darkMode
      ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-600'
      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
  } focus:outline-none focus:ring-2 focus:ring-cyan-500`;

  if (loading) {
    return (
      <div className={`flex h-64 items-center justify-center ${textSecondary}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          <span>Connecting to sensor mesh...</span>
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
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 shadow-lg shadow-cyan-500/25">
              <Cpu className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold leading-7 sm:text-3xl ${textPrimary}`}>
                IoT Monitor
              </h2>
              <p className={`mt-0.5 text-sm ${textSecondary}`}>
                BCA6002 — Internet of Things
              </p>
            </div>
          </div>
        </div>
        <button onClick={fetchDevices}
          className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-cyan-600 text-white hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-600/20">
          <RefreshCw className="h-4 w-4" /> Refresh Mesh
        </button>
      </div>

      {/* Device Mesh Grid */}
      <h3 className={`text-lg font-bold mb-4 ${textPrimary}`}>📡 Sensor Mesh — Device Health</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {devices.map((device, i) => (
          <div key={i} className={`${cardClass} relative overflow-hidden`}>
            {/* Status indicator line */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${
              device.node_status === 'ONLINE' ? 'bg-emerald-500' : 'bg-red-500'
            }`} />
            
            <div className="flex items-center justify-between mb-4 mt-1">
              <div className="flex items-center gap-2">
                <Router className={`h-5 w-5 ${device.node_status === 'ONLINE' ? 'text-emerald-500' : 'text-red-500'}`} />
                <span className={`font-bold ${textPrimary}`}>{device.shelf}</span>
              </div>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full ${
                device.node_status === 'ONLINE'
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  : 'bg-red-500/10 text-red-500 border border-red-500/20'
              }`}>
                {device.node_status === 'ONLINE' ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {device.node_status}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className={`text-xs ${textMuted}`}>Last Ping</span>
                <span className={`text-xs font-mono ${textSecondary}`}>{device.last_ping?.split('T')[1]?.split('.')[0] || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-xs ${textMuted}`}>Signal</span>
                <span className={`text-xs font-mono ${textSecondary}`}>{device.connectivity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column: Sensor Simulator + Cloud Sync */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sensor Simulator */}
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-6 pb-4 border-b"
            style={{ borderColor: darkMode ? '#1e293b' : '#f1f5f9' }}>
            <Radio className="h-5 w-5 text-cyan-500" />
            <h3 className={`text-lg font-bold ${textPrimary}`}>Sensor Simulator</h3>
          </div>
          <p className={`text-sm mb-4 ${textMuted}`}>
            Simulate a weight/RFID sensor reading for a product. Enter a product SKU below.
          </p>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={skuInput}
              onChange={(e) => setSkuInput(e.target.value)}
              placeholder="Enter Product SKU (e.g., SKU001)"
              className={inputClass}
            />
            <button onClick={simulateSensor} disabled={simulating}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-cyan-600 text-white hover:bg-cyan-700 transition-colors whitespace-nowrap disabled:opacity-50">
              {simulating ? '...' : 'Read'}
            </button>
          </div>

          {sensorReading && (
            <div className={`p-4 rounded-xl border ${
              darkMode ? 'bg-cyan-500/5 border-cyan-500/10' : 'bg-cyan-50 border-cyan-100'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-cyan-500" />
                <span className={`text-sm font-bold ${textPrimary}`}>Sensor Reading</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={textMuted}>Sensor ID:</div>
                <div className={`font-mono ${textSecondary}`}>{sensorReading.sensor_id}</div>
                <div className={textMuted}>SKU:</div>
                <div className={`font-mono ${textSecondary}`}>{sensorReading.sku}</div>
                <div className={textMuted}>Weight:</div>
                <div className={`font-mono ${textSecondary}`}>{sensorReading.weight_grams}g</div>
                <div className={textMuted}>Units Calculated:</div>
                <div className={`font-mono font-bold ${textPrimary}`}>{sensorReading.units_calculated}</div>
                <div className={textMuted}>Battery:</div>
                <div className={`font-mono ${textSecondary}`}>{sensorReading.battery_level}</div>
                <div className={textMuted}>Timestamp:</div>
                <div className={`font-mono ${textSecondary}`}>{sensorReading.timestamp?.split('T')[1]?.split('.')[0]}</div>
              </div>
            </div>
          )}
        </div>

        {/* Cloud Sync */}
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-6 pb-4 border-b"
            style={{ borderColor: darkMode ? '#1e293b' : '#f1f5f9' }}>
            <ArrowRightLeft className="h-5 w-5 text-emerald-500" />
            <h3 className={`text-lg font-bold ${textPrimary}`}>Hardware → Cloud Sync</h3>
          </div>
          <p className={`text-sm mb-4 ${textMuted}`}>
            Push a sensor reading directly to the ERP database. This demonstrates real-time IoT-to-Cloud data flow.
          </p>

          <div className="space-y-3 mb-4">
            <input
              type="text"
              value={syncSku}
              onChange={(e) => setSyncSku(e.target.value)}
              placeholder="Product SKU"
              className={inputClass}
            />
            <input
              type="number"
              value={syncQty}
              onChange={(e) => setSyncQty(e.target.value)}
              placeholder="New Stock Quantity (from sensor)"
              className={inputClass}
            />
            <button onClick={syncToCloud} disabled={syncing}
              className="w-full px-4 py-3 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-600/20">
              {syncing ? 'Syncing...' : '⚡ Sync to ERP Database'}
            </button>
          </div>

          {syncResult && (
            <div className={`p-4 rounded-xl border ${
              syncResult.status === 'SUCCESS'
                ? (darkMode ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-emerald-50 border-emerald-100')
                : (darkMode ? 'bg-red-500/5 border-red-500/10' : 'bg-red-50 border-red-100')
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {syncResult.status === 'SUCCESS' ? (
                  <Zap className="h-4 w-4 text-emerald-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-bold ${textPrimary}`}>
                  {syncResult.status === 'SUCCESS' ? 'Sync Complete' : 'Sync Failed'}
                </span>
              </div>
              {syncResult.status === 'SUCCESS' ? (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={textMuted}>Product:</div>
                  <div className={`font-mono ${textSecondary}`}>{syncResult.product}</div>
                  <div className={textMuted}>Previous Stock:</div>
                  <div className={`font-mono ${textSecondary}`}>{syncResult.old_val}</div>
                  <div className={textMuted}>New Stock:</div>
                  <div className={`font-mono font-bold text-emerald-500`}>{syncResult.new_val}</div>
                  <div className={textMuted}>Sync Time:</div>
                  <div className={`font-mono ${textSecondary}`}>{syncResult.sync_time?.split('T')[1]?.split('.')[0]}</div>
                </div>
              ) : (
                <p className={`text-xs ${textMuted}`}>{syncResult.message}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IoTMonitor;
