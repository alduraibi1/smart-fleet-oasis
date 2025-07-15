import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSmartNotifications = () => {
  const { toast } = useToast();

  // جلب الإشعارات الذكية للمستخدم الحالي
  const { data: notifications, refetch } = useQuery({
    queryKey: ['smart-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('smart_notifications')
        .select('*')
        .or('user_id.is.null,user_id.eq.' + (await supabase.auth.getUser()).data.user?.id)
        .eq('status', 'unread')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000, // تحديث كل 30 ثانية
  });

  // الاستماع للإشعارات الجديدة في الوقت الفعلي
  useEffect(() => {
    const channel = supabase
      .channel('smart-notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'smart_notifications'
        },
        (payload) => {
          console.log('New notification:', payload);
          
          const notification = payload.new;
          
          // إظهار الإشعار للمستخدم
          toast({
            title: notification.title,
            description: notification.message,
            duration: 5000,
          });

          // تحديث قائمة الإشعارات
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast, refetch]);

  // وضع علامة مقروءة على الإشعار
  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('smart_notifications')
      .update({ status: 'read' })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
    } else {
      refetch();
    }
  };

  // إنشاء إشعار ذكي جديد
  const createNotification = async (
    title: string,
    message: string,
    type: string = 'info',
    category: string = 'system',
    priority: string = 'medium',
    userId?: string
  ) => {
    try {
      const { data, error } = await supabase.rpc('create_smart_notification', {
        p_title: title,
        p_message: message,
        p_type: type,
        p_category: category,
        p_priority: priority,
        p_user_id: userId,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  return {
    notifications,
    markAsRead,
    createNotification,
    refetch
  };
};