import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'success' | 'warning' | 'pending' | 'error';
  text: string;
  showIcon?: boolean;
  className?: string;
}

export function StatusIndicator({ status, text, showIcon = true, className = '' }: StatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          dotColor: 'bg-green-500'
        };
      case 'warning':
        return {
          icon: AlertCircle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          dotColor: 'bg-yellow-500'
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          dotColor: 'bg-blue-500'
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          dotColor: 'bg-red-500'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          dotColor: 'bg-gray-500'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border ${config.bgColor} ${config.borderColor} ${className}`}>
      {showIcon && <Icon className={`h-4 w-4 ${config.color}`} />}
      <span className={`text-sm font-medium ${config.color}`}>{text}</span>
      {status === 'pending' && <div className={`h-2 w-2 rounded-full ${config.dotColor} animate-pulse`}></div>}
    </div>
  );
}