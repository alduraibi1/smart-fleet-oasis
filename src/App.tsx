
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Vehicles from "./pages/Vehicles";
import Contracts from "./pages/Contracts";
import Customers from "./pages/Customers";
import CustomersV2 from "./pages/CustomersV2";
import Accounting from "./pages/Accounting";
import Maintenance from "./pages/Maintenance";
import Inventory from "./pages/Inventory";
import HR from "./pages/HR";
import Reports from "./pages/Reports";
import SystemManagement from "./pages/SystemManagement";
import NotificationSettings from "./pages/NotificationSettings";
import Owners from "./pages/Owners";
import Suppliers from "./pages/Suppliers";
import NotFound from "./pages/NotFound";
import ButtonTestPage from "./pages/ButtonTest";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="rental-ui-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Index />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/contracts" element={<Contracts />} />
              <Route path="/customers" element={<CustomersV2 />} />
              <Route path="/customers-old" element={<Customers />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/accounting" element={<Accounting />} />
              <Route path="/hr" element={<HR />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/system-management" element={<SystemManagement />} />
              <Route path="/notification-settings" element={<NotificationSettings />} />
              <Route path="/owners" element={<Owners />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/button-test" element={<ButtonTestPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
