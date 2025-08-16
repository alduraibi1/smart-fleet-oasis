import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { Customers } from './pages/Customers';
import { Dashboard } from './pages/Dashboard';
import { Owners } from './pages/Owners';
import { Vehicles } from './pages/Vehicles';
import { Contracts } from './pages/Contracts';
import { Accounting } from './pages/Accounting';
import { SystemManagement } from './pages/SystemManagement';
import { QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/use-toast';
import { ThemeProvider } from '@/components/theme-provider';
import { FinancialControlDashboard } from '@/components/Accounting/FinancialControl/FinancialControlDashboard';
import { NewCustomers } from '@/pages/NewCustomers';
import EnhancedSystemManagement from '@/pages/EnhancedSystemManagement';

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider defaultTheme="light" storageKey="vite-react-theme">
        <ToastProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/new-customers" element={<NewCustomers />} />
              <Route path="/owners" element={<Owners />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/contracts" element={<Contracts />} />
              <Route path="/accounting" element={<Accounting />} />
              <Route path="/financial-control" element={<FinancialControlDashboard />} />
              <Route path="/system-management" element={<SystemManagement />} />
              <Route path="/enhanced-system-management" element={<EnhancedSystemManagement />} />
            </Routes>
          </Router>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
