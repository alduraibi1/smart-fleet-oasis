
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shield, 
  TrendingUp, 
  Bell, 
  Users,
  BarChart3,
  AlertTriangle
} from "lucide-react";

import { OwnerBalanceReport } from "../FinancialReports/OwnerBalanceReport";
import { CashFlowAnalysis } from "../FinancialReports/CashFlowAnalysis";
import { AutomatedAlerts } from "../FinancialReports/AutomatedAlerts";
import { FinancialWarningsTable } from "../FinancialWarnings/FinancialWarningsTable";

export function FinancialControlDashboard() {
  return (
    <div className="space-y-6">
      {/* العنوان الرئيسي */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Shield className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">لوحة الرقابة المالية</h1>
          <p className="text-muted-foreground">
            مراقبة وإدارة الوضع المالي للمالكين وضمان التوازن المالي
          </p>
        </div>
      </div>

      {/* التبويبات الرئيسية */}
      <Tabs defaultValue="balances" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="balances" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            أرصدة المالكين
          </TabsTrigger>
          <TabsTrigger value="cashflow" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            التدفق النقدي
          </TabsTrigger>
          <TabsTrigger value="warnings" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            التحذيرات المالية
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            التنبيهات الآلية
          </TabsTrigger>
        </TabsList>

        <TabsContent value="balances">
          <OwnerBalanceReport />
        </TabsContent>

        <TabsContent value="cashflow">
          <CashFlowAnalysis />
        </TabsContent>

        <TabsContent value="warnings">
          <FinancialWarningsTable />
        </TabsContent>

        <TabsContent value="alerts">
          <AutomatedAlerts />
        </TabsContent>
      </Tabs>
    </div>
  );
}
