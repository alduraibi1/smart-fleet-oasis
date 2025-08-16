
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Customer } from "@/types";
import { 
  Edit, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Star,
  User,
  CreditCard,
  FileText,
  Trash2,
  Ban,
  Shield
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface CustomerDetailsDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
}

export const CustomerDetailsDialog = ({ 
  customer, 
  open, 
  onOpenChange, 
  onEdit,
  onDelete 
}: CustomerDetailsDialogProps) => {
  if (!customer) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'غير محدد';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: ar });
    } catch {
      return 'غير محدد';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              تفاصيل العميل
            </DialogTitle>
            <div className="flex gap-2">
              <Button onClick={() => onEdit(customer)} size="sm">
                <Edit className="h-4 w-4 ml-2" />
                تعديل
              </Button>
              {onDelete && (
                <Button 
                  onClick={() => onDelete(customer)} 
                  size="sm" 
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4 ml-2" />
                  حذف
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* معلومات أساسية */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-xl font-medium">
                  {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold">{customer.name}</h3>
                <p className="text-muted-foreground">رقم الهوية: {customer.nationalId || customer.national_id}</p>
                <div className="flex items-center gap-2 mt-2">
                  {customer.is_active ? (
                    <Badge variant="default">نشط</Badge>
                  ) : (
                    <Badge variant="secondary">غير نشط</Badge>
                  )}
                  {customer.blacklisted && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Ban className="h-3 w-3" />
                      قائمة سوداء
                    </Badge>
                  )}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < (customer.rating || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-muted-foreground ml-1">
                      ({customer.rating || 0})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">شخصية</TabsTrigger>
              <TabsTrigger value="contact">اتصال</TabsTrigger>
              <TabsTrigger value="financial">مالية</TabsTrigger>
              <TabsTrigger value="documents">وثائق</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">الجنسية</h4>
                  <p>{customer.nationality || 'غير محدد'}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">الجنس</h4>
                  <p>{customer.gender === 'male' ? 'ذكر' : customer.gender === 'female' ? 'أنثى' : 'غير محدد'}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">تاريخ الميلاد</h4>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(customer.date_of_birth)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">الحالة الاجتماعية</h4>
                  <p>
                    {customer.marital_status === 'single' ? 'أعزب' : 
                     customer.marital_status === 'married' ? 'متزوج' : 
                     customer.marital_status === 'divorced' ? 'مطلق' : 
                     customer.marital_status === 'widowed' ? 'أرمل' : 'غير محدد'}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">رقم الهاتف</h4>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.phone}</span>
                  </div>
                </div>
                {customer.email && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">البريد الإلكتروني</h4>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.email}</span>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">العنوان</h4>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      {customer.address && <p>{customer.address}</p>}
                      {customer.city && <p className="text-sm text-muted-foreground">{customer.city}</p>}
                      {customer.country && <p className="text-sm text-muted-foreground">{customer.country}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">إجمالي الإيجارات</h4>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.totalRentals || customer.total_rentals || 0}</span>
                  </div>
                </div>
                {customer.credit_limit && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">الحد الائتماني</h4>
                    <p>{customer.credit_limit.toLocaleString()} ريال</p>
                  </div>
                )}
                {customer.monthly_income && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">الدخل الشهري</h4>
                    <p>{customer.monthly_income.toLocaleString()} ريال</p>
                  </div>
                )}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">طريقة الدفع المفضلة</h4>
                  <p>
                    {customer.preferred_payment_method === 'cash' ? 'نقداً' :
                     customer.preferred_payment_method === 'card' ? 'بطاقة' :
                     customer.preferred_payment_method === 'bank_transfer' ? 'تحويل بنكي' : 'غير محدد'}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">رقم الرخصة</h4>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.licenseNumber || customer.license_number || 'غير محدد'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">انتهاء الرخصة</h4>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(customer.license_expiry)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">نوع الرخصة</h4>
                  <p>
                    {customer.license_type === 'private' ? 'خاصة' :
                     customer.license_type === 'commercial' ? 'تجارية' :
                     customer.license_type === 'government' ? 'حكومية' : 'غير محدد'}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* القائمة السوداء */}
          {customer.blacklisted && (
            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Ban className="h-4 w-4 text-destructive" />
                <h4 className="font-medium text-destructive">في القائمة السوداء</h4>
              </div>
              {customer.blacklistReason && (
                <p className="text-sm text-muted-foreground mb-2">
                  السبب: {customer.blacklistReason}
                </p>
              )}
              {customer.blacklist_date && (
                <p className="text-sm text-muted-foreground">
                  تاريخ الإضافة: {formatDate(customer.blacklist_date)}
                </p>
              )}
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              تاريخ التسجيل: {formatDate(customer.created_at)}
            </div>
            {customer.updated_at && (
              <div>
                آخر تحديث: {formatDate(customer.updated_at)}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
