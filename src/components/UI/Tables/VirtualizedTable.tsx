
import { FixedSizeList as List } from 'react-window';
import { Checkbox } from '@/components/ui/checkbox';
import { memo } from 'react';

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

interface RowData {
  items: any[];
  columns: Column<any>[];
  selectable?: boolean;
  selectedItems?: string[];
  onSelectItem?: (id: string) => void;
  getItemId: (item: any) => string;
}

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: RowData;
}

const VirtualizedRow = memo(({ index, style, data }: RowProps) => {
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

VirtualizedRow.displayName = 'VirtualizedRow';

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

  const rowData: RowData = {
    items: data,
    columns: columns as Column<any>[],
    selectable,
    selectedItems,
    onSelectItem,
    getItemId: getItemId as (item: any) => string
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="border-b bg-muted/50">
        <div className="flex items-center">
          {selectable && (
            <div className="w-12 px-3 py-3 flex items-center">
              <Checkbox
                checked={isAllSelected}
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
        width="100%"
        itemCount={data.length}
        itemSize={itemHeight}
        itemData={rowData}
      >
        {VirtualizedRow}
      </List>
    </div>
  );
}
