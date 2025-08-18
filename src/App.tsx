
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { AuthProvider } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Customers from './pages/Customers';
import Owners from './pages/Owners';
import Vehicles from './pages/Vehicles';
import Contracts from './pages/Contracts';
import Accounting from './pages/Accounting';
import Reports from './pages/Reports';
import SystemManagement from './pages/SystemManagement';
import EnhancedSystemManagement from './pages/EnhancedSystemManagement';
import Maintenance from './pages/Maintenance';
import Inventory from './pages/Inventory';
import { Toaster } from '@/components/ui/toaster';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/customers" element={
                  <ProtectedRoute requiredRole="employee">
                    <Customers />
                  </ProtectedRoute>
                } />
                <Route path="/owners" element={
                  <ProtectedRoute requiredRole="employee">
                    <Owners />
                  </ProtectedRoute>
                } />
                <Route path="/vehicles" element={
                  <ProtectedRoute requiredRole="employee">
                    <Vehicles />
                  </ProtectedRoute>
                } />
                <Route path="/contracts" element={
                  <ProtectedRoute requiredRole="employee">
                    <Contracts />
                  </ProtectedRoute>
                } />
                <Route path="/accounting" element={
                  <ProtectedRoute requiredRole="accountant">
                    <Accounting />
                  </ProtectedRoute>
                } />
                <Route path="/reports" element={
                  <ProtectedRoute requiredRole="manager">
                    <Reports />
                  </ProtectedRoute>
                } />
                <Route path="/maintenance" element={
                  <ProtectedRoute requiredRole="employee">
                    <Maintenance />
                  </ProtectedRoute>
                } />
                <Route path="/inventory" element={
                  <ProtectedRoute requiredRole="employee">
                    <Inventory />
                  </ProtectedRoute>
                } />
                {/* Redirect old advanced reports path to unified reports */}
                <Route path="/advanced-reports" element={<Navigate to="/reports" replace />} />
                <Route path="/system-management" element={
                  <ProtectedRoute requiredRole="admin">
                    <SystemManagement />
                  </ProtectedRoute>
                } />
                <Route path="/enhanced-system-management" element={
                  <ProtectedRoute requiredRole="admin">
                    <EnhancedSystemManagement />
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
            <Toaster />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
