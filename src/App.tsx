
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import Index from "./pages/Index";
import Vehicles from "./pages/Vehicles";
import Customers from "./pages/Customers";
import Contracts from "./pages/Contracts";
import ContractsMain from "./pages/ContractsMain";
import ContractsSimple from "./pages/ContractsSimple";
import ContractsOptimized from "./pages/ContractsOptimized";
import ContractsEssential from "./pages/ContractsEssential";
import Owners from "./pages/Owners";
import Maintenance from "./pages/Maintenance";
import Inventory from "./pages/Inventory";
import Suppliers from "./pages/Suppliers";
import Accounting from "./pages/Accounting";
import Reports from "./pages/Reports";
import HR from "./pages/HR";
import SystemCheck from "./pages/SystemCheck";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/contracts" element={<Contracts />} />
            <Route path="/contracts-main" element={<ContractsMain />} />
            <Route path="/contracts-simple" element={<ContractsSimple />} />
            <Route path="/contracts-optimized" element={<ContractsOptimized />} />
            <Route path="/contracts-essential" element={<ContractsEssential />} />
            <Route path="/owners" element={<Owners />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/accounting" element={<Accounting />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/hr" element={<HR />} />
            <Route path="/system-check" element={<SystemCheck />} />
          </Routes>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
