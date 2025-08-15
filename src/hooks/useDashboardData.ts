
import { useDashboardStats } from './dashboard/useDashboardStats';
import { useRevenueData } from './dashboard/useRevenueData';
import { useTopVehicles } from './dashboard/useTopVehicles';
import { useRecentActivity } from './dashboard/useRecentActivity';

export const useDashboardData = () => {
  const { stats, loading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const { revenueData, loading: revenueLoading, refetch: refetchRevenue } = useRevenueData();
  const { topVehicles, loading: vehiclesLoading, refetch: refetchVehicles } = useTopVehicles();
  const { recentActivity, loading: activityLoading, refetch: refetchActivity } = useRecentActivity();

  const loading = statsLoading || revenueLoading || vehiclesLoading || activityLoading;

  const refetch = () => {
    refetchStats();
    refetchRevenue();
    refetchVehicles();
    refetchActivity();
  };

  return {
    stats,
    revenueData,
    topVehicles,
    recentActivity,
    loading,
    refetch,
  };
};
