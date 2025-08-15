
import { Badge } from './badge';
import { Button } from './button';
import { Trash2, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';

export type SoftDeleteFilter = 'active' | 'archived' | 'all';

interface SoftDeleteFilterProps {
  value: SoftDeleteFilter;
  onChange: (value: SoftDeleteFilter) => void;
  archivedCount?: number;
}

export const SoftDeleteFilterComponent = ({ 
  value, 
  onChange, 
  archivedCount = 0 
}: SoftDeleteFilterProps) => {
  const { t } = useI18n();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">عرض:</span>
      <div className="flex gap-1">
        <Button
          variant={value === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange('active')}
          className="gap-2"
        >
          <Eye className="h-4 w-4" />
          النشط
        </Button>
        <Button
          variant={value === 'archived' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange('archived')}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          المؤرشف
          {archivedCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {archivedCount}
            </Badge>
          )}
        </Button>
        <Button
          variant={value === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange('all')}
          className="gap-2"
        >
          <EyeOff className="h-4 w-4" />
          الكل
        </Button>
      </div>
    </div>
  );
};

interface SoftDeleteActionsProps {
  isDeleted: boolean;
  onDelete: () => void;
  onRestore: () => void;
  isLoading?: boolean;
}

export const SoftDeleteActions = ({ 
  isDeleted, 
  onDelete, 
  onRestore, 
  isLoading = false 
}: SoftDeleteActionsProps) => {
  const { t } = useI18n();

  if (isDeleted) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onRestore}
        disabled={isLoading}
        className="gap-2 text-success hover:text-success"
      >
        <RotateCcw className="h-4 w-4" />
        استعادة
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onDelete}
      disabled={isLoading}
      className="gap-2 text-destructive hover:text-destructive"
    >
      <Trash2 className="h-4 w-4" />
      أرشفة
    </Button>
  );
};
