import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './routes/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Invoices from './pages/Invoices';
import Reports from './pages/Reports';
import StoreRoom from './pages/StoreRoom';
import AIInsights from './pages/AIInsights';
import SecurityCenter from './pages/SecurityCenter';
import IoTMonitor from './pages/IoTMonitor';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes encapsulated in Layout */}
            <Route element={<ProtectedRoute />}>
               <Route element={<Layout />}>
                 <Route path="/dashboard" element={<Dashboard />} />
                 <Route path="/inventory" element={<Inventory />} />
                 <Route path="/storeroom" element={<StoreRoom />} />
                 <Route path="/invoices" element={<Invoices />} />
                 <Route path="/reports" element={<Reports />} />
                 <Route path="/ai-insights" element={<AIInsights />} />
                 <Route path="/security" element={<SecurityCenter />} />
                 <Route path="/iot" element={<IoTMonitor />} />
               </Route>
            </Route>

            {/* Fallback routing */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
