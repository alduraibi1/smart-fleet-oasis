import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  RefreshCw, 
  Plus, 
  Edit, 
  Trash2,
  Settings,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Bot
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const autoOrderRules = [
  {
    id: 1,
    productName: "فلتر زيت موتور - تويوتا",
    sku: "TOY-OF-001",
    currentStock: 15,
    minLevel: 20,
    maxLevel: 100,
    reorderQuantity: 50,
    supplier: "شركة قطع غيار الخليج",
    status: "active",
    lastTriggered: "2024-01-08",
    nextCheck: "2024-01-15",
    avgConsumption: 8,
    leadTime: 7,
    autoApprove: true
  },
  {
    id: 2,
    productName: "زيت محرك 5W-30",
    sku: "MOB-5W30-4L",
    currentStock: 8,
    minLevel: 25,
    maxLevel: 80,
    reorderQuantity: 40,
    supplier: "موبيل الخليج",
    status: "triggered",
    lastTriggered: "2024-01-10",
    nextCheck: "اليوم",
    avgConsumption: 12,
    leadTime: 5,
    autoApprove: false
  },
  {
    id: 3,
    productName: "إطار 225/60 R16",
    sku: "TIRE-225-60-16",
    currentStock: 5,
    minLevel: 15,
    maxLevel: 50,
    reorderQuantity: 25,
    supplier: "مؤسسة الإطارات الحديثة",
    status: "pending",
    lastTriggered: "2024-01-09",
    nextCheck: "في الانتظار",
    avgConsumption: 3,
    leadTime: 10,
    autoApprove: false
  }
];

const pendingOrders = [
  {
    id: 1,
    productName: "زيت محرك 5W-30",
    quantity: 40,
    supplier: "موبيل الخليج",
    estimatedCost: 1800,
    urgency: "high",
    daysLeft: 2,
    reason: "انخفض المخزون تحت الحد الأدنى"
  },
  {
    id: 2,
    productName: "إطار 225/60 R16",
    quantity: 25,
    supplier: "مؤسسة الإطارات الحديثة",
    estimatedCost: 3000,
    urgency: "medium",
    daysLeft: 5,
    reason: "توقع نفاد المخزون خلال أسبوع"
  }
];

const AutoReordering = () => {
  const [systemEnabled, setSystemEnabled] = useState(true);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">نشط</Badge>;
      case 'triggered':
        return <Badge variant="destructive">تم التفعيل</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">في الانتظار</Badge>;
      case 'paused':
        return <Badge variant="outline">متوقف</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return <Badge variant="destructive">عالي</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">متوسط</Badge>;
      case 'low':
        return <Badge variant="outline">منخفض</Badge>;
      default:
        return <Badge variant="outline">{urgency}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* System Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              إعدادات النظام التلقائي
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Switch
                id="system-toggle"
                checked={systemEnabled}
                onCheckedChange={setSystemEnabled}
              />
              <Label htmlFor="system-toggle">تفعيل النظام التلقائي</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="check-frequency">تكرار الفحص</Label>
              <Select defaultValue="daily">
                <SelectTrigger>
                  <SelectValue placeholder="اختر التكرار" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">كل ساعة</SelectItem>
                  <SelectItem value="daily">يومياً</SelectItem>
                  <SelectItem value="weekly">أسبوعياً</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="auto-approve">الموافقة التلقائية</Label>
              <Select defaultValue="selective">
                <SelectTrigger>
                  <SelectValue placeholder="نوع الموافقة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الطلبات</SelectItem>
                  <SelectItem value="selective">طلبات محددة</SelectItem>
                  <SelectItem value="none">بدون موافقة تلقائية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max-order-value">الحد الأقصى للطلب</Label>
              <Input id="max-order-value" placeholder="5000" type="number" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Orders for Approval */}
      {pendingOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              طلبات تتطلب موافقة ({pendingOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{order.productName}</h4>
                      {getUrgencyBadge(order.urgency)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{order.reason}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span>الكمية: {order.quantity}</span>
                      <span>المورد: {order.supplier}</span>
                      <span>التكلفة المتوقعة: ${order.estimatedCost}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {order.daysLeft} أيام متبقية
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      رفض
                    </Button>
                    <Button size="sm">
                      موافقة
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">قواعد الطلب التلقائي</h2>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {autoOrderRules.filter(rule => rule.status === 'active').length} قاعدة نشطة
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            فحص الآن
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                إضافة قاعدة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>إضافة قاعدة طلب تلقائي</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
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
                    <Label htmlFor="supplier">المورد</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المورد" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="supplier1">شركة قطع غيار الخليج</SelectItem>
                        <SelectItem value="supplier2">موبيل الخليج</SelectItem>
                        <SelectItem value="supplier3">مؤسسة الإطارات الحديثة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minLevel">الحد الأدنى</Label>
                    <Input id="minLevel" type="number" placeholder="20" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLevel">الحد الأقصى</Label>
                    <Input id="maxLevel" type="number" placeholder="100" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reorderQty">كمية الطلب</Label>
                    <Input id="reorderQty" type="number" placeholder="50" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="leadTime">مدة التوريد (أيام)</Label>
                    <Input id="leadTime" type="number" placeholder="7" />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch id="autoApprove" />
                    <Label htmlFor="autoApprove">موافقة تلقائية</Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Textarea id="notes" placeholder="ملاحظات إضافية (اختياري)" />
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline">إلغاء</Button>
                  <Button>حفظ القاعدة</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Auto-Reorder Rules Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المنتج</TableHead>
                <TableHead>المخزون الحالي</TableHead>
                <TableHead>الحدود</TableHead>
                <TableHead>المورد</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الفحص التالي</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {autoOrderRules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{rule.productName}</div>
                      <div className="text-sm text-muted-foreground">{rule.sku}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        rule.currentStock <= rule.minLevel ? 'text-red-500' : 'text-green-600'
                      }`}>
                        {rule.currentStock}
                      </span>
                      {rule.currentStock <= rule.minLevel && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      استهلاك: {rule.avgConsumption}/يوم
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>أدنى: {rule.minLevel}</div>
                      <div>طلب: {rule.reorderQuantity}</div>
                      <div>أقصى: {rule.maxLevel}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{rule.supplier}</div>
                      <div className="text-xs text-muted-foreground">
                        مدة التوريد: {rule.leadTime} أيام
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getStatusBadge(rule.status)}
                      {rule.autoApprove && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-green-600">موافقة تلقائية</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{rule.nextCheck}</div>
                      <div className="text-xs text-muted-foreground">
                        آخر تفعيل: {rule.lastTriggered}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            توصيات الذكاء الاصطناعي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <Bot className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">تحسين كمية الطلب</h4>
                <p className="text-sm text-blue-700">
                  يُنصح بزيادة كمية طلب "زيت محرك 5W-30" إلى 60 وحدة بدلاً من 40 لتحسين الكفاءة
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">تحذير من التوقف</h4>
                <p className="text-sm text-yellow-700">
                  "إطار 225/60 R16" قد ينفد خلال 3 أيام بناءً على معدل الاستهلاك الحالي
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">توفير في التكلفة</h4>
                <p className="text-sm text-green-700">
                  يمكن توفير 15% من تكاليف التخزين بتحسين جدولة طلبات "فلاتر الزيت"
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoReordering;