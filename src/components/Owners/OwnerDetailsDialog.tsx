import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Calendar, 
  Car,
  Activity,
  Building2,
  FileText
} from "lucide-react";
import { Owner } from "@/hooks/useOwners";

interface OwnerDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  owner: Owner | null;
}

export const OwnerDetailsDialog = ({ open, onOpenChange, owner }: OwnerDetailsDialogProps) => {
  if (!owner) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            {owner.owner_type === 'individual' ? (
              <>
                <User className="h-5 w-5" />
                تفاصيل المالك
              </>
            ) : (
              <>
                <Building2 className="h-5 w-5" />
                تفاصيل المؤسسة
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Owner Type Badge */}
          <div className="flex items-center gap-2">
            <Badge variant={owner.owner_type === 'individual' ? 'default' : 'secondary'} className="text-sm">
              {owner.owner_type === 'individual' ? (
                <>
                  <User className="h-3 w-3 mr-1" />
                  فرد
                </>
              ) : (
                <>
                  <Building2 className="h-3 w-3 mr-1" />
                  مؤسسة
                </>
              )}
            </Badge>
            <Badge variant={owner.is_active ? "default" : "secondary"}>
              {owner.is_active ? "نشط" : "غير نشط"}
            </Badge>
          </div>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">المعلومات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  {owner.owner_type === 'individual' ? (
                    <User className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {owner.owner_type === 'individual' ? 'اسم المالك' : 'اسم المؤسسة'}
                    </p>
                    <p className="font-medium">{owner.name}</p>
                  </div>
                </div>

                {owner.owner_type === 'individual' && owner.national_id && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">رقم الهوية</p>
                      <p className="font-medium">{owner.national_id}</p>
                    </div>
                  </div>
                )}

                {owner.owner_type === 'company' && owner.commercial_registration && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">السجل التجاري</p>
                      <p className="font-medium">{owner.commercial_registration}</p>
                    </div>
                  </div>
                )}

                {owner.owner_type === 'company' && owner.tax_number && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">الرقم الضريبي</p>
                      <p className="font-medium">{owner.tax_number}</p>
                    </div>
                  </div>
                )}

                {owner.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                      <p className="font-medium">{owner.phone}</p>
                    </div>
                  </div>
                )}

                {owner.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                      <p className="font-medium">{owner.email}</p>
                    </div>
                  </div>
                )}
              </div>

              {owner.address && (
                <div className="flex items-start gap-2 pt-2 border-t">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">العنوان</p>
                    <p className="font-medium">{owner.address}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                الإحصائيات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Car className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold text-blue-600">
                    {owner.vehicle_count || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">عدد المركبات</p>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-sm font-medium text-green-600">
                    {formatDate(owner.created_at)}
                  </p>
                  <p className="text-sm text-muted-foreground">تاريخ التسجيل</p>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-sm font-medium text-purple-600">
                    {formatDate(owner.updated_at)}
                  </p>
                  <p className="text-sm text-muted-foreground">آخر تحديث</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          {owner.vehicle_count && owner.vehicle_count > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  المركبات ({owner.vehicle_count})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {owner.owner_type === 'individual' 
                    ? `لديه ${owner.vehicle_count} مركبة مسجلة في النظام`
                    : `لدى المؤسسة ${owner.vehicle_count} مركبة مسجلة في النظام`
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
