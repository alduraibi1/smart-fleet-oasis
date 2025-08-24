
import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from "@/components/ui/toaster"

import Auth from './pages/Auth';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Customers from './pages/Customers';
import CustomersNew from './pages/CustomersNew';
import CustomersV2 from './pages/CustomersV2';
import Contracts from './pages/Contracts';
import EnhancedContracts from './pages/EnhancedContracts';
import Maintenance from './pages/Maintenance';
import Inventory from './pages/Inventory';
import Suppliers from './pages/Suppliers';
import Owners from './pages/Owners';
import Accounting from './pages/Accounting';
import FinancialControl from './pages/FinancialControl';
import CustomerArrearsControl from './pages/CustomerArrearsControl';
import Reports from './pages/Reports';
import HR from './pages/HR';
import SystemManagement from './pages/SystemManagement';
import EnhancedSystemManagement from './pages/EnhancedSystemManagement';
import SystemOptimization from './pages/SystemOptimization';
import NotFound from './pages/NotFound';
import ButtonTest from './pages/ButtonTest';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import NotificationsPage from './pages/NotificationsPage';
import NotificationSettings from './components/Notifications/NotificationSettings';

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Toaster />
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/vehicles" element={<Vehicles />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/customers-new" element={<CustomersNew />} />
                    <Route path="/customers-v2" element={<CustomersV2 />} />
                    <Route path="/contracts" element={<Contracts />} />
                    <Route path="/enhanced-contracts" element={<EnhancedContracts />} />
                    <Route path="/maintenance" element={<Maintenance />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/suppliers" element={<Suppliers />} />
                    <Route path="/owners" element={<Owners />} />
                    <Route path="/accounting" element={<Accounting />} />
                    <Route path="/financial-control" element={<FinancialControl />} />
                    <Route path="/customer-arrears-control" element={<CustomerArrearsControl />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/hr" element={<HR />} />
                    <Route path="/system-management" element={<SystemManagement />} />
                    <Route path="/enhanced-system-management" element={<EnhancedSystemManagement />} />
                    <Route path="/system-optimization" element={<SystemOptimization />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/notification-settings" element={<NotificationSettings />} />
                    <Route path="/button-test" element={<ButtonTest />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
