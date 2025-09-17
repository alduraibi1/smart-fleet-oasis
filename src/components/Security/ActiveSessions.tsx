import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  MapPin, 
  Clock, 
  Wifi, 
  WifiOff, 
  Search, 
  Trash2,
  Shield,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  ip_address: string | null;
  user_agent: string | null;
  device_info: any;
  location_info: any;
  is_active: boolean;
  last_activity: string;
  expires_at: string;
  created_at: string;
  user_profile?: {
    full_name: string;
    email: string;
  };
}

export function ActiveSessions() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sessionToTerminate, setSessionToTerminate] = useState<UserSession | null>(null);
  const { hasRole, user } = useAuth();
  const { toast } = useToast();

  // Check permissions
  if (!hasRole('admin')) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">غير مخوّل</h3>
            <p className="text-sm text-muted-foreground">
              تحتاج صلاحيات مدير لعرض الجلسات النشطة
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select(`
          *,
          user_profile:profiles!user_sessions_user_id_fkey(full_name, email)
        `)
        .order('last_activity', { ascending: false });

      if (error) throw error;
      setSessions((data || []) as any);
    } catch (error: any) {
      toast({
        title: "خطأ في تحميل الجلسات",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    
    // Set up real-time subscriptions
    const subscription = supabase
      .channel('user_sessions')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_sessions' },
        () => {
          fetchSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const terminateSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ 
          is_active: false,
          expires_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "تم إنهاء الجلسة",
        description: "تم إنهاء الجلسة بنجاح",
      });

      fetchSessions();
      setSessionToTerminate(null);
    } catch (error: any) {
      toast({
        title: "خطأ في إنهاء الجلسة",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      session.user_profile?.full_name?.toLowerCase().includes(searchLower) ||
      session.user_profile?.email?.toLowerCase().includes(searchLower) ||
      session.ip_address?.toLowerCase().includes(searchLower) ||
      session.user_agent?.toLowerCase().includes(searchLower)
    );
  });

  const getDeviceIcon = (userAgent: string | null) => {
    if (!userAgent) return <Monitor className="h-4 w-4" />;
    
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="h-4 w-4" />;
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return <Tablet className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const getDeviceInfo = (userAgent: string | null) => {
    if (!userAgent) return 'جهاز غير معروف';
    
    const ua = userAgent.toLowerCase();
    
    // Extract browser
    let browser = 'متصفح غير معروف';
    if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari')) browser = 'Safari';
    else if (ua.includes('edge')) browser = 'Edge';
    
    // Extract OS
    let os = 'نظام غير معروف';
    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('mac')) os = 'macOS';
    else if (ua.includes('linux')) os = 'Linux';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('ios')) os = 'iOS';
    
    return `${browser} على ${os}`;
  };

  const getSessionStatus = (session: UserSession) => {
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    const lastActivity = new Date(session.last_activity);
    const minutesSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60));
    
    if (!session.is_active || expiresAt < now) {
      return { status: 'expired', label: 'منتهية الصلاحية', variant: 'outline' as const };
    }
    
    if (minutesSinceActivity > 30) {
      return { status: 'idle', label: 'خاملة', variant: 'secondary' as const };
    }
    
    return { status: 'active', label: 'نشطة', variant: 'default' as const };
  };

  const activeSessions = sessions.filter(s => s.is_active && new Date(s.expires_at) > new Date()).length;
  const expiredSessions = sessions.filter(s => !s.is_active || new Date(s.expires_at) <= new Date()).length;
  const idleSessions = sessions.filter(s => {
    const minutesSinceActivity = Math.floor((new Date().getTime() - new Date(s.last_activity).getTime()) / (1000 * 60));
    return s.is_active && minutesSinceActivity > 30;
  }).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">الجلسات النشطة</p>
                <p className="text-3xl font-bold text-green-600">{activeSessions}</p>
              </div>
              <Wifi className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">الجلسات الخاملة</p>
                <p className="text-3xl font-bold text-orange-500">{idleSessions}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">الجلسات المنتهية</p>
                <p className="text-3xl font-bold text-muted-foreground">{expiredSessions}</p>
              </div>
              <WifiOff className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الجلسات</p>
                <p className="text-3xl font-bold">{sessions.length}</p>
              </div>
              <Globe className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                الجلسات النشطة
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                مراقبة جلسات المستخدمين النشطة في النظام
              </p>
            </div>
            <Button onClick={fetchSessions} disabled={loading} size="sm" variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              تحديث القائمة
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في الجلسات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="text-sm text-muted-foreground">
            عرض {filteredSessions.length} من أصل {sessions.length} جلسة
          </div>

          {/* Sessions Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المستخدم</TableHead>
                  <TableHead>الجهاز</TableHead>
                  <TableHead>الموقع</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>آخر نشاط</TableHead>
                  <TableHead>انتهاء الصلاحية</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                      <p>جاري تحميل الجلسات...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">لا توجد جلسات مطابقة للبحث</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSessions.map((session) => {
                    const sessionStatus = getSessionStatus(session);
                    
                    return (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {session.user_profile?.full_name || 'مستخدم غير معروف'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {session.user_profile?.email}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(session.user_agent)}
                            <div className="space-y-1">
                              <div className="text-sm">{getDeviceInfo(session.user_agent)}</div>
                              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                {session.ip_address || 'غير معروف'}
                              </code>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {session.location_info?.country || 'غير محدد'}
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant={sessionStatus.variant}>
                            {sessionStatus.label}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm">
                            {formatDistanceToNow(new Date(session.last_activity), { 
                              addSuffix: true, 
                              locale: ar 
                            })}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm">
                            {new Date(session.expires_at).toLocaleDateString('ar-SA')}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          {session.is_active && new Date(session.expires_at) > new Date() && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSessionToTerminate(session)}
                              disabled={session.user_id === user?.id}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Terminate Session Dialog */}
      <AlertDialog open={!!sessionToTerminate} onOpenChange={() => setSessionToTerminate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>إنهاء الجلسة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من رغبتك في إنهاء جلسة المستخدم{' '}
              <strong>{sessionToTerminate?.user_profile?.full_name}</strong>؟
              سيتم قطع الاتصال فوراً وسيحتاج المستخدم لتسجيل الدخول مرة أخرى.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => sessionToTerminate && terminateSession(sessionToTerminate.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              إنهاء الجلسة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}