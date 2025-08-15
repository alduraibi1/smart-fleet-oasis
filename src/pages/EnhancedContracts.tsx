
import { AppLayout } from "@/components/Layout/AppLayout";
import { EnhancedContractManagement } from "@/components/Contracts/EnhancedContractManagement";
import { PendingTerminationRequests } from "@/components/Contracts/PendingTerminationRequests";
import { ContractTerminationTest } from "@/components/Contracts/ContractTerminationTest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EnhancedContracts = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">إدارة العقود المتقدمة</h1>
          <p className="text-muted-foreground mt-2">
            نظام شامل لإدارة العقود مع إمكانيات متقدمة
          </p>
        </div>

        <Tabs defaultValue="management" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="management">إدارة العقود</TabsTrigger>
            <TabsTrigger value="termination">طلبات الإنهاء</TabsTrigger>
            <TabsTrigger value="testing">اختبار الإنهاء</TabsTrigger>
          </TabsList>

          <TabsContent value="management" className="space-y-6">
            <EnhancedContractManagement />
          </TabsContent>

          <TabsContent value="termination" className="space-y-6">
            <PendingTerminationRequests />
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            <ContractTerminationTest />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default EnhancedContracts;
