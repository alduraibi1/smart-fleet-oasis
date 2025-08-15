
import { Toaster } from "@/components/ui/toaster";
import { Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Vehicles from "./pages/Vehicles";
import Customers from "./pages/Customers";
import CustomersV2 from "./pages/CustomersV2";
import EnhancedCustomers from "./pages/EnhancedCustomers";
import Contracts from "./pages/Contracts";
import ContractsSimple from "./pages/ContractsSimple";
import ContractsOptimized from "./pages/ContractsOptimized";
import ContractsEssential from "./pages/ContractsEssential";
import ContractsMain from "./pages/ContractsMain";
import EnhancedContracts from "./pages/EnhancedContracts";
import Maintenance from "./pages/Maintenance";
import Reports from "./pages/Reports";
import EnhancedReports from "./pages/EnhancedReports";
import Accounting from "./pages/Accounting";
import FinancialControl from "./pages/FinancialControl";
import Inventory from "./pages/Inventory";
import Suppliers from "./pages/Suppliers";
import HR from "./pages/HR";
import EnhancedHR from "./pages/EnhancedHR";
import Owners from "./pages/Owners";
import SystemManagement from "./pages/SystemManagement";
import NotificationSettings from "./pages/NotificationSettings";
import EnhancedDashboard from "./pages/EnhancedDashboard";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ButtonTest from "./pages/ButtonTest";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/enhanced-dashboard" element={<EnhancedDashboard />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers-v2" element={<CustomersV2 />} />
              <Route path="/enhanced-customers" element={<EnhancedCustomers />} />
              <Route path="/contracts" element={<ContractsMain />} />
              <Route path="/contracts-simple" element={<ContractsSimple />} />
              <Route path="/contracts-optimized" element={<ContractsOptimized />} />
              <Route path="/contracts-essential" element={<ContractsEssential />} />
              <Route path="/contracts-enhanced" element={<EnhancedContracts />} />
              <Route path="/contracts-legacy" element={<Contracts />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/enhanced-reports" element={<EnhancedReports />} />
              <Route path="/accounting" element={<Accounting />} />
              <Route path="/financial-control" element={<FinancialControl />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/hr" element={<HR />} />
              <Route path="/enhanced-hr" element={<EnhancedHR />} />
              <Route path="/owners" element={<Owners />} />
              <Route path="/system-management" element={<SystemManagement />} />
              <Route path="/notification-settings" element={<NotificationSettings />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/button-test" element={<ButtonTest />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
