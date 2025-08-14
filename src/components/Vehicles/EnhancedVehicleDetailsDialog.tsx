
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Car, Calendar, MapPin, Wrench, FileText, 
  AlertCircle, CheckCircle, Clock, DollarSign 
} from 'lucide-react';
import { Vehicle } from '@/types/vehicles';

interface EnhancedVehicleDetailsDialogProps {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EnhancedVehicleDetailsDialog = ({ 
  vehicle, 
  open, 
  onOpenChange 
}: EnhancedVehicleDetailsDialogProps) => {
  const [activeContracts, setActiveContracts] = useState<any[]>([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vehicle && open) {
      fetchVehicleData();
    }
  }, [vehicle, open]);

  const fetchVehicleData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      setActiveContracts([
        {
          id: '1',
          contract_number: 'C001',
          customer_name: 'أحمد محمد',
          start_date: '2024-01-01',
          end_date: '2024-06-01',
          status: 'active',
          daily_rate: 150
        }
      ]);

      setMaintenanceHistory([
        {
          id: '1',
          maintenance_type: 'تغيير زيت',
          scheduled_date: '2024-01-15',
          status: 'completed',
          cost: 200
        }
      ]);
    } catch (error) {
      console.error('Error fetching vehicle data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!vehicle) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'rented':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_of_service':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4" />;
      case 'rented':
        return <Clock className="h-4 w-4" />;
      case 'maintenance':
        return <Wrench className="h-4 w-4" />;
      case 'out_of_service':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Car className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            تفاصيل المركبة - {vehicle.brand} {vehicle.model}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Vehicle Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>المعلومات الأساسية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">رقم اللوحة</label>
                  <p className="font-semibold">{vehicle.plate_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">الماركة</label>
                  <p className="font-semibold">{vehicle.brand}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">الموديل</label>
                  <p className="font-semibold">{vehicle.model}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">السنة</label>
                  <p className="font-semibold">{vehicle.year}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">اللون</label>
                  <p className="font-semibold">{vehicle.color}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">السعر اليومي</label>
                  <p className="font-semibold">{vehicle.daily_rate} ر.س</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">الكيلومترات</label>
                  <p className="font-semibold">{vehicle.mileage?.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">الحالة</label>
                  <Badge className={getStatusColor(vehicle.status)}>
                    {getStatusIcon(vehicle.status)}
                    <span className="mr-1">
                      {vehicle.status === 'available' && 'متاحة'}
                      {vehicle.status === 'rented' && 'مؤجرة'}
                      {vehicle.status === 'maintenance' && 'صيانة'}
                      {vehicle.status === 'out_of_service' && 'خارج الخدمة'}
                    </span>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for detailed information */}
          <Tabs defaultValue="contracts" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="contracts">العقود النشطة</TabsTrigger>
              <TabsTrigger value="maintenance">سجل الصيانة</TabsTrigger>
              <TabsTrigger value="documents">الوثائق</TabsTrigger>
              <TabsTrigger value="financial">البيانات المالية</TabsTrigger>
            </TabsList>

            <TabsContent value="contracts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>العقود النشطة</CardTitle>
                </CardHeader>
                <CardContent>
                  {activeContracts.length > 0 ? (
                    <div className="space-y-3">
                      {activeContracts.map((contract) => (
                        <div key={contract.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{contract.contract_number}</h4>
                              <p className="text-sm text-muted-foreground">
                                العميل: {contract.customer_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                من {contract.start_date} إلى {contract.end_date}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant="secondary">{contract.status}</Badge>
                              <p className="text-sm font-semibold">
                                {contract.daily_rate} ر.س/يوم
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      لا توجد عقود نشطة حالياً
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>سجل الصيانة</CardTitle>
                </CardHeader>
                <CardContent>
                  {maintenanceHistory.length > 0 ? (
                    <div className="space-y-3">
                      {maintenanceHistory.map((maintenance) => (
                        <div key={maintenance.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{maintenance.maintenance_type}</h4>
                              <p className="text-sm text-muted-foreground">
                                التاريخ: {maintenance.scheduled_date}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant="secondary">{maintenance.status}</Badge>
                              <p className="text-sm font-semibold">
                                {maintenance.cost} ر.س
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      لا يوجد سجل صيانة
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>الوثائق والمستندات</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-8">
                    سيتم تطوير إدارة الوثائق قريباً
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>البيانات المالية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
                      <p className="text-xl font-bold">0 ر.س</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-sm text-muted-foreground">أيام التأجير</p>
                      <p className="text-xl font-bold">0</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Wrench className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                      <p className="text-sm text-muted-foreground">تكلفة الصيانة</p>
                      <p className="text-xl font-bold">0 ر.س</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-sm text-muted-foreground">صافي الربح</p>
                      <p className="text-xl font-bold">0 ر.س</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
