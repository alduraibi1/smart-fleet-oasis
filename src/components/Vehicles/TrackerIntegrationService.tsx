
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Route, 
  Clock, 
  Fuel, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VehicleLocation {
  vehicleId: string;
  latitude: number;
  longitude: number;
  address: string;
  timestamp: string;
  speed: number;
  heading: number;
}

interface TripData {
  tripId: string;
  vehicleId: string;
  startTime: string;
  endTime?: string;
  startLocation: string;
  endLocation?: string;
  distance: number;
  duration: number;
  maxSpeed: number;
  avgSpeed: number;
  fuelConsumption?: number;
}

interface VehicleUsageStats {
  vehicleId: string;
  dailyDistance: number;
  weeklyDistance: number;
  monthlyDistance: number;
  utilizationRate: number;
  idleTime: number;
  activeTime: number;
  maintenanceDue: boolean;
  lastServiceDate: string;
}

const TrackerIntegrationService: React.FC = () => {
  const [activeLocations, setActiveLocations] = useState<VehicleLocation[]>([]);
  const [recentTrips, setRecentTrips] = useState<TripData[]>([]);
  const [usageStats, setUsageStats] = useState<VehicleUsageStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // محاكاة البيانات المباشرة
  useEffect(() => {
    loadMockData();
    const interval = setInterval(updateRealTimeData, 30000); // تحديث كل 30 ثانية
    return () => clearInterval(interval);
  }, []);

  const loadMockData = () => {
    const mockLocations: VehicleLocation[] = [
      {
        vehicleId: '1',
        latitude: 24.7136,
        longitude: 46.6753,
        address: 'الرياض - حي الملك فهد',
        timestamp: new Date().toISOString(),
        speed: 45,
        heading: 90
      },
      {
        vehicleId: '2',
        latitude: 24.6877,
        longitude: 46.7219,
        address: 'الرياض - حي العليا',
        timestamp: new Date().toISOString(),
        speed: 0,
        heading: 0
      }
    ];

    const mockTrips: TripData[] = [
      {
        tripId: 'T001',
        vehicleId: '1',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        startLocation: 'الرياض - المطار',
        endLocation: 'الرياض - الملك فهد',
        distance: 35.5,
        duration: 90,
        maxSpeed: 80,
        avgSpeed: 23.7,
        fuelConsumption: 4.2
      }
    ];

    const mockStats: VehicleUsageStats[] = [
      {
        vehicleId: '1',
        dailyDistance: 245.6,
        weeklyDistance: 1234.5,
        monthlyDistance: 4567.8,
        utilizationRate: 78,
        idleTime: 120,
        activeTime: 480,
        maintenanceDue: false,
        lastServiceDate: '2025-01-15'
      }
    ];

    setActiveLocations(mockLocations);
    setRecentTrips(mockTrips);
    setUsageStats(mockStats);
  };

  const updateRealTimeData = () => {
    // محاكاة تحديث البيانات المباشرة
    setActiveLocations(prev => prev.map(location => ({
      ...location,
      timestamp: new Date().toISOString(),
      speed: Math.random() * 60,
      latitude: location.latitude + (Math.random() - 0.5) * 0.001,
      longitude: location.longitude + (Math.random() - 0.5) * 0.001
    })));
  };

  const generateUsageReport = async () => {
    setIsLoading(true);
    try {
      // محاكاة إنشاء تقرير
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "تم إنشاء تقرير الاستخدام",
        description: "تم إنشاء تقرير مفصل عن استخدام المركبات وحفظه في النظام",
        variant: "default"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSpeedStatus = (speed: number) => {
    if (speed === 0) return { color: 'bg-gray-500', label: 'متوقف' };
    if (speed < 30) return { color: 'bg-green-500', label: 'بطيء' };
    if (speed < 60) return { color: 'bg-yellow-500', label: 'متوسط' };
    return { color: 'bg-red-500', label: 'سريع' };
  };

  return (
    <div className="space-y-6">
      {/* العنوان والأزرار */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">تكامل التتبع المتقدم</h3>
          <p className="text-sm text-muted-foreground">
            مراقبة مباشرة وتحليل متقدم لاستخدام المركبات
          </p>
        </div>
        <Button 
          onClick={generateUsageReport} 
          disabled={isLoading}
          className="gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          {isLoading ? 'جاري الإنشاء...' : 'إنشاء تقرير شامل'}
        </Button>
      </div>

      {/* الإحصائيات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">المركبات النشطة</p>
                <p className="text-2xl font-bold">{activeLocations.filter(l => l.speed > 0).length}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي المسافة اليوم</p>
                <p className="text-2xl font-bold">{usageStats.reduce((sum, stat) => sum + stat.dailyDistance, 0).toFixed(1)} كم</p>
              </div>
              <Route className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">متوسط الاستخدام</p>
                <p className="text-2xl font-bold">{Math.round(usageStats.reduce((sum, stat) => sum + stat.utilizationRate, 0) / usageStats.length)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">تحتاج صيانة</p>
                <p className="text-2xl font-bold">{usageStats.filter(s => s.maintenanceDue).length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* المواقع المباشرة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            المواقع المباشرة للمركبات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeLocations.map((location) => {
              const speedStatus = getSpeedStatus(location.speed);
              return (
                <div key={location.vehicleId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${speedStatus.color}`}></div>
                    <div>
                      <div className="font-medium">مركبة {location.vehicleId}</div>
                      <div className="text-sm text-muted-foreground">{location.address}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{location.speed.toFixed(0)} كم/س</Badge>
                    <Badge variant="secondary">{speedStatus.label}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(location.timestamp).toLocaleTimeString('ar-SA')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* إحصائيات الاستخدام التفصيلية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            تحليل الاستخدام التفصيلي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {usageStats.map((stat) => (
              <div key={stat.vehicleId} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">مركبة {stat.vehicleId}</h4>
                  <div className="flex items-center gap-2">
                    {stat.maintenanceDue ? (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        صيانة مطلوبة
                      </Badge>
                    ) : (
                      <Badge variant="default" className="gap-1 bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3" />
                        سليمة
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">المسافة اليومية</p>
                    <p className="font-semibold">{stat.dailyDistance.toFixed(1)} كم</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">المسافة الأسبوعية</p>
                    <p className="font-semibold">{stat.weeklyDistance.toFixed(1)} كم</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">الوقت النشط</p>
                    <p className="font-semibold">{Math.round(stat.activeTime / 60)} ساعة</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">آخر صيانة</p>
                    <p className="font-semibold">{new Date(stat.lastServiceDate).toLocaleDateString('ar-SA')}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">معدل الاستخدام</span>
                    <span className="text-sm font-medium">{stat.utilizationRate}%</span>
                  </div>
                  <Progress value={stat.utilizationRate} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* الرحلات الأخيرة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            الرحلات الأخيرة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTrips.map((trip) => (
              <div key={trip.tripId} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">رحلة {trip.tripId} - مركبة {trip.vehicleId}</div>
                  <Badge variant="outline">{trip.distance.toFixed(1)} كم</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    من: {trip.startLocation}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    إلى: {trip.endLocation}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    المدة: {Math.round(trip.duration)} دقيقة
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span>متوسط السرعة: {trip.avgSpeed.toFixed(1)} كم/س</span>
                  <span>أقصى سرعة: {trip.maxSpeed} كم/س</span>
                  {trip.fuelConsumption && (
                    <span className="flex items-center gap-1">
                      <Fuel className="h-3 w-3" />
                      استهلاك الوقود: {trip.fuelConsumption.toFixed(1)}ل
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackerIntegrationService;
