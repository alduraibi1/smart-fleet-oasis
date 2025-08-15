
import { Badge } from '@/components/ui/badge';
import { Archive, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ArchivedBadgeProps {
  isArchived?: boolean;
  onRestore?: () => void;
  isRestoring?: boolean;
  className?: string;
}

export const ArchivedBadge = ({ 
  isArchived, 
  onRestore, 
  isRestoring,
  className 
}: ArchivedBadgeProps) => {
  if (!isArchived) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant="outline" className="bg-muted text-muted-foreground">
        <Archive className="h-3 w-3 ml-1" />
        مؤرشف
      </Badge>
      {onRestore && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRestore}
          disabled={isRestoring}
          className="h-6 px-2 text-xs"
        >
          {isRestoring ? (
            "جاري الاستعادة..."
          ) : (
            <>
              <RotateCcw className="h-3 w-3 ml-1" />
              استعادة
            </>
          )}
        </Button>
      )}
    </div>
  );
};
