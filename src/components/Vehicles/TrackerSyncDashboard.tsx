
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCcw,
  TrendingUp,
  MapPin,
  Settings
} from "lucide-react";
import { useTrackerSync } from "@/hooks/useTrackerSync";
import { useToast } from "@/hooks/use-toast";

interface SyncStats {
  totalDevices: number;
  connectedDevices: number;
  lastSyncTime: string;
  syncSuccess: boolean;
  matchRate: number;
  suggestionsCount: number;
}

interface DeviceStatus {
  deviceId: string;
  plate: string;
  status: 'connected' | 'disconnected' | 'unknown';
  lastSeen: string;
  location?: { lat: number; lng: number; address?: string };
}

const TrackerSyncDashboard: React.FC = () => {
  const [syncStats, setSyncStats] = useState<SyncStats>({
    totalDevices: 0,
    connectedDevices: 0,
    lastSyncTime: 'لم يتم المزامنة بعد',
    syncSuccess: false,
    matchRate: 0,
    suggestionsCount: 0
  });
  
  const [deviceStatuses, setDeviceStatuses] = useState<DeviceStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<any>(null);
  
  const { syncAuto } = useTrackerSync();
  const { toast } = useToast();

  // محاكاة بيانات الأجهزة (في التطبيق الحقيقي، ستأتي من API)
  const mockDeviceStatuses: DeviceStatus[] = [
    {
      deviceId: 'TK001',
      plate: 'أ ب ج 1234',
      status: 'connected',
      lastSeen: '2025-01-24 10:30:00',
      location: { lat: 24.7136, lng: 46.6753, address: 'الرياض' }
    },
    {
      deviceId: 'TK002', 
      plate: 'د ه و 5678',
      status: 'connected',
      lastSeen: '2025-01-24 10:25:00',
      location: { lat: 24.7136, lng: 46.6753, address: 'جدة' }
    },
    {
      deviceId: 'TK003',
      plate: 'ز ح ط 9012',
      status: 'disconnected',
      lastSeen: '2025-01-23 15:45:00'
    }
  ];

  useEffect(() => {
    // تحميل البيانات الأولية
    loadSyncStats();
    setDeviceStatuses(mockDeviceStatuses);
  }, []);

  const loadSyncStats = async () => {
    // في التطبيق الحقيقي، ستأتي هذه البيانات من API
    setSyncStats({
      totalDevices: 15,
      connectedDevices: 12,
      lastSyncTime: new Date().toLocaleString('ar-SA'),
      syncSuccess: true,
      matchRate: 85,
      suggestionsCount: 3
    });
  };

  const handleQuickSync = async () => {
    setIsLoading(true);
    try {
      const result = await syncAuto(false);
      setLastSyncResult(result);
      
      if (result.success) {
        setSyncStats(prev => ({
          ...prev,
          lastSyncTime: new Date().toLocaleString('ar-SA'),
          syncSuccess: true,
          matchRate: Math.round((result.summary?.matched || 0) / (result.summary?.discoveredDevices?.length || 1) * 100),
          suggestionsCount: result.summary?.unmatchedSuggestions?.length || 0
        }));
        
        toast({
          title: "تمت المزامنة بنجاح",
          description: `تم مطابقة ${result.summary?.matched} مركبة وتحديث ${result.summary?.updatedVehicles} موقع`,
          variant: "default"
        });
      } else {
        toast({
          title: "فشلت المزامنة",
          description: result.error || "حدث خطأ أثناء المزامنة",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Quick sync error:', error);
      toast({
        title: "خطأ في المزامنة",
        description: "تعذر الاتصال بخدمة التتبع",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: DeviceStatus['status']) => {
    switch (status) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-600" />;
      case 'disconnected':
        return <WifiOff className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: DeviceStatus['status']) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-100 text-green-800">متصل</Badge>;
      case 'disconnected':
        return <Badge variant="destructive">منقطع</Badge>;
      default:
        return <Badge variant="secondary">غير معروف</Badge>;
    }
  };

  const connectedDevices = deviceStatuses.filter(d => d.status === 'connected').length;
  const connectionRate = deviceStatuses.length > 0 ? Math.round((connectedDevices / deviceStatuses.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">لوحة تحكم أجهزة التتبع</h3>
          <p className="text-sm text-muted-foreground">
            مراقبة وإدارة حالة أجهزة التتبع والمزامنة
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleQuickSync}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            مزامنة سريعة
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي الأجهزة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{syncStats.totalDevices}</div>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              الأجهزة المتصلة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600">{connectedDevices}</div>
              <Wifi className="h-4 w-4 text-green-600" />
            </div>
            <Progress value={connectionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {connectionRate}% معدل الاتصال
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              معدل المطابقة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{syncStats.matchRate}%</div>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </div>
            <Progress value={syncStats.matchRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              آخر مزامنة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm">{syncStats.lastSyncTime}</div>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2">
              {syncStats.syncSuccess ? (
                <Badge variant="default" className="bg-green-100 text-green-800 gap-1">
                  <CheckCircle className="h-3 w-3" />
                  نجحت
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  فشلت
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device Status List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            حالة الأجهزة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {deviceStatuses.map((device, index) => (
              <div key={device.deviceId}>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(device.status)}
                    <div>
                      <div className="font-medium">{device.plate}</div>
                      <div className="text-sm text-muted-foreground">
                        {device.deviceId} • آخر ظهور: {device.lastSeen}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {device.location && (
                      <Badge variant="outline" className="gap-1">
                        <MapPin className="h-3 w-3" />
                        {device.location.address}
                      </Badge>
                    )}
                    {getStatusBadge(device.status)}
                  </div>
                </div>
                {index < deviceStatuses.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
          
          {deviceStatuses.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <WifiOff className="h-8 w-8 mx-auto mb-2" />
              <p>لا توجد أجهزة متاحة</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Summary */}
      {lastSyncResult?.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              ملخص آخر مزامنة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-green-600">
                  {lastSyncResult.summary.matched}
                </div>
                <div className="text-xs text-muted-foreground">مطابقات دقيقة</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-600">
                  {lastSyncResult.summary.updatedVehicles}
                </div>
                <div className="text-xs text-muted-foreground">مركبات محدثة</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-orange-600">
                  {lastSyncResult.summary.unmatchedSuggestions?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">اقتراحات</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-600">
                  {lastSyncResult.summary.skipped}
                </div>
                <div className="text-xs text-muted-foreground">تم تخطيها</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TrackerSyncDashboard;
