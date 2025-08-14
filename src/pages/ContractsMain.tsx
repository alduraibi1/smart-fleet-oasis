
import { useState, useCallback } from 'react';
import { ContractsHeader } from '@/components/Contracts/ContractsHeader';
import { ContractsQuickStats } from '@/components/Contracts/ContractsQuickStats';
import { ContractsActionButtons } from '@/components/Contracts/ContractsActionButtons';
import { ContractsTable } from '@/components/Contracts/ContractsTable';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useContracts } from '@/hooks/useContracts';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, DollarSign } from "lucide-react";

const ContractsMain = () => {
  const { contracts, loading, stats, fetchContracts } = useContracts();
  const [activeTab, setActiveTab] = useState('all');

  const handleRefresh = useCallback(() => {
    fetchContracts();
  }, [fetchContracts]);

  // Filter contracts based on active tab
  const filteredContracts = contracts.filter(contract => {
    switch (activeTab) {
      case 'active':
        return contract.status === 'active';
      case 'expiring':
        const today = new Date();
        const endDate = new Date(contract.end_date);
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays > 0 && contract.status === 'active';
      case 'completed':
        return contract.status === 'completed';
      case 'expired':
        return contract.status === 'expired';
      default:
        return true;
    }
  });

  // Get contracts that need immediate attention
  const urgentContracts = contracts.filter(contract => {
    const today = new Date();
    const endDate = new Date(contract.end_date);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0 && contract.status === 'active';
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <ContractsHeader 
            title="إدارة العقود الرئيسية"
            description="نظام شامل لإدارة عقود الإيجار مع المتابعة والتحليلات"
          />
          <ContractsActionButtons onRefresh={handleRefresh} />
        </div>

        {/* Quick Stats */}
        <ContractsQuickStats contracts={contracts} />

        {/* Urgent Contracts Alert */}
        {urgentContracts.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                عقود تحتاج متابعة عاجلة ({urgentContracts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {urgentContracts.slice(0, 3).map((contract, index) => {
                  const today = new Date();
                  const endDate = new Date(contract.end_date);
                  const diffTime = endDate.getTime() - today.getTime();
                  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                      <div className="flex items-center gap-3">
                        <Badge variant={daysLeft <= 1 ? "destructive" : "secondary"}>
                          {daysLeft === 0 ? 'ينتهي اليوم' : `${daysLeft} يوم متبقي`}
                        </Badge>
                        <div>
                          <div className="font-medium">{contract.contract_number}</div>
                          <div className="text-sm text-muted-foreground">
                            {contract.customer?.name || 'غير محدد'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-orange-800">
                          {(contract.total_amount || 0).toLocaleString()} ر.س
                        </div>
                        <div className="text-sm text-muted-foreground">
                          متبقي: {((contract.total_amount || 0) - (contract.paid_amount || 0)).toLocaleString()} ر.س
                        </div>
                      </div>
                    </div>
                  );
                })}
                {urgentContracts.length > 3 && (
                  <div className="text-center text-sm text-muted-foreground">
                    و {urgentContracts.length - 3} عقود أخرى...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              جدول العقود
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">الكل ({contracts.length})</TabsTrigger>
                <TabsTrigger value="active">
                  النشطة ({contracts.filter(c => c.status === 'active').length})
                </TabsTrigger>
                <TabsTrigger value="expiring">
                  تنتهي قريباً ({contracts.filter(c => {
                    const today = new Date();
                    const endDate = new Date(c.end_date);
                    const diffTime = endDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays <= 7 && diffDays > 0 && c.status === 'active';
                  }).length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  مكتملة ({contracts.filter(c => c.status === 'completed').length})
                </TabsTrigger>
                <TabsTrigger value="expired">
                  منتهية الصلاحية ({contracts.filter(c => c.status === 'expired').length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-4">
                <ContractsTable contracts={filteredContracts} loading={loading} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                متوسط قيمة العقد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {contracts.length > 0 ? 
                  Math.round(contracts.reduce((sum, c) => sum + (c.total_amount || 0), 0) / contracts.length).toLocaleString() : 0
                } ر.س
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                معدل التحصيل
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {(() => {
                  const totalRevenue = contracts.reduce((sum, c) => sum + (c.total_amount || 0), 0);
                  const totalPaid = contracts.reduce((sum, c) => sum + (c.paid_amount || 0), 0);
                  return totalRevenue > 0 ? Math.round((totalPaid / totalRevenue) * 100) : 0;
                })()}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                متوسط مدة العقد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {(() => {
                  if (contracts.length === 0) return '0';
                  const totalDays = contracts.reduce((sum, c) => {
                    const start = new Date(c.start_date);
                    const end = new Date(c.end_date);
                    const diffTime = Math.abs(end.getTime() - start.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return sum + diffDays;
                  }, 0);
                  return Math.round(totalDays / contracts.length);
                })()} يوم
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default ContractsMain;
