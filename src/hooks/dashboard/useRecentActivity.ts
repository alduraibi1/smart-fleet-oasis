
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RecentActivity {
  id: string;
  type: 'contract' | 'payment' | 'maintenance' | 'alert';
  title: string;
  description: string;
  timestamp: Date;
  status: string;
}

export const useRecentActivity = () => {
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentActivity = async () => {
    try {
      const activities: RecentActivity[] = [];

      // Fetch recent contracts
      const { data: recentContracts } = await supabase
        .from('rental_contracts')
        .select('id, contract_number, status, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      recentContracts?.forEach(contract => {
        activities.push({
          id: contract.id,
          type: 'contract',
          title: `عقد جديد ${contract.contract_number}`,
          description: `عقد جديد تم إنشاؤه`,
          timestamp: new Date(contract.created_at),
          status: contract.status,
        });
      });

      // Fetch recent payments
      const { data: recentPayments } = await supabase
        .from('payment_receipts')
        .select('id, receipt_number, amount, status, created_at, customer_name')
        .order('created_at', { ascending: false })
        .limit(3);

      recentPayments?.forEach(payment => {
        activities.push({
          id: payment.id,
          type: 'payment',
          title: `دفعة جديدة ${payment.receipt_number}`,
          description: `دفعة بقيمة ${payment.amount} ريال من ${payment.customer_name}`,
          timestamp: new Date(payment.created_at),
          status: payment.status,
        });
      });

      // Sort by timestamp and take first 6
      const sortedActivities = activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 6);

      setRecentActivity(sortedActivities);

    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchRecentActivity();
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    recentActivity,
    loading,
    refetch: fetchRecentActivity,
  };
};
