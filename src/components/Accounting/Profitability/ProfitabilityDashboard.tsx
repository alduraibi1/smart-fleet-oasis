
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VehicleProfitabilityPanel from './VehicleProfitabilityPanel';
import OwnerProfitabilityPanel from './OwnerProfitabilityPanel';
import CustomerProfitabilityPanel from './CustomerProfitabilityPanel';
import { AlertsBanner } from './components/AlertsBanner';

export function ProfitabilityDashboard() {
  return (
    <div className="space-y-4">
      <AlertsBanner />
      <Tabs defaultValue="vehicle" className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="vehicle">ربحية المركبة</TabsTrigger>
          <TabsTrigger value="owner">ربحية المالك</TabsTrigger>
          <TabsTrigger value="customer">ربحية العميل</TabsTrigger>
        </TabsList>
        <TabsContent value="vehicle">
          <VehicleProfitabilityPanel />
        </TabsContent>
        <TabsContent value="owner">
          <OwnerProfitabilityPanel />
        </TabsContent>
        <TabsContent value="customer">
          <CustomerProfitabilityPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
