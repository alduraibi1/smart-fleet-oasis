
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VehicleLocation {
  id: string;
  plateNumber: string;
  status: 'available' | 'rented' | 'maintenance';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  lastUpdate: Date;
  customerName?: string;
}

export const LiveVehicleMap: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleLocation[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [mapboxToken, setMapboxToken] = useState("");
  const { toast } = useToast();

  // Mock vehicle data - in real implementation, this would come from GPS tracking
  useEffect(() => {
    const mockVehicles: VehicleLocation[] = [
      {
        id: '1',
        plateNumber: 'أ ب ج 123',
        status: 'rented',
        location: {
          lat: 24.7136,
          lng: 46.6753,
          address: 'الرياض، المملكة العربية السعودية'
        },
        lastUpdate: new Date(),
        customerName: 'أحمد محمد'
      },
      {
        id: '2',
        plateNumber: 'د ه و 456',
        status: 'available',
        location: {
          lat: 24.7336,
          lng: 46.6853,
          address: 'شمال الرياض، المملكة العربية السعودية'
        },
        lastUpdate: new Date(Date.now() - 300000) // 5 minutes ago
      },
      {
        id: '3',
        plateNumber: 'ز ح ط 789',
        status: 'maintenance',
        location: {
          lat: 24.6936,
          lng: 46.6653,
          address: 'ورشة الصيانة، الرياض'
        },
        lastUpdate: new Date(Date.now() - 1800000) // 30 minutes ago
      }
    ];
    setVehicles(mockVehicles);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'rented':
        return 'bg-blue-500';
      case 'maintenance':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'متاحة';
      case 'rented':
        return 'مؤجرة';
      case 'maintenance':
        return 'صيانة';
      default:
        return 'غير محدد';
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.plateNumber.includes(searchQuery) || 
                         vehicle.customerName?.includes(searchQuery) ||
                         vehicle.location.address.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      toast({
        title: "تم حفظ الرمز المميز",
        description: "يمكنك الآن استخدام الخريطة التفاعلية",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Mapbox Token Input */}
      {!mapboxToken && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">إعداد الخريطة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-700 mb-3">
              لاستخدام الخريطة التفاعلية، يرجى إدخال رمز Mapbox الخاص بك. 
              يمكنك الحصول عليه من <a href="https://mapbox.com/" target="_blank" className="underline">موقع Mapbox</a>
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="أدخل رمز Mapbox..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleTokenSubmit}>
                حفظ
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Vehicle List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              المركبات المتتبعة ({filteredVehicles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="البحث..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                >
                  الكل
                </Button>
                <Button
                  variant={statusFilter === 'available' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('available')}
                >
                  متاحة
                </Button>
                <Button
                  variant={statusFilter === 'rented' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('rented')}
                >
                  مؤجرة
                </Button>
                <Button
                  variant={statusFilter === 'maintenance' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('maintenance')}
                >
                  صيانة
                </Button>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedVehicle?.id === vehicle.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedVehicle(vehicle)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{vehicle.plateNumber}</span>
                    <Badge variant="secondary" className={`text-white ${getStatusColor(vehicle.status)}`}>
                      {getStatusText(vehicle.status)}
                    </Badge>
                  </div>
                  
                  {vehicle.customerName && (
                    <p className="text-sm text-muted-foreground mb-1">
                      العميل: {vehicle.customerName}
                    </p>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    {vehicle.location.address}
                  </p>
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    آخر تحديث: {vehicle.lastUpdate.toLocaleTimeString('ar-SA')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Map Area */}
        <div className="lg:col-span-2">
          <Card className="h-96 lg:h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                الخريطة التفاعلية
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full">
              {mapboxToken ? (
                <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      الخريطة التفاعلية (تتطلب تنفيذ Mapbox)
                    </p>
                    {selectedVehicle && (
                      <div className="mt-4 p-3 bg-background rounded-lg border">
                        <p className="font-medium">{selectedVehicle.plateNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedVehicle.location.address}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      يرجى إدخال رمز Mapbox لعرض الخريطة
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
