import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Customer } from "@/types";
import { Phone, Mail, Calendar, FileText, Star, Edit, IdCard, MapPin } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface CustomerDetailsDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (customer: Customer) => void;
}

export const CustomerDetailsDialog = ({ customer, open, onOpenChange, onEdit }: CustomerDetailsDialogProps) => {
  if (!customer) return null;

  const getDocumentStatus = () => {
    const licenseExpiry = new Date(customer.licenseExpiry);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((licenseExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: 'expired', text: 'منتهية الصلاحية', color: 'destructive' };
    if (daysUntilExpiry <= 30) return { status: 'expiring', text: 'تنتهي قريباً', color: 'secondary' };
    return { status: 'valid', text: 'صالحة', color: 'default' };
  };

  const documentStatus = getDocumentStatus();
  const isActive = customer.totalRentals > 0;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Sample rental history data
  const rentalHistory = [
    {
      id: "1",
      vehiclePlate: "أ ب ج 123",
      vehicleModel: "تويوتا كامري 2023",
      startDate: new Date(2024, 0, 15),
      endDate: new Date(2024, 0, 20),
      amount: 500,
      status: "completed"
    },
    {
      id: "2", 
      vehiclePlate: "د هـ و 456",
      vehicleModel: "هونداي إلنترا 2022",
      startDate: new Date(2024, 1, 10),
      endDate: new Date(2024, 1, 15),
      amount: 750,
      status: "completed"
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>تفاصيل العميل</DialogTitle>
            <Button
              onClick={() => onEdit(customer)}
              variant="outline"
              size="sm"
            >
              <Edit className="h-4 w-4 ml-2" />
              تعديل
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer.name}`} />
                  <AvatarFallback className="text-lg">
                    {customer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{customer.name}</h2>
                    <Badge variant={isActive ? "default" : "secondary"}>
                      {isActive ? "نشط" : "غير نشط"}
                    </Badge>
                    <Badge variant={documentStatus.color as any}>
                      {documentStatus.text}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    {renderStars(customer.rating)}
                    <span className="text-sm text-muted-foreground">({customer.rating} من 5)</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span dir="ltr">{customer.phone}</span>
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{customer.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.totalRentals} إيجار سابق</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Information Tabs */}
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info">المعلومات الشخصية</TabsTrigger>
              <TabsTrigger value="documents">المستندات</TabsTrigger>
              <TabsTrigger value="history">تاريخ الإيجارات</TabsTrigger>
              <TabsTrigger value="notes">الملاحظات</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IdCard className="h-5 w-5" />
                      معلومات الهوية
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">رقم الهوية</p>
                      <p className="font-medium">{customer.nationalId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">رقم رخصة القيادة</p>
                      <p className="font-medium">{customer.licenseNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">تاريخ انتهاء الرخصة</p>
                      <p className="font-medium">
                        {format(new Date(customer.licenseExpiry), 'dd/MM/yyyy', { locale: ar })}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      معلومات الاتصال
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                      <p className="font-medium" dir="ltr">{customer.phone}</p>
                    </div>
                    {customer.email && (
                      <div>
                        <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                        <p className="font-medium">{customer.email}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">العنوان</p>
                      <p className="font-medium">{customer.address || "غير محدد"}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>صورة الهوية</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                      <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">لم يتم رفع المستند</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>صورة رخصة القيادة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                      <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">لم يتم رفع المستند</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>تاريخ الإيجارات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rentalHistory.map((rental) => (
                      <div key={rental.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{rental.vehicleModel}</h4>
                            <p className="text-sm text-muted-foreground">لوحة: {rental.vehiclePlate}</p>
                          </div>
                          <Badge variant="secondary">مكتمل</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">تاريخ البداية</p>
                            <p>{format(rental.startDate, 'dd/MM/yyyy', { locale: ar })}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">تاريخ النهاية</p>
                            <p>{format(rental.endDate, 'dd/MM/yyyy', { locale: ar })}</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground">المبلغ الإجمالي</p>
                          <p className="font-medium">{rental.amount} ريال</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>ملاحظات العميل</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">لا توجد ملاحظات مسجلة لهذا العميل.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};