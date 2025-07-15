import { Suspense, lazy } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy loading المكونات الثقيلة
const ContractsAnalytics = lazy(() => import('./ContractsAnalytics').then(m => ({ default: m.ContractsAnalytics })));
const FinancialReports = lazy(() => import('./FinancialReports').then(m => ({ default: m.FinancialReports })));
const AdvancedDashboard = lazy(() => import('./AdvancedDashboard').then(m => ({ default: m.AdvancedDashboard })));
const ExecutiveDashboard = lazy(() => import('./ExecutiveDashboard').then(m => ({ default: m.ExecutiveDashboard })));
const ContractsOverview = lazy(() => import('./ContractsOverview').then(m => ({ default: m.ContractsOverview })));
const ContractLifecycleTracker = lazy(() => import('./ContractLifecycleTracker').then(m => ({ default: m.ContractLifecycleTracker })));
const AdvancedSearchFilter = lazy(() => import('./AdvancedSearchFilter').then(m => ({ default: m.AdvancedSearchFilter })));
const SmartNotifications = lazy(() => import('./SmartNotifications').then(m => ({ default: m.SmartNotifications })));
const DigitalSignatures = lazy(() => import('./DigitalSignatures').then(m => ({ default: m.DigitalSignatures })));
const AutomatedWorkflows = lazy(() => import('./AutomatedWorkflows').then(m => ({ default: m.AutomatedWorkflows })));
const AIContractAnalysis = lazy(() => import('./AIContractAnalysis').then(m => ({ default: m.AIContractAnalysis })));
const PredictiveAnalytics = lazy(() => import('./PredictiveAnalytics').then(m => ({ default: m.PredictiveAnalytics })));
const SystemIntegration = lazy(() => import('./SystemIntegration').then(m => ({ default: m.SystemIntegration })));
const ContractStatusManager = lazy(() => import('./ContractStatusManager').then(m => ({ default: m.ContractStatusManager })));

interface ContractsLayoutProps {
  contracts: any[];
  stats: any;
  onRefresh: () => void;
}

// مكون Loading مشترك
const LoadingFallback = () => (
  <Card className="p-6">
    <div className="space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  </Card>
);

export const ContractsLayout = ({ contracts, stats, onRefresh }: ContractsLayoutProps) => {
  return (
    <Tabs defaultValue="dashboard" className="space-y-6">
      {/* التبويبات المحدودة - 6 تبويبات رئيسية فقط */}
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
        <TabsTrigger value="dashboard" className="text-sm">لوحة التحكم</TabsTrigger>
        <TabsTrigger value="management" className="text-sm">إدارة العقود</TabsTrigger>
        <TabsTrigger value="analytics" className="text-sm">التحليلات</TabsTrigger>
        <TabsTrigger value="automation" className="text-sm">الأتمتة</TabsTrigger>
        <TabsTrigger value="reports" className="text-sm">التقارير</TabsTrigger>
        <TabsTrigger value="settings" className="text-sm">الإعدادات</TabsTrigger>
      </TabsList>

      {/* لوحة التحكم الرئيسية */}
      <TabsContent value="dashboard" className="space-y-6">
        <Suspense fallback={<LoadingFallback />}>
          <AdvancedDashboard contracts={contracts} stats={stats} />
        </Suspense>
      </TabsContent>

      {/* إدارة العقود */}
      <TabsContent value="management" className="space-y-6">
        <div className="grid gap-6">
          <Suspense fallback={<LoadingFallback />}>
            <ContractsOverview />
          </Suspense>
          
          <Suspense fallback={<LoadingFallback />}>
            <ContractLifecycleTracker 
              contract={contracts[0] || { id: 'sample-id', contract_number: 'C001' }} 
              onStageUpdate={(contractId, stage) => {
                console.log('Stage update:', contractId, stage);
                onRefresh();
              }}
            />
          </Suspense>

          <Suspense fallback={<LoadingFallback />}>
            <AdvancedSearchFilter 
              onFiltersChange={(filters) => console.log('Filters:', filters)}
              onExport={(format) => console.log('Export:', format)}
            />
          </Suspense>
        </div>
      </TabsContent>

      {/* التحليلات */}
      <TabsContent value="analytics" className="space-y-6">
        <div className="grid gap-6">
          <Suspense fallback={<LoadingFallback />}>
            <ExecutiveDashboard />
          </Suspense>
          
          <Suspense fallback={<LoadingFallback />}>
            <ContractsAnalytics />
          </Suspense>

          <Suspense fallback={<LoadingFallback />}>
            <AIContractAnalysis />
          </Suspense>

          <Suspense fallback={<LoadingFallback />}>
            <PredictiveAnalytics />
          </Suspense>
        </div>
      </TabsContent>

      {/* الأتمتة */}
      <TabsContent value="automation" className="space-y-6">
        <div className="grid gap-6">
          <Suspense fallback={<LoadingFallback />}>
            <SmartNotifications />
          </Suspense>
          
          <Suspense fallback={<LoadingFallback />}>
            <DigitalSignatures />
          </Suspense>

          <Suspense fallback={<LoadingFallback />}>
            <AutomatedWorkflows />
          </Suspense>

          <div className="grid gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">إدارة حالة العقود</h3>
              <div className="space-y-4">
                {contracts.slice(0, 5).map((contract) => (
                  <Suspense key={contract.id} fallback={<Skeleton className="h-16" />}>
                    <ContractStatusManager
                      contract={contract}
                      onStatusChange={onRefresh}
                    />
                  </Suspense>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </TabsContent>

      {/* التقارير */}
      <TabsContent value="reports" className="space-y-6">
        <Suspense fallback={<LoadingFallback />}>
          <FinancialReports contracts={contracts} />
        </Suspense>
      </TabsContent>

      {/* الإعدادات */}
      <TabsContent value="settings" className="space-y-6">
        <Suspense fallback={<LoadingFallback />}>
          <SystemIntegration />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
};