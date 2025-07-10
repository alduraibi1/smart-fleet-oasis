import { useState } from 'react';
import { 
  Car, User, FileText, Image as ImageIcon, Calendar, Settings, MapPin, 
  Fuel, Gauge, Users, AlertTriangle, Shield, DollarSign, Wrench,
  Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Vehicle } from '@/types/vehicle';

interface EnhancedVehicleDetailsDialogProps {
  vehicle: Vehicle;
  trigger: React.ReactNode;
}

export default function EnhancedVehicleDetailsDialog({ vehicle, trigger }: EnhancedVehicleDetailsDialogProps) {
  const [open, setOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      available: { label: 'متاحة', variant: 'default' as const, icon: CheckCircle },
      rented: { label: 'مؤجرة', variant: 'secondary' as const, icon: Clock },
      maintenance: { label: 'صيانة', variant: 'destructive' as const, icon: Wrench },
      out_of_service: { label: 'خارج الخدمة', variant: 'outline' as const, icon: XCircle }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.available;
  };

  const getDocumentStatus = (status: string) => {
    const statusMap = {
      valid: { label: 'صالح', variant: 'default' as const, icon: CheckCircle },
      expired: { label: 'منتهي الصلاحية', variant: 'destructive' as const, icon: XCircle },
      near_expiry: { label: 'قريب الانتهاء', variant: 'outline' as const, icon: AlertTriangle }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.valid;
  };

  const getMaintenanceStatus = (status: string) => {
    const statusMap = {
      completed: { label: 'مكتملة', variant: 'default' as const },
      scheduled: { label: 'مجدولة', variant: 'secondary' as const },
      in_progress: { label: 'قيد التنفيذ', variant: 'outline' as const },
      overdue: { label: 'متأخرة', variant: 'destructive' as const }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.completed;
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
      
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            تفاصيل المركبة الشاملة - {vehicle.plateNumber}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="details">التفاصيل</TabsTrigger>
            <TabsTrigger value="owner">المالك</TabsTrigger>
            <TabsTrigger value="documents">المستندات</TabsTrigger>
            <TabsTrigger value="maintenance">الصيانة</TabsTrigger>
            <TabsTrigger value="location">الموقع</TabsTrigger>
            <TabsTrigger value="financial">المالية</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Car className="h-5 w-5" />
                      معلومات المركبة الأساسية
                    </span>
                    <Badge variant={statusBadge.variant} className="flex items-center gap-1">
                      <statusBadge.icon className="h-3 w-3" />
                      {statusBadge.label}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">رقم اللوحة</Label>
                      <p className="font-bold text-lg text-primary">{vehicle.plateNumber}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">المركبة</Label>
                      <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">سنة الصنع</Label>
                      <p className="font-medium">{vehicle.year}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">اللون</Label>
                      <p className="font-medium">{vehicle.color}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    معلومات التأجير
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">₪{vehicle.dailyRate}</p>
                      <p className="text-sm text-muted-foreground">السعر اليومي</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Gauge className="h-4 w-4" />
                        <p className="text-2xl font-bold">{vehicle.mileage.toLocaleString()}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">كيلومتر</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Rental Info */}
            {vehicle.currentRental && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    معلومات الإيجار الحالي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-muted-foreground">اسم العميل</Label>
                      <p className="font-medium">{vehicle.currentRental.customerName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">تاريخ البداية</Label>
                      <p className="font-medium">{new Date(vehicle.currentRental.startDate).toLocaleDateString('ar')}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">تاريخ النهاية</Label>
                      <p className="font-medium">{new Date(vehicle.currentRental.endDate).toLocaleDateString('ar')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center">
                <CardContent className="p-4">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{vehicle.documents.length}</p>
                  <p className="text-sm text-muted-foreground">مستند</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{vehicle.images.length}</p>
                  <p className="text-sm text-muted-foreground">صورة</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{vehicle.seatingCapacity}</p>
                  <p className="text-sm text-muted-foreground">مقعد</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <Fuel className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-lg font-bold">{getFuelTypeLabel(vehicle.fuelType)}</p>
                  <p className="text-sm text-muted-foreground">نوع الوقود</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    معلومات المركبة التفصيلية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">رقم VIN:</span>
                      <span className="font-medium">{vehicle.vin}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">رقم المحرك:</span>
                      <span className="font-medium">{vehicle.engineNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">رقم الشاسيه:</span>
                      <span className="font-medium">{vehicle.chassisNumber}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ناقل الحركة:</span>
                      <span className="font-medium">{getTransmissionLabel(vehicle.transmission)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">عدد المقاعد:</span>
                      <span className="font-medium">{vehicle.seatingCapacity}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    حالة الصيانة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">الحالة:</span>
                    <Badge variant={getMaintenanceStatus(vehicle.maintenance.status).variant}>
                      {getMaintenanceStatus(vehicle.maintenance.status).label}
                    </Badge>
                  </div>
                  {vehicle.maintenance.lastMaintenanceDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">آخر صيانة:</span>
                      <span className="font-medium">
                        {new Date(vehicle.maintenance.lastMaintenanceDate).toLocaleDateString('ar')}
                      </span>
                    </div>
                  )}
                  {vehicle.maintenance.nextMaintenanceDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الصيانة القادمة:</span>
                      <span className="font-medium">
                        {new Date(vehicle.maintenance.nextMaintenanceDate).toLocaleDateString('ar')}
                      </span>
                    </div>
                  )}
                  {vehicle.maintenance.notes && (
                    <>
                      <Separator />
                      <div>
                        <span className="text-muted-foreground text-sm">ملاحظات:</span>
                        <p className="text-sm mt-1">{vehicle.maintenance.notes}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Owner Tab */}
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

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            {vehicle.documents && vehicle.documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicle.documents.map((doc) => {
                  const docStatus = getDocumentStatus(doc.status);
                  return (
                    <Card key={doc.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                            <div className="flex-1">
                              <p className="font-medium">{doc.name}</p>
                              <Badge variant="outline" className="text-xs mb-2">
                                {getDocumentTypeLabel(doc.type)}
                              </Badge>
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">
                                  رفع في: {new Date(doc.uploadDate).toLocaleDateString('ar')}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  ينتهي في: {new Date(doc.expiryDate).toLocaleDateString('ar')}
                                </p>
                              </div>
                            </div>
                          </div>
                          <Badge variant={docStatus.variant} className="flex items-center gap-1">
                            <docStatus.icon className="h-3 w-3" />
                            {docStatus.label}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
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

          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  تفاصيل الصيانة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">حالة الصيانة</Label>
                    <Badge variant={getMaintenanceStatus(vehicle.maintenance.status).variant} className="mt-1">
                      {getMaintenanceStatus(vehicle.maintenance.status).label}
                    </Badge>
                  </div>
                  {vehicle.maintenance.lastMaintenanceDate && (
                    <div>
                      <Label className="text-muted-foreground">آخر صيانة</Label>
                      <p className="font-medium">{new Date(vehicle.maintenance.lastMaintenanceDate).toLocaleDateString('ar')}</p>
                    </div>
                  )}
                </div>
                
                {vehicle.maintenance.nextMaintenanceDate && (
                  <div>
                    <Label className="text-muted-foreground">الصيانة القادمة</Label>
                    <p className="font-medium">{new Date(vehicle.maintenance.nextMaintenanceDate).toLocaleDateString('ar')}</p>
                  </div>
                )}

                {vehicle.maintenance.partsUsed && vehicle.maintenance.partsUsed.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">القطع المستخدمة</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {vehicle.maintenance.partsUsed.map((part, index) => (
                        <Badge key={index} variant="secondary">{part}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {vehicle.maintenance.notes && (
                  <div>
                    <Label className="text-muted-foreground">ملاحظات الصيانة</Label>
                    <p className="mt-1 p-3 bg-muted rounded-lg">{vehicle.maintenance.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  معلومات الموقع
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label className="text-muted-foreground">حالة التتبع:</Label>
                  <Badge variant={vehicle.location.isTracked ? 'default' : 'secondary'}>
                    {vehicle.location.isTracked ? 'مفعل' : 'غير مفعل'}
                  </Badge>
                </div>
                
                {vehicle.location.address && (
                  <div>
                    <Label className="text-muted-foreground">العنوان الحالي</Label>
                    <p className="font-medium">{vehicle.location.address}</p>
                  </div>
                )}

                {vehicle.location.latitude && vehicle.location.longitude && (
                  <div>
                    <Label className="text-muted-foreground">الإحداثيات</Label>
                    <p className="font-medium">{vehicle.location.latitude}, {vehicle.location.longitude}</p>
                  </div>
                )}

                {vehicle.location.lastUpdated && (
                  <div>
                    <Label className="text-muted-foreground">آخر تحديث</Label>
                    <p className="font-medium">{new Date(vehicle.location.lastUpdated).toLocaleString('ar')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  المعلومات المالية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">السعر اليومي</Label>
                    <p className="text-2xl font-bold text-primary">₪{vehicle.dailyRate}</p>
                  </div>
                  
                  {vehicle.purchase.purchasePrice && (
                    <div>
                      <Label className="text-muted-foreground">سعر الشراء</Label>
                      <p className="font-medium">₪{vehicle.purchase.purchasePrice.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {vehicle.purchase.purchaseDate && (
                  <div>
                    <Label className="text-muted-foreground">تاريخ الشراء</Label>
                    <p className="font-medium">{new Date(vehicle.purchase.purchaseDate).toLocaleDateString('ar')}</p>
                  </div>
                )}

                {vehicle.purchase.financingCompany && (
                  <div>
                    <Label className="text-muted-foreground">شركة التمويل</Label>
                    <p className="font-medium">{vehicle.purchase.financingCompany}</p>
                  </div>
                )}

                {vehicle.purchase.depreciationInfo && (
                  <div>
                    <Label className="text-muted-foreground">معلومات الاستهلاك</Label>
                    <p className="font-medium">{vehicle.purchase.depreciationInfo}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Images Tab */}
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
                      {image.description && (
                        <p className="text-xs text-center mt-1">{image.description}</p>
                      )}
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
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}