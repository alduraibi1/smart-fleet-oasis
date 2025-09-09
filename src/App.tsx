import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/useAuth';
import { AppLayout } from '@/components/Layout/AppLayout';
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import { PermissionGuard } from './components/Auth/PermissionGuard';

// Lazy-loaded components for better performance  
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Vehicles = lazy(() => import('@/pages/Vehicles'));
const Customers = lazy(() => import('@/pages/Customers'));
const CustomersV2 = lazy(() => import('@/pages/CustomersV2'));
const Contracts = lazy(() => import('@/pages/Contracts'));
const Maintenance = lazy(() => import('@/pages/Maintenance'));
const Accounting = lazy(() => import('@/pages/Accounting'));
const Reports = lazy(() => import('@/pages/Reports'));
const Owners = lazy(() => import('@/pages/Owners'));
const HR = lazy(() => import('@/pages/HR'));
const Suppliers = lazy(() => import('@/pages/Suppliers'));
const Inventory = lazy(() => import('@/pages/Inventory'));
const SystemManagement = lazy(() => import('@/pages/SystemManagement'));
const Auth = lazy(() => import('@/pages/Auth'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const CustomerArrearsControl = lazy(() => import('@/pages/CustomerArrearsControl'));
const FinancialControl = lazy(() => import('@/pages/FinancialControl'));
const SecurityMonitoring = lazy(() => import('@/pages/SecurityMonitoring'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));
const NotificationSettings = lazy(() => import('@/pages/NotificationSettings'));
const Profile = lazy(() => import('@/pages/Profile'));
const Settings = lazy(() => import('@/pages/Settings'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[200px] animate-fade-in">
    <LoadingSpinner />
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/auth" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Auth />
                  </Suspense>
                } 
              />
              <Route 
                path="/reset-password" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <ResetPassword />
                  </Suspense>
                } 
              />
              
              {/* Protected Routes with AppLayout */}
              <Route 
                path="/*" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Suspense fallback={<LoadingFallback />}>
                        <Routes>
                          <Route index element={<Dashboard />} />
                          
                          {/* Core Management Routes */}
                          <Route path="vehicles" element={<Vehicles />} />
                          <Route path="customers" element={<Customers />} />
                          <Route path="customers-v2" element={<CustomersV2 />} />
                          <Route path="contracts" element={<Contracts />} />
                          <Route path="maintenance" element={<Maintenance />} />
                          <Route path="owners" element={<Owners />} />
                          
                          {/* Financial Routes */}
                          <Route 
                            path="accounting" 
                            element={
                              <PermissionGuard permissions={['accounting.read']}>
                                <Accounting />
                              </PermissionGuard>
                            } 
                          />
                          <Route 
                            path="financial-control" 
                            element={
                              <PermissionGuard permissions={['accounting.read']}>
                                <FinancialControl />
                              </PermissionGuard>
                            } 
                          />
                          <Route 
                            path="customer-arrears-control" 
                            element={
                              <PermissionGuard permissions={['customers.read']}>
                                <CustomerArrearsControl />
                              </PermissionGuard>
                            } 
                          />
                          <Route path="reports" element={<Reports />} />
                          
                          {/* Operations Routes */}
                          <Route path="hr" element={<HR />} />
                          <Route path="suppliers" element={<Suppliers />} />
                          <Route path="inventory" element={<Inventory />} />
                          
                          {/* Administrative Routes */}
                          <Route 
                            path="system-management" 
                            element={
                              <PermissionGuard permissions={['admin.system']}>
                                <SystemManagement />
                              </PermissionGuard>
                            } 
                          />
                          <Route 
                            path="security" 
                            element={
                              <PermissionGuard permissions={['admin.security']}>
                                <SecurityMonitoring />
                              </PermissionGuard>
                            } 
                          />
                          
                          {/* Notification Routes */}
                          <Route path="notifications" element={<NotificationsPage />} />
                          <Route path="notification-settings" element={<NotificationSettings />} />
                          
                          {/* User Routes */}
                          <Route path="profile" element={<Profile />} />
                          <Route path="settings" element={<Settings />} />
                          
                          {/* Fallback */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Router>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;