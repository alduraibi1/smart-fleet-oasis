import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { VehicleImportData, ValidationError } from '@/utils/vehicleImportValidation';

interface ImportPreviewStepProps {
  previewData: VehicleImportData[];
  validationErrors: Map<number, ValidationError[]>;
}

const ImportPreviewStep: React.FC<ImportPreviewStepProps> = ({ previewData, validationErrors }) => {
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

      <div className="overflow-x-auto max-h-96 border rounded-lg">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-muted sticky top-0">
            <tr>
              <th className="border p-2 text-right">#</th>
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

              return (
                <React.Fragment key={index}>
                  <tr className={`
                    ${rowHasErrors ? 'bg-red-50' : rowHasWarnings ? 'bg-yellow-50' : ''}
                  `}>
                    <td className="border p-2">
                      {rowHasErrors ? (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="h-3 w-3 ml-1" />
                          خطأ
                        </Badge>
                      ) : rowHasWarnings ? (
                        <Badge variant="outline" className="text-xs bg-yellow-100">
                          <AlertTriangle className="h-3 w-3 ml-1" />
                          تحذير
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs bg-green-100">
                          <CheckCircle className="h-3 w-3 ml-1" />
                          صحيح
                        </Badge>
                      )}
                    </td>
                    <td className="border p-2">{item.plate_number}</td>
                    <td className="border p-2">{item.registration_type || '-'}</td>
                    <td className="border p-2">{item.brand}</td>
                    <td className="border p-2">{item.model}</td>
                    <td className="border p-2">{item.year}</td>
                    <td className="border p-2">{item.owner_name || '-'}</td>
                    <td className="border p-2">
                      <Badge variant={
                        item.inspection_status === 'صالح' || item.inspection_status === 'valid' 
                          ? 'default' 
                          : 'destructive'
                      } className="text-xs">
                        {item.inspection_status || '-'}
                      </Badge>
                    </td>
                    <td className="border p-2">
                      <Badge variant={
                        item.insurance_status === 'صالح' || item.insurance_status === 'valid' 
                          ? 'default' 
                          : 'destructive'
                      } className="text-xs">
                        {item.insurance_status || '-'}
                      </Badge>
                    </td>
                    <td className="border p-2">{item.status || 'available'}</td>
                  </tr>
                  {rowErrors.length > 0 && (
                    <tr>
                      <td colSpan={10} className="border-0 p-0">
                        <div className="px-4 py-2 bg-muted/50 space-y-1">
                          {rowErrors.map((error, errorIndex) => (
                            <div key={errorIndex} className="flex items-start gap-2 text-xs">
                              {error.severity === 'error' ? (
                                <AlertCircle className="h-3 w-3 text-destructive mt-0.5" />
                              ) : (
                                <AlertTriangle className="h-3 w-3 text-yellow-600 mt-0.5" />
                              )}
                              <span className={error.severity === 'error' ? 'text-destructive' : 'text-yellow-700'}>
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
