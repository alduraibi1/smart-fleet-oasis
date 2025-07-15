import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const SuppliersReports = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>تقارير الموردين</CardTitle>
        <CardDescription>تقارير أداء وتقييم الموردين</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-muted-foreground">قريباً - تقارير الموردين والأداء</p>
        </div>
      </CardContent>
    </Card>
  );
};