
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, CheckCircle } from 'lucide-react';
import { differenceInDays, format, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useSystemSettings } from '@/hooks/useSystemSettings';

interface VehicleRegistrationExpiryProps {
  registrationExpiry?: string;
  className?: string;
}

export function VehicleRegistrationExpiry({ registrationExpiry, className }: VehicleRegistrationExpiryProps) {
  const { settings } = useSystemSettings();
  const [status, setStatus] = useState<'valid' | 'warning' | 'expired'>('valid');
  const [daysUntilExpiry, setDaysUntilExpiry] = useState<number>(0);

  useEffect(() => {
    if (!registrationExpiry) return;

    try {
      const expiryDate = parseISO(registrationExpiry);
      const today = new Date();
      const days = differenceInDays(expiryDate, today);
      
      setDaysUntilExpiry(days);

      if (days < 0) {
        setStatus('expired');
      } else if (days <= settings.registrationExpiryWarningDays) {
        setStatus('warning');
      } else {
        setStatus('valid');
      }
    } catch (error) {
      console.error('Error parsing registration expiry date:', error);
    }
  }, [registrationExpiry, settings.registrationExpiryWarningDays]);

  if (!registrationExpiry) {
    return (
      <Badge variant="secondary" className={className}>
        <Calendar className="h-3 w-3 ml-1" />
        غير محدد
      </Badge>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ar });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'expired':
        return (
          <Badge variant="destructive" className={className}>
            <AlertTriangle className="h-3 w-3 ml-1" />
            منتهي الصلاحية
          </Badge>
        );
      case 'warning':
        return (
          <Badge variant="secondary" className={`bg-orange-100 text-orange-800 border-orange-200 ${className}`}>
            <AlertTriangle className="h-3 w-3 ml-1" />
            {daysUntilExpiry === 0 ? 'ينتهي اليوم' : `${daysUntilExpiry} يوم متبقي`}
          </Badge>
        );
      case 'valid':
        return (
          <Badge variant="secondary" className={`bg-green-100 text-green-800 border-green-200 ${className}`}>
            <CheckCircle className="h-3 w-3 ml-1" />
            صالح - {formatDate(registrationExpiry)}
          </Badge>
        );
      default:
        return null;
    }
  };

  return getStatusBadge();
}
