import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Shield, 
  Plus, 
  Search, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Camera,
  FileText,
  TrendingUp
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const qualityChecks = [
  {
    id: 1,
    productName: "فلتر زيت موتور - تويوتا",
    sku: "TOY-OF-001",
    batchNumber: "B2024-001",
    supplier: "شركة قطع غيار الخليج",
    receiveDate: "2024-01-10",
    inspector: "محمد أحمد",
    status: "passed",
    score: 95,
    issues: 0,
    expiryDate: "2026-01-10",
    category: "قطع غيار"
  },
  {
    id: 2,
    productName: "زيت محرك 5W-30",
    sku: "MOB-5W30-4L",
    batchNumber: "B2024-002",
    supplier: "موبيل الخليج",
    receiveDate: "2024-01-08",
    inspector: "فاطمة سالم",
    status: "pending",
    score: null,
    issues: null,
    expiryDate: "2026-12-31",
    category: "زيوت ومواد"
  },
  {
    id: 3,
    productName: "إطار 225/60 R16",
    sku: "TIRE-225-60-16",
    batchNumber: "B2024-003",
    supplier: "مؤسسة الإطارات الحديثة",
    receiveDate: "2024-01-05",
    inspector: "عبدالله خالد",
    status: "failed",
    score: 65,
    issues: 3,
    expiryDate: "2029-01-05",
    category: "إطارات"
  }
];

const qualityMetrics = [
  { month: 'يناير', passed: 89, failed: 6, pending: 5 },
  { month: 'فبراير', passed: 92, failed: 4, pending: 4 },
  { month: 'مارس', passed: 87, failed: 8, pending: 5 },
  { month: 'أبريل', passed: 94, failed: 3, pending: 3 },
  { month: 'مايو', passed: 91, failed: 5, pending: 4 },
  { month: 'يونيو', passed: 96, failed: 2, pending: 2 },
];

const checklistItems = [
  "فحص التغليف والعبوة",
  "التحقق من أرقام التسلسل",
  "اختبار الأداء الأساسي",
  "فحص التآكل أو الأضرار",
  "التحقق من المطابقة للمواصفات",
  "فحص تاريخ الصنع والانتهاء",
  "اختبار الجودة الوظيفية",
  "التوثيق والشهادات"
];

const QualityControl = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return <Badge variant="default" className="bg-green-100 text-green-800">نجح</Badge>;
      case 'failed':
        return <Badge variant="destructive">فشل</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">قيد الفحص</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const renderStars = (score: number) => {
    const stars = Math.round(score / 20);
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < stars 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Quality Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل النجاح</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94.2%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2.1% من الشهر الماضي
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">فحوصات قيد الانتظار</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">8</div>
            <p className="text-xs text-muted-foreground">
              تتطلب فحص خلال 24 ساعة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مشاكل الجودة</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
            <p className="text-xs text-muted-foreground">
              هذا الأسبوع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط النقاط</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">88.5</div>
            <p className="text-xs text-muted-foreground">
              من 100 نقطة
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="البحث في فحوصات الجودة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفحوصات</SelectItem>
              <SelectItem value="passed">نجح</SelectItem>
              <SelectItem value="failed">فشل</SelectItem>
              <SelectItem value="pending">قيد الفحص</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              فحص جودة جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>إجراء فحص جودة جديد</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              {/* Product Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product">المنتج</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المنتج" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product1">فلتر زيت موتور</SelectItem>
                      <SelectItem value="product2">زيت محرك 5W-30</SelectItem>
                      <SelectItem value="product3">إطار 225/60 R16</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch">رقم الدفعة</Label>
                  <Input id="batch" placeholder="B2024-004" />
                </div>
              </div>

              {/* Inspector and Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inspector">المفتش</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المفتش" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inspector1">محمد أحمد</SelectItem>
                      <SelectItem value="inspector2">فاطمة سالم</SelectItem>
                      <SelectItem value="inspector3">عبدالله خالد</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inspectionDate">تاريخ الفحص</Label>
                  <Input id="inspectionDate" type="date" />
                </div>
              </div>

              {/* Quality Checklist */}
              <div className="space-y-4">
                <Label className="text-base font-medium">قائمة فحص الجودة</Label>
                <div className="grid gap-3">
                  {checklistItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">{item}</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-green-600 border-green-200">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-200">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overall Score */}
              <div className="space-y-2">
                <Label htmlFor="overallScore">النقاط الإجمالية (من 100)</Label>
                <Input id="overallScore" type="number" min="0" max="100" placeholder="85" />
              </div>

              {/* Notes and Issues */}
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات ومشاكل</Label>
                <Textarea id="notes" placeholder="اذكر أي مشاكل أو ملاحظات على الجودة..." rows={4} />
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label>صور الفحص</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">اسحب الصور هنا أو انقر للتحميل</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    تحميل الصور
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline">إلغاء</Button>
                <Button>حفظ التقرير</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quality Checks Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            سجل فحوصات الجودة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المنتج</TableHead>
                <TableHead>الدفعة</TableHead>
                <TableHead>المورد</TableHead>
                <TableHead>المفتش</TableHead>
                <TableHead>النقاط</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ الفحص</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qualityChecks.map((check) => (
                <TableRow key={check.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{check.productName}</div>
                      <div className="text-sm text-muted-foreground">{check.sku}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="bg-muted px-2 py-1 rounded text-sm">
                      {check.batchNumber}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{check.supplier}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{check.inspector}</div>
                  </TableCell>
                  <TableCell>
                    {check.score ? (
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${getScoreColor(check.score)}`}>
                          {check.score}/100
                        </span>
                        {renderStars(check.score)}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">قيد التقييم</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getStatusBadge(check.status)}
                      {check.issues > 0 && (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs text-yellow-600">{check.issues} مشاكل</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{check.receiveDate}</div>
                      <div className="text-xs text-muted-foreground">
                        انتهاء: {check.expiryDate}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quality Trends */}
      <Card>
        <CardHeader>
          <CardTitle>اتجاهات الجودة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {qualityMetrics.slice(-3).map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{metric.month}</span>
                  <span className="text-sm text-muted-foreground">
                    {metric.passed + metric.failed + metric.pending} فحص
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-600">نجح: {metric.passed}%</span>
                    <span className="text-red-600">فشل: {metric.failed}%</span>
                    <span className="text-yellow-600">قيد الانتظار: {metric.pending}%</span>
                  </div>
                  <Progress value={metric.passed} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QualityControl;