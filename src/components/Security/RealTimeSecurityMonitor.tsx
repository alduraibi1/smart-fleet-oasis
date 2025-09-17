import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  AlertTriangle, 
  Shield, 
  Zap,
  Globe,
  Clock,
  MapPin,
  Smartphone,
  PlayCircle,
  PauseCircle,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface RealTimeEvent {
  id: string;
  timestamp: string;
  type: 'security' | 'threat' | 'warning' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  source: string;
  location?: string;
  user_agent?: string;
  ip_address?: string;
}

interface LiveMetrics {
  connectionsPerSecond: number;
  threatsDetected: number;
  systemLoad: number;
  responseTime: number;
}

export function RealTimeSecurityMonitor() {
  const [events, setEvents] = useState<RealTimeEvent[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>({
    connectionsPerSecond: 0,
    threatsDetected: 0,
    systemLoad: 0,
    responseTime: 0
  });
  
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const eventsRef = useRef<RealTimeEvent[]>([]);
  const audioRef = useRef<HTMLAudioElement>();

  // Check authorization
  if (!hasRole('admin') && !hasRole('manager')) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">غير مخوّل</h3>
            <p className="text-sm text-muted-foreground">
              تحتاج صلاحيات مدير أو مشرف لعرض المراقبة المباشرة
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Initialize audio for alerts
  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
    audioRef.current.volume = 0.5;
  }, []);

  // Simulate real-time events
  const generateRandomEvent = (): RealTimeEvent => {
    const types: RealTimeEvent['type'][] = ['security', 'threat', 'warning', 'info'];
    const severities: RealTimeEvent['severity'][] = ['low', 'medium', 'high', 'critical'];
    
    const eventTemplates = [
      {
        type: 'threat' as const,
        severity: 'high' as const,
        title: 'محاولة اختراق مكتشفة',
        description: 'محاولة دخول غير مصرح من عنوان IP مشبوه',
        source: 'IDS System'
      },
      {
        type: 'security' as const,
        severity: 'medium' as const,
        title: 'نشاط غير عادي',
        description: 'عدد كبير من الطلبات من مستخدم واحد',
        source: 'Traffic Analyzer'
      },
      {
        type: 'warning' as const,
        severity: 'low' as const,
        title: 'تسجيل دخول جديد',
        description: 'تسجيل دخول من موقع جديد',
        source: 'Auth System'
      },
      {
        type: 'info' as const,
        severity: 'low' as const,
        title: 'تحديث أمني',
        description: 'تم تطبيق تحديث أمني جديد',
        source: 'Security Manager'
      }
    ];

    const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      ...template,
      location: `${Math.floor(Math.random() * 50) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };
  };

  // Start real-time monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      // Generate random events occasionally
      if (Math.random() < 0.3) { // 30% chance
        const newEvent = generateRandomEvent();
        
        setEvents(prev => {
          const updated = [newEvent, ...prev].slice(0, 50); // Keep last 50 events
          eventsRef.current = updated;
          return updated;
        });

        // Play sound for high severity events
        if (soundEnabled && (newEvent.severity === 'high' || newEvent.severity === 'critical')) {
          audioRef.current?.play().catch(() => {
            // Ignore audio play errors
          });
        }

        // Show toast for critical events
        if (newEvent.severity === 'critical') {
          toast({
            title: "تنبيه أمني عاجل",
            description: newEvent.title,
            variant: "destructive",
          });
        }
      }

      // Update live metrics
      setLiveMetrics(prev => ({
        connectionsPerSecond: Math.floor(Math.random() * 100) + 50,
        threatsDetected: prev.threatsDetected + (Math.random() < 0.1 ? 1 : 0),
        systemLoad: Math.floor(Math.random() * 30) + 60,
        responseTime: Math.floor(Math.random() * 50) + 100
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isMonitoring, soundEnabled, toast]);

  const getEventIcon = (type: RealTimeEvent['type']) => {
    switch (type) {
      case 'threat': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'security': return <Shield className="h-4 w-4 text-orange-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: RealTimeEvent['severity']) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50 dark:bg-red-950';
      case 'high': return 'border-orange-500 bg-orange-50 dark:bg-orange-950';
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950';
      default: return 'border-blue-500 bg-blue-50 dark:bg-blue-950';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Live Metrics Dashboard */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">الاتصالات/ثانية</p>
                <p className="text-2xl font-bold">{liveMetrics.connectionsPerSecond}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">التهديدات المكتشفة</p>
                <p className="text-2xl font-bold text-red-600">{liveMetrics.threatsDetected}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">حمل النظام</p>
                <p className="text-2xl font-bold">{liveMetrics.systemLoad}%</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">زمن الاستجابة</p>
                <p className="text-2xl font-bold">{liveMetrics.responseTime}ms</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Events Monitor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              مراقبة الأحداث المباشرة
              {isMonitoring && (
                <Badge variant="outline" className="bg-green-50 text-green-600 animate-pulse">
                  مباشر
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
              >
                {isMonitoring ? (
                  <>
                    <PauseCircle className="h-4 w-4 mr-2" />
                    إيقاف
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    تشغيل
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            {events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {isMonitoring ? (
                  <div className="space-y-2">
                    <Activity className="h-8 w-8 mx-auto animate-pulse" />
                    <p>في انتظار الأحداث المباشرة...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <PauseCircle className="h-8 w-8 mx-auto" />
                    <p>المراقبة موقفة</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <Alert key={event.id} className={getSeverityColor(event.severity)}>
                    <div className="flex items-start gap-3">
                      {getEventIcon(event.type)}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <AlertDescription className="font-medium">
                            {event.title}
                          </AlertDescription>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTime(event.timestamp)}
                          </div>
                        </div>
                        <AlertDescription className="text-sm">
                          {event.description}
                        </AlertDescription>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <span>المصدر: {event.source}</span>
                          </div>
                          {event.ip_address && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="font-mono">{event.ip_address}</span>
                            </div>
                          )}
                          {event.user_agent && (
                            <div className="flex items-center gap-1">
                              <Smartphone className="h-3 w-3" />
                              <span className="truncate max-w-xs">{event.user_agent}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {event.severity}
                      </Badge>
                    </div>
                  </Alert>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* System Status */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>حالة الأنظمة الفرعية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>نظام اكتشاف التسلل</span>
                <Badge variant="outline" className="bg-green-50 text-green-600">
                  متصل
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>جدار الحماية</span>
                <Badge variant="outline" className="bg-green-50 text-green-600">
                  نشط
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>مراقب الشبكة</span>
                <Badge variant="outline" className="bg-green-50 text-green-600">
                  يعمل
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>محلل البيانات</span>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-600">
                  تحديث
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>إحصائيات الجلسة الحالية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>مدة المراقبة</span>
                <span className="font-mono">
                  {Math.floor(events.length / 10)}:{(events.length % 10 * 6).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>إجمالي الأحداث</span>
                <span>{events.length}</span>
              </div>
              <div className="flex justify-between">
                <span>الأحداث عالية الخطورة</span>
                <span className="text-red-600">
                  {events.filter(e => e.severity === 'high' || e.severity === 'critical').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>آخر حدث</span>
                <span className="text-xs">
                  {events.length > 0 ? formatTime(events[0].timestamp) : '--:--:--'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}