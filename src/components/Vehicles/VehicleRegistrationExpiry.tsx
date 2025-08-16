
import React from 'react';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { differenceInDays, parseISO, format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertTriangle } from 'lucide-react';

interface VehicleRegistrationExpiryProps {
  expiryDate?: string;
  className?: string;
}

export const VehicleRegistrationExpiry: React.FC<VehicleRegistrationExpiryProps> = ({ 
  expiryDate, 
  className = "" 
}) => {
  const { settings } = useSystemSettings();
  
  if (!expiryDate || !settings) {
    return null;
  }

  try {
    const expiry = parseISO(expiryDate);
    const today = new Date();
    const daysUntilExpiry = differenceInDays(expiry, today);
    const warningDays = settings.registrationExpiryWarning || 30;
    
    const isExpired = daysUntilExpiry < 0;
    const isNearExpiry = daysUntilExpiry <= warningDays && daysUntilExpiry >= 0;
    
    if (!isExpired && !isNearExpiry) {
      return null;
    }

    const getVariant = () => {
      if (isExpired) return 'destructive';
      if (isNearExpiry) return 'default';
      return 'secondary';
    };

    const getMessage = () => {
      if (isExpired) {
        return `منتهي الصلاحية منذ ${Math.abs(daysUntilExpiry)} يوم`;
      }
      return `ينتهي خلال ${daysUntilExpiry} يوم`;
    };

    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant={getVariant()} className="flex items-center gap-1">
          {isExpired ? (
            <AlertTriangle className="h-3 w-3" />
          ) : (
            <Calendar className="h-3 w-3" />
          )}
          {getMessage()}
        </Badge>
      </div>
    );
  } catch (error) {
    console.error('Error parsing expiry date:', error);
    return null;
  }
};
