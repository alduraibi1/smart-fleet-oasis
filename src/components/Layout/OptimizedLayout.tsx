import { memo, lazy, Suspense } from 'react';
import { ErrorBoundary } from '@/components/UI/ErrorStates/ErrorBoundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Lazy load components for better performance
const LazySystemManagement = lazy(() => import('@/components/SystemManagement/SystemSettings'));
const LazyUserManagement = lazy(() => import('@/components/SystemManagement/UserManagement'));
const LazyActivityLogs = lazy(() => import('@/components/SystemManagement/ActivityLogs'));

interface OptimizedSectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const OptimizedSection = memo(({ children, fallback }: OptimizedSectionProps) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={fallback || <LoadingSpinner />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
});

OptimizedSection.displayName = 'OptimizedSection';

// Memoized card wrapper for better performance
interface OptimizedCardProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const OptimizedCard = memo(({ title, children, icon }: OptimizedCardProps) => {
  return (
    <div className="dashboard-card animate-scale-in">
      <div className="flex items-center gap-2 p-4 border-b border-border/50">
        {icon}
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
});

OptimizedCard.displayName = 'OptimizedCard';