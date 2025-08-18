
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { AuthProvider } from '@/hooks/useAuth';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Customers from './pages/Customers';
import Owners from './pages/Owners';
import Vehicles from './pages/Vehicles';
import Contracts from './pages/Contracts';
import Accounting from './pages/Accounting';
import Reports from './pages/Reports';
import AdvancedReports from './pages/AdvancedReports';
import SystemManagement from './pages/SystemManagement';
import EnhancedSystemManagement from './pages/EnhancedSystemManagement';
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
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/owners" element={<Owners />} />
                <Route path="/vehicles" element={<Vehicles />} />
                <Route path="/contracts" element={<Contracts />} />
                <Route path="/accounting" element={<Accounting />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/advanced-reports" element={<AdvancedReports />} />
                <Route path="/system-management" element={<SystemManagement />} />
                <Route path="/enhanced-system-management" element={<EnhancedSystemManagement />} />
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
