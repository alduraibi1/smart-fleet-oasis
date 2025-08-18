
import React from 'react';

interface ReturnImagePreviewProps {
  files: File[];
  onRemove?: (index: number) => void;
}

const ReturnImagePreview: React.FC<ReturnImagePreviewProps> = ({ files, onRemove }) => {
  if (!files?.length) return null;

  return (
    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {files.map((file, idx) => {
        const url = URL.createObjectURL(file);
        return (
          <div key={idx} className="relative group border rounded-lg overflow-hidden">
            <img
              src={url}
              alt={file.name}
              className="h-28 w-full object-cover"
              onLoad={() => URL.revokeObjectURL(url)}
            />
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="absolute top-1 left-1 text-xs px-2 py-1 rounded bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition"
                aria-label="إزالة الصورة"
              >
                إزالة
              </button>
            )}
            <div className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-[10px] px-2 py-1 truncate">
              {file.name}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReturnImagePreview;
