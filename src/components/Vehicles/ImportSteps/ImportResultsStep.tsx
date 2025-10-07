import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ImportResult {
  success: number;
  failed: number;
  warnings: number;
  errors: Array<{
    row: number;
    plate: string;
    message: string;
  }>;
}

interface ImportResultsStepProps {
  results: ImportResult;
}

const ImportResultsStep: React.FC<ImportResultsStepProps> = ({ results }) => {
  const total = results.success + results.failed;
  const successRate = total > 0 ? ((results.success / total) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg bg-green-50 border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">نجح</span>
          </div>
          <div className="text-2xl font-bold text-green-700">{results.success}</div>
          <div className="text-xs text-green-600 mt-1">مركبة تم استيرادها</div>
        </div>

        <div className="p-4 border rounded-lg bg-red-50 border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-900">فشل</span>
          </div>
          <div className="text-2xl font-bold text-red-700">{results.failed}</div>
          <div className="text-xs text-red-600 mt-1">صف فشل</div>
        </div>

        <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">تحذيرات</span>
          </div>
          <div className="text-2xl font-bold text-yellow-700">{results.warnings}</div>
          <div className="text-xs text-yellow-600 mt-1">مركبة بتحذيرات</div>
        </div>
      </div>

      <Alert className={results.failed === 0 ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
        <CheckCircle className={`h-4 w-4 ${results.failed === 0 ? 'text-green-600' : 'text-yellow-600'}`} />
        <AlertDescription className={results.failed === 0 ? 'text-green-800' : 'text-yellow-800'}>
          معدل النجاح: {successRate}% ({results.success} من {total})
        </AlertDescription>
      </Alert>

      {results.errors.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <XCircle className="h-4 w-4 text-destructive" />
            تفاصيل الأخطاء
          </h4>
          <div className="max-h-48 overflow-y-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="border p-2 text-right">الصف</th>
                  <th className="border p-2 text-right">رقم اللوحة</th>
                  <th className="border p-2 text-right">الخطأ</th>
                </tr>
              </thead>
              <tbody>
                {results.errors.map((error, index) => (
                  <tr key={index} className="hover:bg-muted/50">
                    <td className="border p-2">
                      <Badge variant="destructive" className="text-xs">
                        {error.row}
                      </Badge>
                    </td>
                    <td className="border p-2 font-medium">{error.plate}</td>
                    <td className="border p-2 text-destructive">{error.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportResultsStep;
