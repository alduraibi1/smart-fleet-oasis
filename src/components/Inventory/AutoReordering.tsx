
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, AlertTriangle, CheckCircle, Package } from "lucide-react";

const AutoReordering = () => {
  const [autoReorderEnabled, setAutoReorderEnabled] = useState(true);

  // Mock auto-reorder items
  const reorderItems = [
    {
      id: 1,
      name: "فلتر زيت محرك",
      currentStock: 5,
      minStock: 10,
      reorderQuantity: 50,
      supplierName: "شركة قطع الغيار المتطورة",
      status: "pending"
    },
    {
      id: 2,
      name: "زيت محرك 5W-30",
      currentStock: 3,
      minStock: 8,
      reorderQuantity: 24,
      supplierName: "مؤسسة الزيوت والفلاتر",
      status: "ordered"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-orange-600"><AlertTriangle className="h-3 w-3 mr-1" />قيد الانتظار</Badge>;
      case "ordered":
        return <Badge variant="default" className="text-green-600"><CheckCircle className="h-3 w-3 mr-1" />تم الطلب</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إعادة الطلب التلقائي</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-reorder">تفعيل الطلب التلقائي</Label>
            <Switch
              id="auto-reorder"
              checked={autoReorderEnabled}
              onCheckedChange={setAutoReorderEnabled}
            />
          </div>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            إعدادات
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            العناصر المحتاجة لإعادة طلب
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reorderItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    المخزون الحالي: {item.currentStock} | الحد الأدنى: {item.minStock}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    المورد: {item.supplierName}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <Label className="text-sm text-muted-foreground">كمية الطلب</Label>
                    <Input
                      type="number"
                      value={item.reorderQuantity}
                      className="w-20 text-center mt-1"
                      readOnly
                    />
                  </div>
                  {getStatusBadge(item.status)}
                  {item.status === "pending" && (
                    <Button size="sm">
                      اطلب الآن
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Auto-reorder settings */}
      <Card>
        <CardHeader>
          <CardTitle>إعدادات الطلب التلقائي</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>فترة فحص المخزون (بالأيام)</Label>
              <Input type="number" defaultValue="7" />
            </div>
            <div className="space-y-2">
              <Label>مهلة التسليم المتوقعة (بالأيام)</Label>
              <Input type="number" defaultValue="5" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button>
              حفظ الإعدادات
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoReordering;
