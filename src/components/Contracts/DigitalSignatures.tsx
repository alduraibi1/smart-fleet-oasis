import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Download, PenTool, CheckCircle, Clock, Shield, User, FileText, Smartphone, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

export function DigitalSignatures() {
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Digital signature data
  const signatureRequests = [
    {
      id: "SIG001",
      contractId: "C001",
      customerName: "أحمد محمد العلي",
      documentType: "عقد الإيجار الشهري",
      status: "pending_customer",
      sentAt: "2024-01-20T10:30:00",
      method: "email",
      expiresAt: "2024-01-27T10:30:00",
      attempts: 1
    },
    {
      id: "SIG002",
      contractId: "C045",
      customerName: "فاطمة سعد الغامدي",
      documentType: "عقد التجديد",
      status: "pending_company",
      sentAt: "2024-01-19T14:15:00",
      method: "sms",
      customerSignedAt: "2024-01-20T09:22:00",
      attempts: 2
    },
    {
      id: "SIG003",
      contractId: "C078",
      customerName: "شركة الخليج للتجارة",
      documentType: "عقد مؤسسي متعدد المركبات",
      status: "completed",
      sentAt: "2024-01-18T11:00:00",
      method: "email",
      customerSignedAt: "2024-01-18T15:30:00",
      companySignedAt: "2024-01-18T16:45:00",
      attempts: 1
    },
    {
      id: "SIG004",
      contractId: "C092",
      customerName: "محمد عبدالله النجار",
      documentType: "عقد يومي",
      status: "expired",
      sentAt: "2024-01-15T08:00:00",
      method: "email",
      expiresAt: "2024-01-22T08:00:00",
      attempts: 3
    }
  ];

  const signatureStats = {
    totalRequests: 156,
    completedSignatures: 128,
    pendingSignatures: 18,
    expiredSignatures: 10,
    avgSigningTime: 2.3,
    successRate: 82.1
  };

  // Digital signature methods
  const signatureMethods = [
    {
      method: "email",
      name: "البريد الإلكتروني",
      description: "إرسال رابط التوقيع عبر الإيميل",
      successRate: 85,
      avgTime: "2.1 يوم",
      cost: "مجاني"
    },
    {
      method: "sms",
      name: "الرسائل النصية",
      description: "إرسال رابط التوقيع عبر SMS",
      successRate: 78,
      avgTime: "1.8 يوم",
      cost: "2 ريال/رسالة"
    },
    {
      method: "app",
      name: "التطبيق المحمول",
      description: "التوقيع من خلال تطبيق الشركة",
      successRate: 92,
      avgTime: "1.2 يوم",
      cost: "مجاني"
    },
    {
      method: "in_person",
      name: "التوقيع الحضوري",
      description: "التوقيع في مكتب الشركة",
      successRate: 98,
      avgTime: "0.5 يوم",
      cost: "50 ريال/زيارة"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending_customer": return <Clock className="h-4 w-4 text-blue-600" />;
      case "pending_company": return <PenTool className="h-4 w-4 text-orange-600" />;
      case "expired": return <Clock className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-green-100 text-green-800">مكتمل</Badge>;
      case "pending_customer": return <Badge className="bg-blue-100 text-blue-800">انتظار العميل</Badge>;
      case "pending_company": return <Badge className="bg-orange-100 text-orange-800">انتظار الشركة</Badge>;
      case "expired": return <Badge variant="destructive">منتهي الصلاحية</Badge>;
      default: return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "email": return <Mail className="h-4 w-4" />;
      case "sms": return <Smartphone className="h-4 w-4" />;
      case "app": return <Smartphone className="h-4 w-4" />;
      case "in_person": return <User className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <PenTool className="h-6 w-6 text-primary" />
            نظام التوقيع الإلكتروني
          </h2>
          <p className="text-muted-foreground">إدارة التوقيعات الرقمية الآمنة والمعتمدة قانونياً</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PenTool className="h-4 w-4" />
                طلب توقيع جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إرسال طلب توقيع إلكتروني</DialogTitle>
                <DialogDescription>اختر العقد وطريقة إرسال طلب التوقيع</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="contract">رقم العقد</Label>
                  <Input id="contract" placeholder="C001" />
                </div>
                <div>
                  <Label htmlFor="customer">اسم العميل</Label>
                  <Input id="customer" placeholder="اسم العميل" />
                </div>
                <div>
                  <Label htmlFor="method">طريقة الإرسال</Label>
                  <select className="w-full p-2 border rounded">
                    <option value="email">البريد الإلكتروني</option>
                    <option value="sms">الرسائل النصية</option>
                    <option value="app">التطبيق المحمول</option>
                  </select>
                </div>
                <Button className="w-full">إرسال طلب التوقيع</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            تقرير التوقيعات
          </Button>
        </div>
      </div>

      {/* Signature Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              إجمالي الطلبات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{signatureStats.totalRequests}</div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              التوقيعات المكتملة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{signatureStats.completedSignatures}</div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              في الانتظار
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{signatureStats.pendingSignatures}</div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              منتهية الصلاحية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{signatureStats.expiredSignatures}</div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">متوسط وقت التوقيع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{signatureStats.avgSigningTime} يوم</div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">معدل النجاح</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{signatureStats.successRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Signature Methods Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>مقارنة طرق التوقيع</CardTitle>
          <CardDescription>إحصائيات الأداء لكل طريقة توقيع</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {signatureMethods.map((method, index) => (
              <Card key={index} className="hover-scale">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {getMethodIcon(method.method)}
                    <h3 className="font-medium">{method.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{method.description}</p>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-muted-foreground">معدل النجاح</span>
                        <span className="text-sm font-medium">{method.successRate}%</span>
                      </div>
                      <Progress value={method.successRate} className="h-2" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">متوسط الوقت</span>
                      <Badge variant="outline">{method.avgTime}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">التكلفة</span>
                      <Badge variant={method.cost === 'مجاني' ? 'default' : 'secondary'}>
                        {method.cost}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Signature Requests */}
      <Card>
        <CardHeader>
          <CardTitle>طلبات التوقيع النشطة</CardTitle>
          <CardDescription>متابعة حالة طلبات التوقيع الحالية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 font-medium">رقم الطلب</th>
                  <th className="text-right p-3 font-medium">رقم العقد</th>
                  <th className="text-right p-3 font-medium">العميل</th>
                  <th className="text-right p-3 font-medium">نوع المستند</th>
                  <th className="text-right p-3 font-medium">الحالة</th>
                  <th className="text-right p-3 font-medium">طريقة الإرسال</th>
                  <th className="text-right p-3 font-medium">تاريخ الإرسال</th>
                  <th className="text-right p-3 font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {signatureRequests.map((request) => (
                  <tr key={request.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-mono font-medium">{request.id}</td>
                    <td className="p-3 font-mono">{request.contractId}</td>
                    <td className="p-3">{request.customerName}</td>
                    <td className="p-3 text-sm">{request.documentType}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        {getStatusBadge(request.status)}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getMethodIcon(request.method)}
                        <span className="text-sm capitalize">{request.method}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      {new Date(request.sentAt).toLocaleDateString('ar-SA')}
                      {request.expiresAt && request.status !== 'completed' && (
                        <div className="text-xs text-muted-foreground">
                          ينتهي: {new Date(request.expiresAt).toLocaleDateString('ar-SA')}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        {request.status === 'pending_customer' && (
                          <Button variant="outline" size="sm">
                            إعادة إرسال
                          </Button>
                        )}
                        {request.status === 'expired' && (
                          <Button variant="default" size="sm">
                            تجديد الطلب
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          تفاصيل
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Security & Compliance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover-scale bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Shield className="h-5 w-5" />
              الأمان والامتثال
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-blue-800">التشفير المتقدم</h3>
                <p className="text-sm text-blue-700">تشفير 256-bit SSL لحماية البيانات</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-blue-800">التوثيق المتعدد</h3>
                <p className="text-sm text-blue-700">التحقق من الهوية بطرق متعددة</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-blue-800">الامتثال القانوني</h3>
                <p className="text-sm text-blue-700">متوافق مع قوانين التوقيع الإلكتروني السعودية</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-blue-800">أرشفة آمنة</h3>
                <p className="text-sm text-blue-700">حفظ المستندات الموقعة بشكل آمن لـ 10 سنوات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              فوائد النظام
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-green-800">توفير الوقت</h3>
                <p className="text-sm text-green-700">تقليل وقت التوقيع من أسابيع إلى أيام</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-green-800">تقليل التكاليف</h3>
                <p className="text-sm text-green-700">لا حاجة للطباعة والبريد والأرشفة الورقية</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-green-800">تحسين تجربة العميل</h3>
                <p className="text-sm text-green-700">توقيع سهل وسريع من أي مكان</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-green-800">تتبع دقيق</h3>
                <p className="text-sm text-green-700">متابعة لحظية لحالة كل توقيع</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}