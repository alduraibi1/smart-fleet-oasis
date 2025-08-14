
import { useState } from 'react';
import { Car, CheckCircle, XCircle, AlertTriangle, Clock, Wrench } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Vehicle } from '@/types/vehicles';
import OverviewTab from './tabs/OverviewTab';
import DetailsTab from './tabs/DetailsTab';
import OwnerTab from './tabs/OwnerTab';
import DocumentsTab from './tabs/DocumentsTab';
import MaintenanceTab from './tabs/MaintenanceTab';
import LocationTab from './tabs/LocationTab';
import FinancialTab from './tabs/FinancialTab';
import ImagesTab from './tabs/ImagesTab';

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
            تفاصيل المركبة الشاملة - {vehicle.plate_number}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="details">التفاصيل</TabsTrigger>
            <TabsTrigger value="owner">المالك</TabsTrigger>
            <TabsTrigger value="documents">المستندات</TabsTrigger>
            <TabsTrigger value="maintenance">الصيانة</TabsTrigger>
            <TabsTrigger value="location">الموقع</TabsTrigger>
            <TabsTrigger value="financial">المالية</TabsTrigger>
            <TabsTrigger value="images">الصور</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab 
              vehicle={vehicle} 
              statusBadge={statusBadge} 
              getFuelTypeLabel={getFuelTypeLabel} 
            />
          </TabsContent>

          <TabsContent value="details">
            <DetailsTab 
              vehicle={vehicle} 
              getTransmissionLabel={getTransmissionLabel}
              getMaintenanceStatus={getMaintenanceStatus}
            />
          </TabsContent>

          <TabsContent value="owner">
            <OwnerTab vehicle={vehicle} />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentsTab 
              vehicle={vehicle}
              getDocumentStatus={getDocumentStatus}
              getDocumentTypeLabel={getDocumentTypeLabel}
            />
          </TabsContent>

          <TabsContent value="maintenance">
            <MaintenanceTab 
              vehicle={vehicle}
              getMaintenanceStatus={getMaintenanceStatus}
            />
          </TabsContent>

          <TabsContent value="location">
            <LocationTab vehicle={vehicle} />
          </TabsContent>

          <TabsContent value="financial">
            <FinancialTab vehicle={vehicle} />
          </TabsContent>

          <TabsContent value="images">
            <ImagesTab vehicle={vehicle} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
