import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const SuppliersTable = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>قائمة الموردين</CardTitle>
        <CardDescription>إدارة جميع الموردين والبائعين</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-muted-foreground">قريباً - جدول إدارة الموردين</p>
        </div>
      </CardContent>
    </Card>
  );
};