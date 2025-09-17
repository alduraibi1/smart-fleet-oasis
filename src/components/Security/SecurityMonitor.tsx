import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Eye, 
  Clock, 
  MapPin, 
  Smartphone, 
  RefreshCw 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SecurityEvent {
  id: string;
  action_type: string;
  ip_address: string | null;
  user_agent: string | null;
  success: boolean;
  failure_reason: string | null;
  created_at: string;
  additional_data: Record<string, any>;
}

interface FailedLoginAttempt {
  id: string;
  ip_address: string | null;
  email: string | null;
  attempt_time: string;
  blocked_until: string | null;
}

export function SecurityMonitor() {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [failedAttempts, setFailedAttempts] = useState<FailedLoginAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const { hasPermission } = useAuth();
  const { toast } = useToast();

  const loadSecurityData = async () => {
    if (!await hasPermission('security:read')) {
      return;
    }

    setLoading(true);
    try {
      // Load recent security events
      const { data: events, error: eventsError } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (eventsError) throw eventsError;
      setSecurityEvents((events || []) as SecurityEvent[]);

      // Load recent failed login attempts
      const { data: attempts, error: attemptsError } = await supabase
        .from('failed_login_attempts')
        .select('*')
        .order('attempt_time', { ascending: false })
        .limit(10);

      if (attemptsError) throw attemptsError;
      setFailedAttempts((attempts || []) as FailedLoginAttempt[]);

    } catch (error: any) {
      console.error('Failed to load security data:', error);
      toast({
        title: "خطأ في تحميل بيانات الأمان",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityData();
    
    // Set up real-time subscriptions for security events
    const eventsSubscription = supabase
      .channel('security_events')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'security_audit_log' },
        () => {
          loadSecurityData();
        }
      )
      .subscribe();

    const attemptsSubscription = supabase
      .channel('failed_attempts')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'failed_login_attempts' },
        () => {
          loadSecurityData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(eventsSubscription);
      supabase.removeChannel(attemptsSubscription);
    };
  }, []);

  const getEventTypeLabel = (actionType: string): string => {
    const labels: Record<string, string> = {
      'user_signin': 'تسجيل دخول',
      'user_signup': 'تسجيل جديد',
      'failed_login_attempt': 'محاولة دخول فاشلة',
      'password_change': 'تغيير كلمة مرور',
      'unauthorized_access': 'وصول غير مصرح',
      'data_access': 'الوصول للبيانات',
      'admin_action': 'إجراء إداري'
    };
    return labels[actionType] || actionType;
  };

  const getEventVariant = (event: SecurityEvent) => {
    if (!event.success) return 'destructive';
    if (event.action_type === 'user_signin') return 'default';
    if (event.action_type === 'admin_action') return 'secondary';
    return 'outline';
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `منذ ${diffInDays} يوم`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">جاري تحميل بيانات الأمان...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الأحداث الأمنية اليوم</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {securityEvents.filter(e => 
                new Date(e.created_at).toDateString() === new Date().toDateString()
              ).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">محاولات الدخول الفاشلة</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {failedAttempts.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حسابات مقفلة</CardTitle>
            <Lock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {failedAttempts.filter(a => a.blocked_until && 
                new Date(a.blocked_until) > new Date()
              ).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                الأحداث الأمنية الحديثة
              </CardTitle>
              <CardDescription>
                عرض آخر الأنشطة الأمنية في النظام
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadSecurityData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              تحديث
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            {securityEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد أحداث أمنية حديثة
              </div>
            ) : (
              <div className="space-y-4">
                {securityEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <Badge variant={getEventVariant(event)}>
                      {getEventTypeLabel(event.action_type)}
                    </Badge>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-3 w-3" />
                        <span className="font-mono text-xs">{event.ip_address || 'غير معروف'}</span>
                        <Clock className="h-3 w-3 ml-2" />
                        <span>{formatTimeAgo(event.created_at)}</span>
                      </div>
                      {event.user_agent && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Smartphone className="h-3 w-3" />
                          <span className="truncate max-w-md">
                            {event.user_agent}
                          </span>
                        </div>
                      )}
                      {!event.success && event.failure_reason && (
                        <Alert className="mt-2">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            {event.failure_reason}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Failed Login Attempts */}
      {failedAttempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              محاولات الدخول الفاشلة الحديثة
            </CardTitle>
            <CardDescription>
              مراقبة محاولات الدخول المشبوهة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {failedAttempts.map((attempt) => (
                  <div key={attempt.id} className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <span>{attempt.email || 'غير محدد'}</span>
                        {attempt.blocked_until && new Date(attempt.blocked_until) > new Date() && (
                          <Badge variant="destructive" className="text-xs">مقفل</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="font-mono">{attempt.ip_address || 'غير معروف'}</span>
                        <Clock className="h-3 w-3 ml-2" />
                        <span>{formatTimeAgo(attempt.attempt_time)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}