import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Invoices from './pages/Invoices';
import Reports from './pages/Reports';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes encapsulated in Layout */}
          <Route element={<ProtectedRoute />}>
             <Route element={<Layout />}>
               <Route path="/dashboard" element={<Dashboard />} />
               <Route path="/inventory" element={<Inventory />} />
               <Route path="/invoices" element={<Invoices />} />
               <Route path="/reports" element={<Reports />} />
             </Route>
          </Route>

          {/* Fallback routing */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
