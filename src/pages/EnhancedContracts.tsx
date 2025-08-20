
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedContractsPage } from '@/components/Contracts/EnhancedContractsPage';
import { VehicleReturnProcess } from '@/components/Contracts/VehicleReturnProcess';
import { SmartContractNotifications } from '@/components/Contracts/SmartContractNotifications';
import { ContractFinancialIntegration } from '@/components/Contracts/ContractFinancialIntegration';
import { Card } from '@/components/ui/card';
import { useContracts } from '@/hooks/useContracts';

export default function EnhancedContracts() {
  const [activeTab, setActiveTab] = useState('contracts');
  const [selectedContract, setSelectedContract] = useState(null);
  const { contracts } = useContracts();

  return (
    <div className="container mx-auto p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contracts">إدارة العقود</TabsTrigger>
          <TabsTrigger value="returns">إرجاع المركبات</TabsTrigger>
          <TabsTrigger value="notifications">التنبيهات الذكية</TabsTrigger>
          <TabsTrigger value="financial">التكامل المالي</TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="mt-6">
          <EnhancedContractsPage />
        </TabsContent>

        <TabsContent value="returns" className="mt-6">
          <Card className="p-6">
            {selectedContract ? (
              <VehicleReturnProcess
                contract={selectedContract}
                onComplete={() => setSelectedContract(null)}
                onCancel={() => setSelectedContract(null)}
              />
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">إرجاع المركبات</h3>
                <p className="text-muted-foreground mb-4">
                  اختر عقداً من قائمة العقود النشطة لبدء عملية الإرجاع
                </p>
                <div className="grid gap-2 max-w-md mx-auto">
                  {contracts
                    .filter(c => c.status === 'active')
                    .slice(0, 5)
                    .map(contract => (
                      <div
                        key={contract.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedContract(contract)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{contract.contract_number}</div>
                            <div className="text-sm text-muted-foreground">
                              {contract.customer?.name} - {contract.vehicle?.plate_number}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <SmartContractNotifications />
        </TabsContent>

        <TabsContent value="financial" className="mt-6">
          <Card className="p-6">
            {selectedContract ? (
              <ContractFinancialIntegration
                contractId={selectedContract.id}
                contractData={selectedContract}
              />
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">التكامل المالي</h3>
                <p className="text-muted-foreground mb-4">
                  اختر عقداً لعرض التفاصيل المالية والتكامل مع المحاسبة
                </p>
                <div className="grid gap-2 max-w-md mx-auto">
                  {contracts.slice(0, 5).map(contract => (
                    <div
                      key={contract.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedContract(contract)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{contract.contract_number}</div>
                          <div className="text-sm text-muted-foreground">
                            {contract.customer?.name}
                          </div>
                        </div>
                        <div className="text-sm">
                          {contract.total_amount.toLocaleString()} ر.س
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
