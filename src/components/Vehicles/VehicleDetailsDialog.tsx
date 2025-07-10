import { useState } from 'react';
import { Car, User, FileText, Image as ImageIcon, Calendar, Settings, MapPin, Fuel, Gauge, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Vehicle } from '@/types/vehicle';

interface VehicleDetailsDialogProps {
  vehicle: Vehicle;
  trigger: React.ReactNode;
}

export default function VehicleDetailsDialog({ vehicle, trigger }: VehicleDetailsDialogProps) {
  const [open, setOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      available: { label: 'متاحة', variant: 'default' as const },
      rented: { label: 'مؤجرة', variant: 'secondary' as const },
      maintenance: { label: 'صيانة', variant: 'destructive' as const },
      out_of_service: { label: 'خارج الخدمة', variant: 'outline' as const }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.available;
  };

  const getFuelTypeLabel = (type: string) => {
    const types = {
      gasoline: 'بنزين',
      diesel: 'ديزل',
      hybrid: 'هجين',
      electric: 'كهربائي'
    };
    return types[type as keyof typeof types] || type;
  };

  const getTransmissionLabel = (type: string) => {
    const types = {
      manual: 'يدوي',
      automatic: 'أوتوماتيك'
    };
    return types[type as keyof typeof types] || type;
  };

  const getDocumentTypeLabel = (type: string) => {
    const types = {
      license: 'رخصة القيادة',
      insurance: 'تأمين',
      inspection: 'فحص دوري',
      registration: 'تسجيل',
      other: 'أخرى'
    };
    return types[type as keyof typeof types] || type;
  };

  const statusBadge = getStatusBadge(vehicle.status);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            تفاصيل المركبة - {vehicle.plateNumber}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details">التفاصيل</TabsTrigger>
            <TabsTrigger value="owner">المالك</TabsTrigger>
            <TabsTrigger value="documents">المستندات</TabsTrigger>
            <TabsTrigger value="images">الصور</TabsTrigger>
            <TabsTrigger value="history">السجل</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    معلومات المركبة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">رقم اللوحة:</span>
                    <span className="font-medium">{vehicle.plateNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">العلامة التجارية:</span>
                    <span className="font-medium">{vehicle.brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الموديل:</span>
                    <span className="font-medium">{vehicle.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">سنة الصنع:</span>
                    <span className="font-medium">{vehicle.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">اللون:</span>
                    <span className="font-medium">{vehicle.color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الحالة:</span>
                    <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    المواصفات التقنية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">رقم المحرك:</span>
                    <span className="font-medium">{vehicle.engineNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">رقم الشاسيه:</span>
                    <span className="font-medium">{vehicle.chassisNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">نوع الوقود:</span>
                    <div className="flex items-center gap-1">
                      <Fuel className="h-4 w-4" />
                      <span className="font-medium">{getFuelTypeLabel(vehicle.fuelType)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ناقل الحركة:</span>
                    <span className="font-medium">{getTransmissionLabel(vehicle.transmission)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">عدد المقاعد:</span>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{vehicle.seatingCapacity}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">الكيلومترات:</span>
                    <div className="flex items-center gap-1">
                      <Gauge className="h-4 w-4" />
                      <span className="font-medium">{vehicle.mileage.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">معلومات التأجير</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">₪{vehicle.dailyRate}</p>
                    <p className="text-sm text-muted-foreground">السعر اليومي</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success">متاحة</p>
                    <p className="text-sm text-muted-foreground">الحالة الحالية</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-muted-foreground">0</p>
                    <p className="text-sm text-muted-foreground">عدد الإيجارات</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {vehicle.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ملاحظات</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{vehicle.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="owner" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  معلومات المالك
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">الاسم الكامل</Label>
                    <p className="font-medium">{vehicle.owner.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">رقم الهوية</Label>
                    <p className="font-medium">{vehicle.owner.nationalId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">رقم الهاتف</Label>
                    <p className="font-medium">{vehicle.owner.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">البريد الإلكتروني</Label>
                    <p className="font-medium">{vehicle.owner.email}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    العنوان
                  </Label>
                  <p className="font-medium">{vehicle.owner.address}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            {vehicle.documents && vehicle.documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicle.documents.map((doc) => (
                  <Card key={doc.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium">{doc.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {getDocumentTypeLabel(doc.type)}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            رفع في: {new Date(doc.uploadDate).toLocaleDateString('ar')}
                          </p>
                          {doc.expiryDate && (
                            <p className="text-sm text-muted-foreground">
                              ينتهي في: {new Date(doc.expiryDate).toLocaleDateString('ar')}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">لا توجد مستندات مرفوعة</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="images" className="space-y-4">
            {vehicle.images && vehicle.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {vehicle.images.map((image) => (
                  <Card key={image.id} className="overflow-hidden">
                    <img
                      src={image.url}
                      alt="Vehicle"
                      className="w-full h-32 object-cover"
                    />
                    <CardContent className="p-2">
                      <p className="text-xs text-muted-foreground text-center">
                        {new Date(image.uploadDate).toLocaleDateString('ar')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">لا توجد صور مرفوعة</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  سجل العمليات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div>
                      <p className="font-medium">تم إنشاء المركبة</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(vehicle.createdAt).toLocaleDateString('ar')}
                      </p>
                    </div>
                  </div>
                  {/* يمكن إضافة المزيد من سجل العمليات هنا */}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}