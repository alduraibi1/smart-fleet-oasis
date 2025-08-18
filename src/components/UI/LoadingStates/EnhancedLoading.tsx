
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface EnhancedLoadingProps {
  variant?: 'card' | 'table' | 'grid' | 'minimal';
  count?: number;
  className?: string;
}

export function EnhancedLoading({ variant = 'minimal', count = 1, className }: EnhancedLoadingProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className="dashboard-card space-y-3">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-4/6" />
            </div>
          </div>
        );

      case 'table':
        return (
          <div className="space-y-2">
            <div className="flex space-x-4 items-center p-3 bg-muted/30 rounded-lg">
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/6" />
            </div>
          </div>
        );

      case 'grid':
        return (
          <div className="adaptive-grid">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="dashboard-card space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex justify-between">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <Skeleton className="h-4 w-32" />
          </div>
        );
    }
  };

  return (
    <div className={cn("animate-pulse", className)}>
      {Array.from({ length: variant === 'grid' ? 1 : count }).map((_, i) => (
        <div key={i}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
}

// Specialized loading components
export function StatsLoading() {
  return (
    <div className="stats-grid">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="metric-card">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-6 rounded" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableLoading({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex space-x-4 items-center p-3 bg-muted/20 rounded-lg">
        <Skeleton className="h-4 w-1/6" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/6" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/6" />
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4 items-center p-3 border rounded-lg">
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/6" />
        </div>
      ))}
    </div>
  );
}

export function DashboardLoading() {
  return (
    <div className="content-spacing">
      <div className="space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        {/* Stats */}
        <StatsLoading />
        
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <EnhancedLoading variant="card" count={3} />
          </div>
          <div className="space-y-4">
            <EnhancedLoading variant="card" count={2} />
          </div>
        </div>
      </div>
    </div>
  );
}
