import React from 'react';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { differenceInDays, parseISO, format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck, AlertTriangle } from 'lucide-react';

interface VehicleInspectionExpiryProps {
  expiryDate?: string;
  className?: string;
  showLabel?: boolean;
}

export const VehicleInspectionExpiry: React.FC<VehicleInspectionExpiryProps> = ({ 
  expiryDate, 
  className = "",
  showLabel = false
}) => {
  const { settings } = useSystemSettings();
  
  if (!expiryDate) {
    return showLabel ? (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant="secondary" className="flex items-center gap-1">
          <ClipboardCheck className="h-3 w-3" />
          غير محدد
        </Badge>
      </div>
    ) : null;
  }

  if (!settings) return null;

  try {
    const expiry = parseISO(expiryDate);
    const today = new Date();
    const daysUntilExpiry = differenceInDays(expiry, today);
    const warningDays = settings.registrationExpiryWarning || 30;
    
    const isExpired = daysUntilExpiry < 0;
    const isNearExpiry = daysUntilExpiry <= warningDays && daysUntilExpiry >= 0;
    
    // Always show status
    const getVariant = () => {
      if (isExpired) return 'destructive';
      if (isNearExpiry) return 'default';
      return 'secondary';
    };

    const getMessage = () => {
      if (isExpired) {
        return `منتهي منذ ${Math.abs(daysUntilExpiry)} يوم`;
      }
      if (isNearExpiry) {
        return `ينتهي خلال ${daysUntilExpiry} يوم`;
      }
      return `ساري حتى ${format(expiry, 'dd/MM/yyyy', { locale: ar })}`;
    };

    const getColor = () => {
      if (isExpired) return 'text-red-600 bg-red-50 border-red-200';
      if (isNearExpiry) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      return 'text-green-600 bg-green-50 border-green-200';
    };

    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant={getVariant()} className={`flex items-center gap-1 ${getColor()}`}>
          {isExpired ? (
            <AlertTriangle className="h-3 w-3" />
          ) : (
            <ClipboardCheck className="h-3 w-3" />
          )}
          {showLabel && <span className="font-medium">الفحص:</span>}
          {getMessage()}
        </Badge>
      </div>
    );
  } catch (error) {
    console.error('Error parsing inspection expiry date:', error);
    return null;
  }
};
