import { Card } from '@/components/ui/card';
import { Shield, ClipboardCheck, Calendar, AlertTriangle } from 'lucide-react';
import { Vehicle } from '@/types/vehicle';
import { differenceInDays, parseISO } from 'date-fns';
import { useSystemSettings } from '@/hooks/useSystemSettings';

interface VehicleExpiryDashboardProps {
  vehicles: Vehicle[];
  onFilterChange: (filter: { type: 'insurance' | 'inspection' | 'registration'; status: 'expired' | 'expiring' | 'valid' }) => void;
}

export const VehicleExpiryDashboard = ({ vehicles, onFilterChange }: VehicleExpiryDashboardProps) => {
  const { settings } = useSystemSettings();
  const warningDays = settings?.registrationExpiryWarning || 30;

  const getExpiryStats = (dateField: 'insurance_expiry' | 'inspection_expiry' | 'registration_expiry') => {
    const today = new Date();
    let expired = 0;
    let expiring = 0;
    let valid = 0;

    vehicles.forEach(vehicle => {
      const expiryDate = vehicle[dateField];
      if (!expiryDate) {
        valid++;
        return;
      }

      try {
        const expiry = parseISO(expiryDate);
        const daysUntil = differenceInDays(expiry, today);

        if (daysUntil < 0) {
          expired++;
        } else if (daysUntil <= warningDays) {
          expiring++;
        } else {
          valid++;
        }
      } catch {
        valid++;
      }
    });

    return { expired, expiring, valid };
  };

  const insuranceStats = getExpiryStats('insurance_expiry');
  const inspectionStats = getExpiryStats('inspection_expiry');
  const registrationStats = getExpiryStats('registration_expiry');

  const cards = [
    {
      title: 'التأمين',
      icon: Shield,
      stats: insuranceStats,
      type: 'insurance' as const,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      title: 'الفحص الدوري',
      icon: ClipboardCheck,
      stats: inspectionStats,
      type: 'inspection' as const,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      title: 'رخصة السير',
      icon: Calendar,
      stats: registrationStats,
      type: 'registration' as const,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.type} className={`p-4 border-2 ${card.borderColor} ${card.bgColor} hover:shadow-lg transition-all`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <h3 className="text-lg font-bold">{card.title}</h3>
            </div>

            <div className="space-y-2">
              {/* Expired */}
              <button
                onClick={() => onFilterChange({ type: card.type, status: 'expired' })}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors border border-red-200"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-700">منتهي</span>
                </div>
                <span className="text-2xl font-bold text-red-600">{card.stats.expired}</span>
              </button>

              {/* Expiring Soon */}
              <button
                onClick={() => onFilterChange({ type: card.type, status: 'expiring' })}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-colors border border-yellow-200"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-700">قريب الانتهاء</span>
                </div>
                <span className="text-2xl font-bold text-yellow-600">{card.stats.expiring}</span>
              </button>

              {/* Valid */}
              <button
                onClick={() => onFilterChange({ type: card.type, status: 'valid' })}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-green-50 hover:bg-green-100 transition-colors border border-green-200"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">ساري</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{card.stats.valid}</span>
              </button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
