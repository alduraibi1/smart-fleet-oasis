
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Download, FileText, DollarSign, BarChart3, TrendingUp, Receipt } from "lucide-react";
import { IntegratedFinancialDashboard } from "@/components/Accounting/IntegratedFinancialDashboard";
import { RevenueExpenseReport } from "@/components/Accounting/RevenueExpenseReport";
import { CashFlowReport } from "@/components/Accounting/CashFlowReport";
import { AssetsReport } from "@/components/Accounting/AssetsReport";
import { AccountsReceivable } from "@/components/Accounting/AccountsReceivable";
import { AccountsPayable } from "@/components/Accounting/AccountsPayable";
import { TaxManagement } from "@/components/Accounting/TaxManagement";
import { FinancialKPIs } from "@/components/Accounting/FinancialKPIs";
import { FinancialForecasting } from "@/components/Accounting/FinancialForecasting";
import { VouchersManagement } from "@/components/Accounting/VouchersManagement/VouchersManagement";
import { InvoiceManagement } from "@/components/Accounting/IntegratedInvoicing/InvoiceManagement";
import { CostTracking } from "@/components/Accounting/IntegratedCosts/CostTracking";
import { FinancialAnalytics } from "@/components/Accounting/AdvancedReports/FinancialAnalytics";
import { AppLayout } from "@/components/Layout/AppLayout";
import { useNavigate } from "react-router-dom";

export default function Accounting() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">النظام المحاسبي</h1>
            <p className="text-muted-foreground mt-2">
              إدارة ومتابعة الوضع المالي للشركة
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              تخصيص الفترة
            </Button>
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              تصدير التقارير
            </Button>
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/profitability-reports')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">تقارير الربحية</h3>
                  <p className="text-sm text-muted-foreground">المركبات والمالكين والعملاء</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Receipt className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">المعاملات المالية</h3>
                  <p className="text-sm text-muted-foreground">السندات والفواتير</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">التقارير المالية</h3>
                  <p className="text-sm text-muted-foreground">التدفق النقدي والأصول</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold">التحليلات المتقدمة</h3>
                  <p className="text-sm text-muted-foreground">مؤشرات الأداء والتنبؤات</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              النظرة العامة
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              المعاملات المالية
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              التقارير المالية
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              التحليلات المتقدمة
            </TabsTrigger>
            <TabsTrigger value="costs" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              إدارة التكاليف
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <IntegratedFinancialDashboard />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>إدارة السندات</CardTitle>
                  <CardDescription>سندات القبض والصرف والخصم</CardDescription>
                </CardHeader>
                <CardContent>
                  <VouchersManagement />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>إدارة الفواتير</CardTitle>
                  <CardDescription>الفواتير المدمجة مع النظام</CardDescription>
                </CardHeader>
                <CardContent>
                  <InvoiceManagement />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Tabs defaultValue="revenue-expense" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="revenue-expense">الإيرادات والمصروفات</TabsTrigger>
                <TabsTrigger value="cash-flow">التدفق النقدي</TabsTrigger>
                <TabsTrigger value="assets">الأصول</TabsTrigger>
                <TabsTrigger value="receivables">المدينة</TabsTrigger>
                <TabsTrigger value="payables">الدائنة</TabsTrigger>
              </TabsList>

              <TabsContent value="revenue-expense">
                <RevenueExpenseReport />
              </TabsContent>

              <TabsContent value="cash-flow">
                <CashFlowReport />
              </TabsContent>

              <TabsContent value="assets">
                <AssetsReport />
              </TabsContent>

              <TabsContent value="receivables">
                <AccountsReceivable />
              </TabsContent>

              <TabsContent value="payables">
                <AccountsPayable />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Tabs defaultValue="financial-analytics" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="financial-analytics">التحليلات المالية</TabsTrigger>
                <TabsTrigger value="kpis">مؤشرات الأداء</TabsTrigger>
                <TabsTrigger value="forecasting">التنبؤات المالية</TabsTrigger>
                <TabsTrigger value="tax">إدارة الضرائب</TabsTrigger>
              </TabsList>

              <TabsContent value="financial-analytics">
                <FinancialAnalytics />
              </TabsContent>

              <TabsContent value="kpis">
                <FinancialKPIs />
              </TabsContent>

              <TabsContent value="forecasting">
                <FinancialForecasting />
              </TabsContent>

              <TabsContent value="tax">
                <TaxManagement />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="costs" className="space-y-6">
            <CostTracking />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
