
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Calendar, Package } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

const purchaseOrderSchema = z.object({
  supplier_id: z.string().min(1, "يجب اختيار مورد"),
  expected_delivery_date: z.string().optional(),
  notes: z.string().optional(),
  tax_amount: z.number().min(0).optional(),
  discount_amount: z.number().min(0).optional(),
});

const itemSchema = z.object({
  item_name: z.string().min(1, "اسم الصنف مطلوب"),
  quantity: z.number().min(1, "الكمية يجب أن تكون أكبر من صفر"),
  unit_cost: z.number().min(0, "السعر يجب أن يكون صفر أو أكبر"),
  unit_of_measure: z.string().min(1, "وحدة القياس مطلوبة"),
});

interface CreatePurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePurchaseOrderDialog = ({ open, onOpenChange }: CreatePurchaseOrderDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([{ item_name: "", quantity: 1, unit_cost: 0, unit_of_measure: "قطعة" }]);
  const { suppliers, createPurchaseOrder } = useSuppliers();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof purchaseOrderSchema>>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      supplier_id: "",
      expected_delivery_date: "",
      notes: "",
      tax_amount: 0,
      discount_amount: 0,
    },
  });

  const addItem = () => {
    setItems([...items, { item_name: "", quantity: 1, unit_cost: 0, unit_of_measure: "قطعة" }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = form.watch("tax_amount") || 0;
    const discount = form.watch("discount_amount") || 0;
    return subtotal + tax - discount;
  };

  const onSubmit = async (values: z.infer<typeof purchaseOrderSchema>) => {
    // التحقق من صحة العناصر
    const validItems = items.every(item => 
      item.item_name.trim() !== "" && 
      item.quantity > 0 && 
      item.unit_cost >= 0 &&
      item.unit_of_measure.trim() !== ""
    );

    if (!validItems) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع بيانات الأصناف بشكل صحيح",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // تحويل الأصناف إلى الشكل المطلوب
      const orderItems = items.map(item => ({
        item_id: `temp-${Date.now()}-${Math.random()}`, // معرف مؤقت
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        item_name: item.item_name,
        unit_of_measure: item.unit_of_measure
      }));

      await createPurchaseOrder(values, orderItems);
      
      toast({
        title: "تم بنجاح",
        description: "تم إنشاء أمر الشراء بنجاح",
      });
      
      form.reset();
      setItems([{ item_name: "", quantity: 1, unit_cost: 0, unit_of_measure: "قطعة" }]);
      onOpenChange(false);
    } catch (error) {
      console.error("خطأ في إنشاء أمر الشراء:", error);
      toast({
        title: "خطأ",
        description: "فشل في إنشاء أمر الشراء",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedSupplier = suppliers.find(s => s.id === form.watch("supplier_id"));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            إنشاء أمر شراء جديد
          </DialogTitle>
          <DialogDescription>
            إنشاء أمر شراء جديد مع تحديد الأصناف والكميات المطلوبة
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* معلومات المورد */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">معلومات المورد</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="supplier_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المورد *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المورد" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              <div className="flex items-center gap-2">
                                <span>{supplier.name}</span>
                                {supplier.rating >= 4 && (
                                  <Badge variant="secondary" className="text-xs">
                                    تقييم ممتاز
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedSupplier && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm"><strong>جهة الاتصال:</strong> {selectedSupplier.contact_person || "غير محدد"}</p>
                    <p className="text-sm"><strong>الهاتف:</strong> {selectedSupplier.phone || "غير محدد"}</p>
                    <p className="text-sm"><strong>شروط الدفع:</strong> {selectedSupplier.payment_terms || "غير محددة"}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="expected_delivery_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تاريخ التسليم المتوقع</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* أصناف أمر الشراء */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>أصناف أمر الشراء</span>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    إضافة صنف
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-end p-3 border rounded-lg">
                    <div className="col-span-12 md:col-span-4">
                      <label className="text-sm font-medium">اسم الصنف *</label>
                      <Input
                        placeholder="اسم الصنف"
                        value={item.item_name}
                        onChange={(e) => updateItem(index, "item_name", e.target.value)}
                      />
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <label className="text-sm font-medium">الكمية *</label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                      />
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <label className="text-sm font-medium">وحدة القياس</label>
                      <Select
                        value={item.unit_of_measure}
                        onValueChange={(value) => updateItem(index, "unit_of_measure", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="قطعة">قطعة</SelectItem>
                          <SelectItem value="كيلو">كيلو</SelectItem>
                          <SelectItem value="لتر">لتر</SelectItem>
                          <SelectItem value="متر">متر</SelectItem>
                          <SelectItem value="علبة">علبة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-8 md:col-span-2">
                      <label className="text-sm font-medium">السعر للوحدة</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_cost}
                        onChange={(e) => updateItem(index, "unit_cost", Number(e.target.value))}
                      />
                    </div>
                    <div className="col-span-4 md:col-span-1">
                      <Badge variant="outline" className="w-full justify-center">
                        {(item.quantity * item.unit_cost).toFixed(2)} ر.س
                      </Badge>
                    </div>
                    <div className="col-span-12 md:col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                        className="w-full text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* المجاميع والضرائب */}
            <Card>
              <CardHeader>
                <CardTitle>المجاميع والضرائب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tax_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>مبلغ الضريبة</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discount_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>مبلغ الخصم</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span>المجموع الفرعي:</span>
                    <span className="font-medium">{calculateSubtotal().toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span>الضريبة:</span>
                    <span className="font-medium">{(form.watch("tax_amount") || 0).toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span>الخصم:</span>
                    <span className="font-medium text-green-600">-{(form.watch("discount_amount") || 0).toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                    <span>الإجمالي:</span>
                    <span className="text-primary">{calculateTotal().toFixed(2)} ر.س</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ملاحظات */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea placeholder="ملاحظات إضافية..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "جاري الإنشاء..." : "إنشاء أمر الشراء"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                إلغاء
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
