
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';

// Import pages
import Index from '@/pages/Index';
import Vehicles from '@/pages/Vehicles';
import Customers from '@/pages/Customers';
import CustomersNew from '@/pages/CustomersNew';
import Contracts from '@/pages/Contracts';
import Maintenance from '@/pages/Maintenance';
import Accounting from '@/pages/Accounting';
import Reports from '@/pages/Reports';
import Owners from '@/pages/Owners';
import HR from '@/pages/HR';
import Suppliers from '@/pages/Suppliers';
import Inventory from '@/pages/Inventory';
import SystemManagement from '@/pages/SystemManagement';
import NotFound from '@/pages/NotFound';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/vehicles" element={<Vehicles />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/customers-new" element={<CustomersNew />} />
                <Route path="/contracts" element={<Contracts />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/accounting" element={<Accounting />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/owners" element={<Owners />} />
                <Route path="/hr" element={<HR />} />
                <Route path="/suppliers" element={<Suppliers />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/system" element={<SystemManagement />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Toaster />
            <SonnerToaster />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
