
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Vehicles from "./pages/Vehicles";
import Customers from "./pages/Customers";
import CustomersNew from "./pages/CustomersNew";
import CustomersV2 from "./pages/CustomersV2";
import Contracts from "./pages/Contracts";
import ContractsSimple from "./pages/ContractsSimple";
import ContractsOptimized from "./pages/ContractsOptimized";
import ContractsEssential from "./pages/ContractsEssential";
import Maintenance from "./pages/Maintenance";
import Accounting from "./pages/Accounting";
import FinancialControl from "./pages/FinancialControl";
import Reports from "./pages/Reports";
import Owners from "./pages/Owners";
import Suppliers from "./pages/Suppliers";
import Inventory from "./pages/Inventory";
import HR from "./pages/HR";
import SystemManagement from "./pages/SystemManagement";
import EnhancedSystemManagement from "./pages/EnhancedSystemManagement";
import SystemOptimization from "./pages/SystemOptimization";
import NotificationSettings from "./pages/NotificationSettings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ButtonTest from "./pages/ButtonTest";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/vehicles" element={<Vehicles />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/customers-new" element={<CustomersNew />} />
                <Route path="/customers-v2" element={<CustomersV2 />} />
                <Route path="/contracts" element={<Contracts />} />
                <Route path="/contracts-simple" element={<ContractsSimple />} />
                <Route path="/contracts-optimized" element={<ContractsOptimized />} />
                <Route path="/contracts-essential" element={<ContractsEssential />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/accounting" element={<Accounting />} />
                <Route path="/financial-control" element={<FinancialControl />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/owners" element={<Owners />} />
                <Route path="/suppliers" element={<Suppliers />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/hr" element={<HR />} />
                <Route path="/system-management" element={<SystemManagement />} />
                <Route path="/enhanced-system-management" element={<EnhancedSystemManagement />} />
                <Route path="/system-optimization" element={<SystemOptimization />} />
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
}

export default App;
