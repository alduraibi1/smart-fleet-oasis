import { Shield, Wrench, FileText } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VehicleExpiryBadgesProps {
  insuranceExpiry?: string;
  inspectionExpiry?: string;
  registrationExpiry?: string;
  className?: string;
}

export const VehicleExpiryBadges = ({
  insuranceExpiry,
  inspectionExpiry,
  registrationExpiry,
  className = '',
}: VehicleExpiryBadgesProps) => {
  const getExpiryStatus = (expiryDate?: string, warningDays = 30) => {
    if (!expiryDate) return { status: 'unknown', daysUntil: null, color: 'text-muted-foreground' };

    try {
      const expiry = parseISO(expiryDate);
      const daysUntil = differenceInDays(expiry, new Date());

      if (daysUntil < 0) {
        return { status: 'expired', daysUntil, color: 'text-destructive' };
      } else if (daysUntil <= 7) {
        return { status: 'critical', daysUntil, color: 'text-destructive' };
      } else if (daysUntil <= warningDays) {
        return { status: 'warning', daysUntil, color: 'text-warning' };
      } else {
        return { status: 'valid', daysUntil, color: 'text-success' };
      }
    } catch {
      return { status: 'error', daysUntil: null, color: 'text-muted-foreground' };
    }
  };

  const insuranceStatus = getExpiryStatus(insuranceExpiry, 30);
  const inspectionStatus = getExpiryStatus(inspectionExpiry, 30);
  const registrationStatus = getExpiryStatus(registrationExpiry, 30);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'expired':
      case 'critical':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'valid':
        return '✅';
      default:
        return '❓';
    }
  };

  const getTooltipMessage = (type: string, status: any, date?: string) => {
    if (!date) return `${type}: غير محدد`;
    
    if (status.status === 'expired') {
      return `${type}: منتهي منذ ${Math.abs(status.daysUntil!)} يوم\nتاريخ الانتهاء: ${date}`;
    } else if (status.daysUntil !== null) {
      return `${type}: ينتهي في ${status.daysUntil} يوم\nتاريخ الانتهاء: ${date}`;
    }
    return `${type}: ${date}`;
  };

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 ${className}`}>
        {/* التأمين */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center gap-1 cursor-help ${insuranceStatus.color}`}>
              <Shield className="h-4 w-4" />
              <span className="text-xs">{getStatusIcon(insuranceStatus.status)}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="whitespace-pre-line">
              {getTooltipMessage('التأمين', insuranceStatus, insuranceExpiry)}
            </p>
          </TooltipContent>
        </Tooltip>

        {/* الفحص */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center gap-1 cursor-help ${inspectionStatus.color}`}>
              <Wrench className="h-4 w-4" />
              <span className="text-xs">{getStatusIcon(inspectionStatus.status)}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="whitespace-pre-line">
              {getTooltipMessage('الفحص الدوري', inspectionStatus, inspectionExpiry)}
            </p>
          </TooltipContent>
        </Tooltip>

        {/* الاستمارة */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center gap-1 cursor-help ${registrationStatus.color}`}>
              <FileText className="h-4 w-4" />
              <span className="text-xs">{getStatusIcon(registrationStatus.status)}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="whitespace-pre-line">
              {getTooltipMessage('الاستمارة', registrationStatus, registrationExpiry)}
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};