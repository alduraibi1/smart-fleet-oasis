
import { AppLayout } from "@/components/Layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp } from "lucide-react";
import { ProfitabilityDashboard } from "@/components/Accounting/Profitability/ProfitabilityDashboard";

export default function ProfitabilityReports() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">تقارير الربحية</h1>
            <p className="text-muted-foreground mt-2">
              تحليل مفصل لربحية المركبات والمالكين والعملاء
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              مقارنة الفترات
            </Button>
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              تصدير التقارير
            </Button>
          </div>
        </div>

        {/* Profitability Dashboard */}
        <ProfitabilityDashboard />
      </div>
    </AppLayout>
  );
}
