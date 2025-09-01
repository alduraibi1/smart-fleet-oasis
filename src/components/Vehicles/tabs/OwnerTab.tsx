import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, User, Building } from "lucide-react";
import { Vehicle } from "@/types/vehicle";

interface OwnerTabProps {
  vehicle: Vehicle;
}

export default function OwnerTab({ vehicle }: OwnerTabProps) {
  // Mock owner data - in real app, fetch from vehicle.owner_id
  const mockOwner = {
    id: vehicle.owner_id || "owner-1",
    full_name: "أحمد محمد السيد",
    national_id: "1234567890123",
    phone: "+966501234567",
    email: "ahmed.mohammed@email.com",
    address: "الرياض، حي الملك فهد، شارع الأمير سلطان",
    vehicle_count: 3,
    status: "active"
  };

  if (!vehicle.owner_id) {
    return (
      <Card className="dashboard-card">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            لم يتم تحديد مالك للمركبة
          </p>
          <p className="text-sm text-muted-foreground text-center">
            يرجى تحديد مالك للمركبة من خلال تحرير بيانات المركبة
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Owner Basic Info */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            معلومات المالك
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  الاسم الكامل
                </label>
                <p className="text-lg font-semibold">{mockOwner.full_name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  رقم الهوية الوطنية
                </label>
                <p className="font-medium">{mockOwner.national_id}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  الحالة
                </label>
                <div className="mt-1">
                  <Badge 
                    variant={mockOwner.status === "active" ? "default" : "secondary"}
                    className="text-sm"
                  >
                    {mockOwner.status === "active" ? "نشط" : "غير نشط"}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    رقم الهاتف
                  </label>
                  <p className="font-medium">{mockOwner.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    البريد الإلكتروني
                  </label>
                  <p className="font-medium">{mockOwner.email}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-1" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    العنوان
                  </label>
                  <p className="font-medium">{mockOwner.address}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Owner Statistics */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            إحصائيات المالك
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-background/50 rounded-lg border">
              <div className="text-2xl font-bold text-primary">
                {mockOwner.vehicle_count}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                إجمالي المركبات
              </div>
            </div>
            
            <div className="text-center p-4 bg-background/50 rounded-lg border">
              <div className="text-2xl font-bold text-green-600">
                2
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                عقود نشطة
              </div>
            </div>
            
            <div className="text-center p-4 bg-background/50 rounded-lg border">
              <div className="text-2xl font-bold text-orange-600">
                1
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                عقود منتهية
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}