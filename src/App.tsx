
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Vehicles from "./pages/Vehicles";
import Contracts from "./pages/Contracts";
import Customers from "./pages/Customers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/vehicles" element={<Vehicles />} />
          {/* Placeholder routes for future modules */}
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/maintenance" element={<div className="p-8 text-center">صفحة الصيانة قيد التطوير</div>} />
          <Route path="/inventory" element={<div className="p-8 text-center">صفحة المخزون قيد التطوير</div>} />
          <Route path="/accounting" element={<div className="p-8 text-center">النظام المحاسبي قيد التطوير</div>} />
          <Route path="/hr" element={<div className="p-8 text-center">الموارد البشرية قيد التطوير</div>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
