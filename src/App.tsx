
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/theme/ThemeProvider';
import { Toaster } from './components/ui/sonner';
import Index from './pages/Index';
import CustomersPage from './pages/Customers';
import VehiclesPage from './pages/Vehicles';
import ContractsPage from './pages/Contracts';
import MaintenancePage from './pages/Maintenance';
import AccountingPage from './pages/Accounting';
import ReportsPage from './pages/Reports';
import OwnersPage from './pages/Owners';
import HRPage from './pages/HR';
import SuppliersPage from './pages/Suppliers';
import InventoryPage from './pages/Inventory';
import SystemManagementPage from './pages/SystemManagement';
import NotificationSettingsPage from './pages/NotificationSettings';
import CustomersNew from './pages/CustomersNew';
import SystemOptimizationPage from './pages/SystemOptimization';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="car-rental-theme">
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers-new" element={<CustomersNew />} />
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/contracts" element={<ContractsPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/accounting" element={<AccountingPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/owners" element={<OwnersPage />} />
            <Route path="/hr" element={<HRPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/system" element={<SystemManagementPage />} />
            <Route path="/notification-settings" element={<NotificationSettingsPage />} />
            <Route path="/system-optimization" element={<SystemOptimizationPage />} />
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
