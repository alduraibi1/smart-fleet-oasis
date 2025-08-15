
import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Loader2 } from "lucide-react";
import { protectedRoutes } from "@/config/rbac";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

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
          {protectedRoutes.map(({ path, element: Element, requiredRole, requiredPermission }) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute 
                  requiredRole={requiredRole} 
                  requiredPermission={requiredPermission}
                >
                  <Element />
                </ProtectedRoute>
              }
            />
          ))}
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
