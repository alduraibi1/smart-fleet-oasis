
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, DollarSign, TrendingUp, Users, Car, FileText, PieChart, Target } from "lucide-react";
import { CustomerAnalyticsReport } from "./CustomerAnalyticsReport";
import { FinancialPerformanceReport } from "./FinancialPerformanceReport";
import { VehicleUtilizationReport } from "./VehicleUtilizationReport";
import { VehicleProfitabilityReport } from "./VehicleProfitabilityReport";
import { OwnerProfitabilityReport } from "./OwnerProfitabilityReport";
import { KPIDashboard } from "./KPIDashboard";
import { ProfitabilityDashboard } from "./ProfitabilityDashboard";
import { CashFlowReport } from "./CashFlowReport";

export const UnifiedReportsLayout = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">التقارير والتحليلات</h1>
          <p className="text-muted-foreground">تقارير شاملة لجميع جوانب النشاط التجاري</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">التقارير المالية</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">تقارير العملاء</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">تقارير المركبات</p>
                <p className="text-2xl font-bold">6</p>
              </div>
              <Car className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">مؤشرات الأداء</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="customer-analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="customer-analytics" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">تحليل العملاء</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">المالية</span>
          </TabsTrigger>
          <TabsTrigger value="vehicle-utilization" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            <span className="hidden sm:inline">استغلال المركبات</span>
          </TabsTrigger>
          <TabsTrigger value="vehicle-profitability" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">ربحية المركبات</span>
          </TabsTrigger>
          <TabsTrigger value="owner-profitability" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">ربحية الملاك</span>
          </TabsTrigger>
          <TabsTrigger value="kpi" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">مؤشرات الأداء</span>
          </TabsTrigger>
          <TabsTrigger value="profitability" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">الربحية</span>
          </TabsTrigger>
          <TabsTrigger value="cash-flow" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">التدفق النقدي</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customer-analytics" className="space-y-6">
          <CustomerAnalyticsReport />
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <FinancialPerformanceReport />
        </TabsContent>

        <TabsContent value="vehicle-utilization" className="space-y-6">
          <VehicleUtilizationReport />
        </TabsContent>

        <TabsContent value="vehicle-profitability" className="space-y-6">
          <VehicleProfitabilityReport />
        </TabsContent>

        <TabsContent value="owner-profitability" className="space-y-6">
          <OwnerProfitabilityReport />
        </TabsContent>

        <TabsContent value="kpi" className="space-y-6">
          <KPIDashboard />
        </TabsContent>

        <TabsContent value="profitability" className="space-y-6">
          <ProfitabilityDashboard />
        </TabsContent>

        <TabsContent value="cash-flow" className="space-y-6">
          <CashFlowReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};
