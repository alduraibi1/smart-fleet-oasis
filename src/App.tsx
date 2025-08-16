import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from './components/theme-provider';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Vehicles from './pages/Vehicles';
import ContractsSimple from './pages/ContractsSimple';
import ContractsOptimized from './pages/ContractsOptimized';
import Contracts from './pages/Contracts';
import ContractsEssential from './pages/ContractsEssential';
import Settings from './pages/Settings';
import { Sidebar } from './components/ui/sidebar';
import { FileContract } from 'lucide-react';
import ContractsAdvanced from './pages/ContractsAdvanced';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />} >
              <Route index element={<Dashboard />} />
              <Route path="customers" element={<Customers />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="contracts-simple" element={<ContractsSimple />} />
              <Route path="contracts-optimized" element={<ContractsOptimized />} />
              <Route path="contracts" element={<Contracts />} />
              <Route path="contracts-essential" element={<ContractsEssential />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="/contracts-advanced" element={<ContractsAdvanced />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
