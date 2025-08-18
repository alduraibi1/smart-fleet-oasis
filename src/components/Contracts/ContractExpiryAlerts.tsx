
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Calendar, Clock, Car } from 'lucide-react';
import { useContracts } from '@/hooks/useContracts';
import VehicleReturnDialog from './VehicleReturnDialog';

interface ExpiringContract {
  id: string;
  contract_number: string;
  end_date: string;
  customer?: {
    name: string;
    phone: string;
  };
  vehicle?: {
    brand: string;
    model: string;
    plate_number: string;
  };
}

export default function ContractExpiryAlerts() {
  const { getExpiringContracts, getExpiredContracts } = useContracts();
  const [expiringContracts, setExpiringContracts] = useState<ExpiringContract[]>([]);
  const [expiredContracts, setExpiredContracts] = useState<ExpiringContract[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [showReturnDialog, setShowReturnDialog] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const [expiring, expired] = await Promise.all([
          getExpiringContracts(7), // العقود التي تنتهي خلال 7 أيام
          getExpiredContracts(),
        ]);
        
        setExpiringContracts(expiring as ExpiringContract[]);
        setExpiredContracts(expired as ExpiringContract[]);
      } catch (error) {
        console.error('Error fetching contract alerts:', error);
      }
    };

    fetchAlerts();
  }, [getExpiringContracts, getExpiredContracts]);

  const handleReturnVehicle = (contractId: string) => {
    setSelectedContractId(contractId);
    setShowReturnDialog(true);
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (expiringContracts.length === 0 && expiredContracts.length === 0) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* العقود المنتهية */}
        {expiredContracts.length > 0 && (
          <Card className="border-destructive/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                عقود منتهية ({expiredContracts.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {expiredContracts.slice(0, 3).map((contract) => (
                <div key={contract.id} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="destructive" className="text-xs">
                        منتهي
                      </Badge>
                      <span className="font-medium text-sm">
                        {contract.contract_number}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {contract.customer?.name} - {contract.vehicle?.brand} {contract.vehicle?.model}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      انتهى في: {new Date(contract.end_date).toLocaleDateString('ar-SA')}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleReturnVehicle(contract.id)}
                  >
                    <Car className="h-4 w-4 ml-1" />
                    إرجاع فوري
                  </Button>
                </div>
              ))}
              {expiredContracts.length > 3 && (
                <div className="text-center text-sm text-muted-foreground">
                  و {expiredContracts.length - 3} عقود أخرى منتهية
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* العقود التي تنتهي قريباً */}
        {expiringContracts.length > 0 && (
          <Card className="border-warning/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-warning">
                <Clock className="h-5 w-5" />
                عقود تنتهي قريباً ({expiringContracts.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {expiringContracts.slice(0, 3).map((contract) => {
                const daysLeft = getDaysUntilExpiry(contract.end_date);
                return (
                  <div key={contract.id} className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs border-warning text-warning">
                          {daysLeft} {daysLeft === 1 ? 'يوم' : 'أيام'} متبقية
                        </Badge>
                        <span className="font-medium text-sm">
                          {contract.contract_number}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {contract.customer?.name} - {contract.vehicle?.brand} {contract.vehicle?.model}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        ينتهي في: {new Date(contract.end_date).toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleReturnVehicle(contract.id)}
                    >
                      <Car className="h-4 w-4 ml-1" />
                      إرجاع
                    </Button>
                  </div>
                );
              })}
              {expiringContracts.length > 3 && (
                <div className="text-center text-sm text-muted-foreground">
                  و {expiringContracts.length - 3} عقود أخرى تنتهي قريباً
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {selectedContractId && (
        <VehicleReturnDialog
          contractId={selectedContractId}
          open={showReturnDialog}
          onOpenChange={setShowReturnDialog}
        />
      )}
    </>
  );
}
