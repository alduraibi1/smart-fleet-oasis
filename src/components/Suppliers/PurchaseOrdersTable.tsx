import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const PurchaseOrdersTable = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>أوامر الشراء</CardTitle>
        <CardDescription>متابعة جميع أوامر الشراء</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-muted-foreground">قريباً - جدول أوامر الشراء</p>
        </div>
      </CardContent>
    </Card>
  );
};