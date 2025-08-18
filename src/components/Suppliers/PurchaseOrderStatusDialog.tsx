
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSuppliers, PurchaseOrder } from "@/hooks/useSuppliers";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  Truck
} from "lucide-react";

interface PurchaseOrderStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: PurchaseOrder | null;
}

const statusConfig = {
  draft: { label: "مسودة", icon: AlertCircle, color: "bg-gray-500" },
  sent: { label: "تم الإرسال", icon: Package, color: "bg-blue-500" },
  confirmed: { label: "تم التأكيد", icon: CheckCircle, color: "bg-green-500" },
  shipped: { label: "تم الشحن", icon: Truck, color: "bg-purple-500" },
  delivered: { label: "تم التسليم", icon: CheckCircle, color: "bg-green-600" },
  cancelled: { label: "ملغي", icon: XCircle, color: "bg-red-500" },
};

export const PurchaseOrderStatusDialog = ({ 
  open, 
  onOpenChange, 
  order 
}: PurchaseOrderStatusDialogProps) => {
  const [newStatus, setNewStatus] = useState(order?.status || "");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [loading, setLoading] = useState(false);
  const { updatePurchaseOrderStatus } = useSuppliers();
  const { toast } = useToast();

  const handleStatusUpdate = async () => {
    if (!order || !newStatus) return;

    setLoading(true);
    try {
      await updatePurchaseOrderStatus(
        order.id, 
        newStatus, 
        newStatus === 'delivered' ? deliveryDate : undefined
      );
      
      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة أمر الشراء بنجاح",
      });
      
      onOpenChange(false);
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  const currentStatusConfig = statusConfig[order.status as keyof typeof statusConfig];
  const newStatusConfig = statusConfig[newStatus as keyof typeof statusConfig];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            تحديث حالة أمر الشراء - {order.order_number}
          </DialogTitle>
          <DialogDescription>
            تعديل حالة أمر الشراء وتتبع مراحل التنفيذ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* معلومات أمر الشراء */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">المورد:</span>
                <p>{order.suppliers?.name}</p>
              </div>
              <div>
                <span className="font-medium">إجمالي المبلغ:</span>
                <p className="font-bold text-lg">{order.total_amount.toFixed(2)} ر.س</p>
              </div>
              <div>
                <span className="font-medium">تاريخ الأمر:</span>
                <p>{new Date(order.order_date).toLocaleDateString('ar-SA')}</p>
              </div>
              <div>
                <span className="font-medium">التسليم المتوقع:</span>
                <p>{order.expected_delivery_date ? 
                  new Date(order.expected_delivery_date).toLocaleDateString('ar-SA') : 
                  'غير محدد'
                }</p>
              </div>
            </div>
          </div>

          {/* الحالة الحالية */}
          <div>
            <Label className="text-base font-medium">الحالة الحالية</Label>
            <div className="flex items-center gap-3 mt-2">
              {currentStatusConfig && (
                <>
                  <currentStatusConfig.icon className="h-5 w-5" />
                  <Badge className={`${currentStatusConfig.color} text-white`}>
                    {currentStatusConfig.label}
                  </Badge>
                </>
              )}
            </div>
          </div>

          {/* تحديث الحالة */}
          <div className="space-y-3">
            <Label className="text-base font-medium">الحالة الجديدة</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الحالة الجديدة" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusConfig).map(([key, config]) => {
                  const IconComponent = config.icon;
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* تاريخ التسليم الفعلي */}
          {newStatus === 'delivered' && (
            <div className="space-y-3">
              <Label className="text-base font-medium">تاريخ التسليم الفعلي</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          )}

          {/* معاينة التغيير */}
          {newStatus && newStatus !== order.status && (
            <div className="p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">من:</span>
                  {currentStatusConfig && (
                    <Badge variant="outline">
                      {currentStatusConfig.label}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">إلى:</span>
                  {newStatusConfig && (
                    <Badge className={`${newStatusConfig.color} text-white`}>
                      {newStatusConfig.label}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* أزرار الإجراءات */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleStatusUpdate} 
              disabled={loading || !newStatus || newStatus === order.status}
              className="flex-1"
            >
              {loading ? "جاري التحديث..." : "تحديث الحالة"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
