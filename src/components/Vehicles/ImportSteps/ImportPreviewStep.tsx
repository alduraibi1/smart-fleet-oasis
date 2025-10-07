import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, AlertTriangle, Edit2, Save, X } from 'lucide-react';
import { VehicleImportData, ValidationError } from '@/utils/vehicleImportValidation';

interface ImportPreviewStepProps {
  previewData: VehicleImportData[];
  validationErrors: Map<number, ValidationError[]>;
  onDataUpdate?: (index: number, updatedData: VehicleImportData) => void;
}

const ImportPreviewStep: React.FC<ImportPreviewStepProps> = ({ 
  previewData, 
  validationErrors,
  onDataUpdate 
}) => {
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<VehicleImportData | null>(null);

  const getRowErrors = (index: number): ValidationError[] => {
    return validationErrors.get(index) || [];
  };

  const hasErrors = (index: number): boolean => {
    return getRowErrors(index).some(e => e.severity === 'error');
  };

  const hasWarnings = (index: number): boolean => {
    return getRowErrors(index).some(e => e.severity === 'warning');
  };

  const totalErrors = Array.from(validationErrors.values()).flat().filter(e => e.severity === 'error').length;
  const totalWarnings = Array.from(validationErrors.values()).flat().filter(e => e.severity === 'warning').length;

  const handleEditClick = (index: number) => {
    setEditingRow(index);
    setEditedData({ ...previewData[index] });
  };

  const handleSaveEdit = (index: number) => {
    if (editedData && onDataUpdate) {
      onDataUpdate(index, editedData);
    }
    setEditingRow(null);
    setEditedData(null);
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditedData(null);
  };

  const handleFieldChange = (field: keyof VehicleImportData, value: any) => {
    if (editedData) {
      setEditedData({ ...editedData, [field]: value });
    }
  };

  return (
    <div className="space-y-4">
      {totalErrors > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            تم العثور على {totalErrors} خطأ. يجب تصحيح الأخطاء قبل المتابعة.
          </AlertDescription>
        </Alert>
      )}

      {totalWarnings > 0 && totalErrors === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            تم العثور على {totalWarnings} تحذير. يمكنك المتابعة لكن ننصح بمراجعة التحذيرات.
          </AlertDescription>
        </Alert>
      )}

      {totalErrors === 0 && totalWarnings === 0 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            جميع البيانات صحيحة ومعدة للاستيراد ({previewData.length} مركبة)
          </AlertDescription>
        </Alert>
      )}

      <div className="overflow-x-auto max-h-[500px] border rounded-lg">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-muted sticky top-0 z-10">
            <tr>
              <th className="border p-2 text-right">#</th>
              <th className="border p-2 text-right w-10">تعديل</th>
              <th className="border p-2 text-right">رقم اللوحة</th>
              <th className="border p-2 text-right">نوع التسجيل</th>
              <th className="border p-2 text-right">الماركة</th>
              <th className="border p-2 text-right">الطراز</th>
              <th className="border p-2 text-right">السنة</th>
              <th className="border p-2 text-right">المالك</th>
              <th className="border p-2 text-right">حالة الفحص</th>
              <th className="border p-2 text-right">حالة التأمين</th>
              <th className="border p-2 text-right">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {previewData.map((item, index) => {
              const rowHasErrors = hasErrors(index);
              const rowHasWarnings = hasWarnings(index);
              const rowErrors = getRowErrors(index);
              const isEditing = editingRow === index;
              const displayData = isEditing && editedData ? editedData : item;

              return (
                <React.Fragment key={index}>
                  <tr className={`
                    ${rowHasErrors ? 'bg-destructive/10' : rowHasWarnings ? 'bg-warning/10' : ''}
                    ${isEditing ? 'ring-2 ring-primary' : ''}
                  `}>
                    <td className="border p-2">
                      {rowHasErrors ? (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="h-3 w-3 ml-1" />
                          خطأ
                        </Badge>
                      ) : rowHasWarnings ? (
                        <Badge variant="outline" className="text-xs bg-warning/20">
                          <AlertTriangle className="h-3 w-3 ml-1" />
                          تحذير
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs bg-success/20">
                          <CheckCircle className="h-3 w-3 ml-1" />
                          صحيح
                        </Badge>
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSaveEdit(index)}
                            className="h-6 w-6 p-0"
                          >
                            <Save className="h-3 w-3 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelEdit}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditClick(index)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <Input
                          value={displayData.plate_number}
                          onChange={(e) => handleFieldChange('plate_number', e.target.value)}
                          className="h-7 text-xs"
                        />
                      ) : (
                        displayData.plate_number
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <Input
                          value={displayData.registration_type || ''}
                          onChange={(e) => handleFieldChange('registration_type', e.target.value)}
                          className="h-7 text-xs"
                        />
                      ) : (
                        displayData.registration_type || '-'
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <Input
                          value={displayData.brand}
                          onChange={(e) => handleFieldChange('brand', e.target.value)}
                          className="h-7 text-xs"
                        />
                      ) : (
                        displayData.brand
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <Input
                          value={displayData.model}
                          onChange={(e) => handleFieldChange('model', e.target.value)}
                          className="h-7 text-xs"
                        />
                      ) : (
                        displayData.model
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={displayData.year}
                          onChange={(e) => handleFieldChange('year', parseInt(e.target.value))}
                          className="h-7 text-xs w-20"
                        />
                      ) : (
                        displayData.year
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <Input
                          value={displayData.owner_name || ''}
                          onChange={(e) => handleFieldChange('owner_name', e.target.value)}
                          className="h-7 text-xs"
                        />
                      ) : (
                        displayData.owner_name || '-'
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <Input
                          value={displayData.inspection_status || ''}
                          onChange={(e) => handleFieldChange('inspection_status', e.target.value)}
                          className="h-7 text-xs"
                        />
                      ) : (
                        <Badge variant={
                          displayData.inspection_status === 'صالح' || displayData.inspection_status === 'valid' 
                            ? 'default' 
                            : 'destructive'
                        } className="text-xs">
                          {displayData.inspection_status || '-'}
                        </Badge>
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <Input
                          value={displayData.insurance_status || ''}
                          onChange={(e) => handleFieldChange('insurance_status', e.target.value)}
                          className="h-7 text-xs"
                        />
                      ) : (
                        <Badge variant={
                          displayData.insurance_status === 'صالح' || displayData.insurance_status === 'valid' 
                            ? 'default' 
                            : 'destructive'
                        } className="text-xs">
                          {displayData.insurance_status || '-'}
                        </Badge>
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <Input
                          value={displayData.status || ''}
                          onChange={(e) => handleFieldChange('status', e.target.value)}
                          className="h-7 text-xs"
                        />
                      ) : (
                        displayData.status || 'available'
                      )}
                    </td>
                  </tr>
                  {rowErrors.length > 0 && (
                    <tr>
                      <td colSpan={11} className="border-0 p-0">
                        <div className="px-4 py-2 bg-muted/50 space-y-1">
                          {rowErrors.map((error, errorIndex) => (
                            <div key={errorIndex} className="flex items-start gap-2 text-xs">
                              {error.severity === 'error' ? (
                                <AlertCircle className="h-3 w-3 text-destructive mt-0.5" />
                              ) : (
                                <AlertTriangle className="h-3 w-3 text-warning mt-0.5" />
                              )}
                              <span className={error.severity === 'error' ? 'text-destructive' : 'text-warning'}>
                                {error.field}: {error.message}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ImportPreviewStep;
