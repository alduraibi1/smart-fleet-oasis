
import { FixedSizeList as List } from 'react-window';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { forwardRef, memo } from 'react';

interface Column<T> {
  key: keyof T;
  label: string;
  width?: number;
  render?: (value: any, item: T) => React.ReactNode;
}

interface VirtualizedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  height?: number;
  itemHeight?: number;
  selectable?: boolean;
  selectedItems?: string[];
  onSelectItem?: (id: string) => void;
  onSelectAll?: (checked: boolean) => void;
  getItemId: (item: T) => string;
}

interface RowProps<T> {
  index: number;
  style: React.CSSProperties;
  data: {
    items: T[];
    columns: Column<T>[];
    selectable?: boolean;
    selectedItems?: string[];
    onSelectItem?: (id: string) => void;
    getItemId: (item: T) => string;
  };
}

const Row = memo(<T,>({ index, style, data }: RowProps<T>) => {
  const { items, columns, selectable, selectedItems = [], onSelectItem, getItemId } = data;
  const item = items[index];
  const itemId = getItemId(item);
  const isSelected = selectedItems.includes(itemId);

  return (
    <div style={style} className="flex items-center border-b">
      {selectable && (
        <div className="w-12 px-3 flex items-center">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelectItem?.(itemId)}
          />
        </div>
      )}
      {columns.map((column, colIndex) => {
        const value = item[column.key];
        const content = column.render ? column.render(value, item) : String(value || '');
        
        return (
          <div
            key={`${itemId}-${String(column.key)}`}
            className="px-4 py-2 text-sm flex-1"
            style={{ width: column.width }}
          >
            {content}
          </div>
        );
      })}
    </div>
  );
});

Row.displayName = 'VirtualizedTableRow';

export function VirtualizedTable<T>({
  data,
  columns,
  height = 400,
  itemHeight = 50,
  selectable = false,
  selectedItems = [],
  onSelectItem,
  onSelectAll,
  getItemId
}: VirtualizedTableProps<T>) {
  const handleSelectAll = (checked: boolean) => {
    onSelectAll?.(checked);
  };

  const isAllSelected = selectable && selectedItems.length > 0 && selectedItems.length === data.length;
  const isIndeterminate = selectable && selectedItems.length > 0 && selectedItems.length < data.length;

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="border-b bg-muted/50">
        <div className="flex items-center">
          {selectable && (
            <div className="w-12 px-3 py-3 flex items-center">
              <Checkbox
                checked={isAllSelected}
                // @ts-ignore - indeterminate is supported
                indeterminate={isIndeterminate}
                onCheckedChange={handleSelectAll}
              />
            </div>
          )}
          {columns.map((column) => (
            <div
              key={String(column.key)}
              className="px-4 py-3 text-sm font-medium flex-1"
              style={{ width: column.width }}
            >
              {column.label}
            </div>
          ))}
        </div>
      </div>

      {/* Virtual Body */}
      <List
        height={height}
        itemCount={data.length}
        itemSize={itemHeight}
        itemData={{
          items: data,
          columns,
          selectable,
          selectedItems,
          onSelectItem,
          getItemId
        }}
      >
        {Row}
      </List>
    </div>
  );
}
