
import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Loader2 } from "lucide-react";

// Lazy load components
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Vehicles = lazy(() => import("./pages/Vehicles"));
const Customers = lazy(() => import("./pages/EnhancedCustomers"));
const Contracts = lazy(() => import("./pages/ContractsMain"));
const Maintenance = lazy(() => import("./pages/Maintenance"));
const Reports = lazy(() => import("./pages/EnhancedReports"));
const Accounting = lazy(() => import("./pages/Accounting"));
const FinancialControl = lazy(() => import("./pages/FinancialControl"));
const Inventory = lazy(() => import("./pages/Inventory"));
const Suppliers = lazy(() => import("./pages/Suppliers"));
const HR = lazy(() => import("./pages/EnhancedHR"));
const Owners = lazy(() => import("./pages/Owners"));
const SystemManagement = lazy(() => import("./pages/SystemManagement"));
const NotificationSettings = lazy(() => import("./pages/NotificationSettings"));
const EnhancedDashboard = lazy(() => import("./pages/EnhancedDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

const LoadingSpinner = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

export function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<Auth />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          } />
          
          <Route path="/enhanced-dashboard" element={
            <ProtectedRoute>
              <EnhancedDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/vehicles" element={
            <ProtectedRoute>
              <Vehicles />
            </ProtectedRoute>
          } />
          
          <Route path="/customers" element={
            <ProtectedRoute>
              <Customers />
            </ProtectedRoute>
          } />
          
          <Route path="/contracts" element={
            <ProtectedRoute>
              <Contracts />
            </ProtectedRoute>
          } />
          
          <Route path="/maintenance" element={
            <ProtectedRoute>
              <Maintenance />
            </ProtectedRoute>
          } />
          
          <Route path="/reports" element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } />
          
          <Route path="/accounting" element={
            <ProtectedRoute>
              <Accounting />
            </ProtectedRoute>
          } />
          
          <Route path="/financial-control" element={
            <ProtectedRoute>
              <FinancialControl />
            </ProtectedRoute>
          } />
          
          <Route path="/inventory" element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          } />
          
          <Route path="/suppliers" element={
            <ProtectedRoute>
              <Suppliers />
            </ProtectedRoute>
          } />
          
          <Route path="/hr" element={
            <ProtectedRoute>
              <HR />
            </ProtectedRoute>
          } />
          
          <Route path="/owners" element={
            <ProtectedRoute>
              <Owners />
            </ProtectedRoute>
          } />
          
          <Route path="/system-management" element={
            <ProtectedRoute requiredRole="admin">
              <SystemManagement />
            </ProtectedRoute>
          } />
          
          <Route path="/notification-settings" element={
            <ProtectedRoute>
              <NotificationSettings />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
