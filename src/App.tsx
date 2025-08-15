
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { AuthProvider } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Lazy load components
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Vehicles = lazy(() => import("./pages/Vehicles"));
const Owners = lazy(() => import("./pages/Owners"));
const Customers = lazy(() => import("./pages/Customers"));
const Contracts = lazy(() => import("./pages/Contracts"));
const Maintenance = lazy(() => import("./pages/Maintenance"));
const Reports = lazy(() => import("./pages/Reports"));
const Accounting = lazy(() => import("./pages/Accounting"));
const ProfitabilityReports = lazy(() => import("./pages/ProfitabilityReports"));
const HR = lazy(() => import("./pages/HR"));
const Inventory = lazy(() => import("./pages/Inventory"));
const Suppliers = lazy(() => import("./pages/Suppliers"));
const SystemManagement = lazy(() => import("./pages/SystemManagement"));
const NotificationSettings = lazy(() => import("./pages/NotificationSettings"));
const EnhancedDashboard = lazy(() => import("./pages/EnhancedDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense 
                fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <LoadingSpinner size="lg" />
                  </div>
                }
              >
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/vehicles" element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />
                  <Route path="/owners" element={<ProtectedRoute><Owners /></ProtectedRoute>} />
                  <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
                  <Route path="/contracts" element={<ProtectedRoute><Contracts /></ProtectedRoute>} />
                  <Route path="/maintenance" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />
                  <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                  <Route path="/accounting" element={<ProtectedRoute><Accounting /></ProtectedRoute>} />
                  <Route path="/profitability-reports" element={<ProtectedRoute><ProfitabilityReports /></ProtectedRoute>} />
                  <Route path="/hr" element={<ProtectedRoute><HR /></ProtectedRoute>} />
                  <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
                  <Route path="/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
                  <Route path="/system" element={<ProtectedRoute><SystemManagement /></ProtectedRoute>} />
                  <Route path="/notification-settings" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
                  <Route path="/enhanced-dashboard" element={<ProtectedRoute><EnhancedDashboard /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
