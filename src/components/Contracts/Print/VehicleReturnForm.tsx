import { PrintLayout } from './PrintLayout';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { Camera, FileText, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { VehicleDiagram, DamagePoint } from '../VehicleDiagram';

interface VehicleReturnFormProps {
  contract: any;
  returnData?: {
    mileageOut: number;
    fuelLevelOut: string;
    photos?: string[];
    damagePoints?: DamagePoint[];
    damages: Array<{ 
      location?: string;
      severity?: 'minor' | 'moderate' | 'major';
      description: string; 
      cost: number;
      photo?: string;
    }>;
    additionalCharges: {
      lateFee: number;
      fuelFee: number;
      cleaningFee: number;
      mileageFee?: number;
      other: number;
    };
    notes: string;
    distance?: number;
    fuelCostDetails?: string;
    inspectorName?: string;
  };
}

export const VehicleReturnForm = ({ contract, returnData }: VehicleReturnFormProps) => {
  const verificationUrl = `${window.location.origin}/contracts/${contract.id}/return`;

  const totalCharges = returnData?.additionalCharges
    ? Object.values(returnData.additionalCharges).reduce((sum, val) => sum + val, 0)
    : 0;
  
  const damagesCost = returnData?.damages?.reduce((sum, d) => sum + d.cost, 0) || 0;
  const totalDeductions = totalCharges + damagesCost;
  const refund = (contract.deposit_amount || 0) - totalDeductions;

  return (
    <PrintLayout title="نموذج تسليم وإرجاع المركبة" showLogo showSeal>
      <div className="space-y-5 text-sm">
        {/* Header Section - معلومات العقد */}
        <div className="flex justify-between items-start bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-4 shadow-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-600" />
              <p className="font-bold text-lg text-red-900">رقم العقد: {contract.contract_number}</p>
            </div>
            <p className="text-gray-700 text-xs flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="font-semibold">تاريخ الإرجاع:</span>
              {format(new Date(), 'dd/MM/yyyy - HH:mm')}
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <QRCodeSVG value={verificationUrl} size={70} className="border-4 border-white shadow-md rounded" />
            <p className="text-[10px] text-gray-600">رمز التحقق</p>
          </div>
        </div>

        {/* معلومات العميل والمركبة */}
        <div className="grid grid-cols-2 gap-4">
          <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3 border-b border-green-300 pb-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">👤</span>
              </div>
              <h3 className="font-bold text-green-900">معلومات العميل</h3>
            </div>
            <div className="space-y-2">
              <p className="flex justify-between">
                <span className="text-gray-600 font-medium">الاسم:</span>
                <span className="font-semibold text-gray-900">{contract.customers?.name}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600 font-medium">الهاتف:</span>
                <span className="font-semibold text-gray-900 direction-ltr">{contract.customers?.phone}</span>
              </p>
            </div>
          </div>
          
          <div className="border-2 border-purple-200 bg-purple-50 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3 border-b border-purple-300 pb-2">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🚗</span>
              </div>
              <h3 className="font-bold text-purple-900">معلومات المركبة</h3>
            </div>
            <div className="space-y-2">
              <p className="flex justify-between">
                <span className="text-gray-600 font-medium">النوع:</span>
                <span className="font-semibold text-gray-900">{contract.vehicles?.brand} {contract.vehicles?.model}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600 font-medium">اللوحة:</span>
                <span className="font-semibold text-gray-900 bg-yellow-100 px-2 py-1 rounded border border-yellow-400">{contract.vehicles?.plate_number}</span>
              </p>
            </div>
          </div>
        </div>

        {/* القراءات عند الإرجاع */}
        <div className="border-3 border-orange-400 rounded-xl p-5 bg-gradient-to-br from-orange-50 via-white to-amber-50 shadow-lg">
          <div className="flex items-center gap-2 mb-4 border-b-2 border-orange-300 pb-3">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center shadow-md">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-xl text-orange-900">القراءات عند الإرجاع</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-lg p-3 shadow-md border-l-4 border-blue-400">
              <p className="font-semibold text-xs text-gray-600 mb-2">عداد الاستلام</p>
              <p className="text-2xl font-bold text-blue-900">
                {contract.odometer_start || contract.mileage_start || '__'} <span className="text-sm">كم</span>
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-md border-l-4 border-orange-500">
              <p className="font-semibold text-xs text-gray-600 mb-2">عداد الإرجاع</p>
              <p className="text-2xl font-bold text-orange-900">
                {contract.odometer_end || returnData?.mileageOut || '__'} <span className="text-sm">كم</span>
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-lg p-3 shadow-md border-l-4 border-green-600">
              <p className="font-semibold text-xs text-green-700 mb-2">المسافة المقطوعة</p>
              <p className="text-2xl font-black text-green-900">
                {returnData?.distance || 
                  ((contract.odometer_end || returnData?.mileageOut) && (contract.odometer_start || contract.mileage_start)
                    ? `${(contract.odometer_end || returnData?.mileageOut) - (contract.odometer_start || contract.mileage_start)}`
                    : '__')} <span className="text-sm">كم</span>
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-lg border-2 border-orange-200 shadow-sm">
              <p className="text-xs text-gray-600 font-semibold flex items-center gap-1 mb-1">
                <span>📅</span> تاريخ الإرجاع الفعلي
              </p>
              <p className="font-bold text-orange-900">{format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
            </div>
            {returnData?.inspectorName && (
              <div className="bg-white p-3 rounded-lg border-2 border-blue-200 shadow-sm">
                <p className="text-xs text-gray-600 font-semibold flex items-center gap-1 mb-1">
                  <span>👨‍💼</span> المفتش
                </p>
                <p className="font-bold text-blue-900">{returnData.inspectorName}</p>
              </div>
            )}
          </div>
        </div>

        {/* مستوى الوقود */}
        <div className="border-2 border-cyan-200 rounded-xl p-4 bg-gradient-to-br from-cyan-50 to-white shadow-md">
          <div className="flex items-center gap-2 mb-3 border-b border-cyan-300 pb-2">
            <span className="text-2xl">⛽</span>
            <h3 className="font-bold text-cyan-900 text-lg">مستوى الوقود</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-3 border-2 border-cyan-200 shadow-sm">
              <p className="text-gray-600 text-xs font-semibold mb-1">عند الاستلام</p>
              <p className="font-bold text-cyan-900 text-lg">{contract.fuel_level_start || 'غير محدد'}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border-2 border-orange-200 shadow-sm">
              <p className="text-gray-600 text-xs font-semibold mb-1">عند الإرجاع</p>
              <p className="font-bold text-orange-900 text-lg">{contract.fuel_level_end || returnData?.fuelLevelOut || '__'}</p>
            </div>
            {returnData?.fuelCostDetails && (
              <div className="bg-orange-100 rounded-lg p-3 border-2 border-orange-300 shadow-sm">
                <p className="text-orange-700 text-xs font-semibold mb-1">التكلفة</p>
                <p className="font-bold text-orange-900">{returnData.fuelCostDetails}</p>
              </div>
            )}
          </div>
        </div>

        {/* مخطط المركبة مع الأضرار */}
        {returnData?.damagePoints && returnData.damagePoints.length > 0 && (
          <div className="border-3 border-orange-300 rounded-xl p-4 bg-gradient-to-br from-orange-50 to-white shadow-lg">
            <div className="flex items-center gap-2 mb-4 border-b-2 border-orange-300 pb-3">
              <span className="text-2xl">🗺️</span>
              <h3 className="font-bold text-xl text-orange-900">مخطط توزيع الأضرار على المركبة</h3>
            </div>
            <VehicleDiagram
              damages={returnData.damagePoints}
              interactive={false}
              compact
            />
          </div>
        )}

        {/* الأضرار الجديدة */}
        {returnData?.damages && returnData.damages.length > 0 && (
          <div className="border-3 border-red-300 rounded-xl p-4 bg-gradient-to-br from-red-50 to-white shadow-lg">
            <div className="flex items-center gap-2 mb-4 border-b-2 border-red-300 pb-3">
              <AlertCircle className="w-7 h-7 text-red-600" />
              <h3 className="font-bold text-xl text-red-900">الأضرار والخدوش الجديدة</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs shadow-md rounded-lg overflow-hidden">
                <thead className="bg-gradient-to-r from-red-200 to-red-100">
                  <tr>
                    <th className="border border-red-300 p-2 font-bold">#</th>
                    <th className="border border-red-300 p-2 font-bold">الموقع والصورة</th>
                    <th className="border border-red-300 p-2 font-bold">الخطورة</th>
                    <th className="border border-red-300 p-2 font-bold">وصف الضرر</th>
                    <th className="border border-red-300 p-2 font-bold bg-red-200">التكلفة المقدرة</th>
                  </tr>
                </thead>
                <tbody>
                  {returnData.damages.map((damage, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-red-50'}>
                      <td className="border border-red-300 p-2 text-center font-semibold">{index + 1}</td>
                      <td className="border border-red-300 p-2">
                        <div className="flex items-start gap-2">
                          {damage.photo && (
                            <img 
                              src={damage.photo} 
                              alt={`ضرر ${index + 1}`}
                              className="w-16 h-16 object-cover rounded border-2 border-red-300 flex-shrink-0 shadow-sm"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex-1">
                            {damage.location && <p className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded inline-block">{damage.location}</p>}
                            {damage.severity && (
                              <span className={`text-[10px] px-2 py-0.5 rounded inline-block mt-1 ${
                                damage.severity === 'major' ? 'bg-red-200 text-red-900 font-bold' :
                                damage.severity === 'moderate' ? 'bg-orange-200 text-orange-900' :
                                'bg-yellow-200 text-yellow-900'
                              }`}>
                                {damage.severity === 'major' ? '⚠️ خطير' : damage.severity === 'moderate' ? '⚡ متوسط' : '✓ بسيط'}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="border border-red-300 p-2 text-center">
                        {damage.severity === 'minor' && '✓ بسيط'}
                        {damage.severity === 'moderate' && '⚡ متوسط'}
                        {damage.severity === 'major' && '⚠️ كبير'}
                        {!damage.severity && '-'}
                      </td>
                      <td className="border border-red-300 p-2 font-medium">{damage.description}</td>
                      <td className="border border-red-300 p-2 text-left font-bold text-red-700 bg-red-100">
                        {damage.cost.toFixed(2)} ر.س
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gradient-to-r from-red-300 to-red-200 font-black text-red-900">
                    <td colSpan={4} className="border border-red-400 p-3 text-right text-base">
                      ⚠️ إجمالي تكلفة الأضرار:
                    </td>
                    <td className="border border-red-400 p-3 text-left text-lg">
                      {damagesCost.toFixed(2)} ر.س
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* صور المركبة عند الإرجاع */}
        {returnData?.photos && returnData.photos.length > 0 && (
          <div className="border-2 border-blue-200 rounded-xl p-4 bg-gradient-to-br from-blue-50 to-white shadow-md">
            <div className="flex items-center gap-2 mb-4 border-b border-blue-300 pb-2">
              <Camera className="w-6 h-6 text-blue-600" />
              <h3 className="font-bold text-blue-900 text-lg">📸 صور المركبة عند الإرجاع</h3>
            </div>
            <div className="photo-grid grid grid-cols-4 gap-3">
              {returnData.photos.map((photoUrl, index) => (
                <div key={index} className="border-2 border-blue-300 overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow bg-white">
                  <img 
                    src={photoUrl} 
                    alt={`صورة إرجاع ${index + 1}`}
                    className="w-full h-28 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3Eفشل التحميل%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <div className="bg-gradient-to-r from-blue-100 to-blue-50 py-1 px-2 text-center border-t border-blue-300">
                    <p className="text-[10px] font-semibold text-blue-900">صورة {index + 1}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 bg-blue-100 rounded-lg p-2 border border-blue-300">
              <p className="text-xs text-blue-900 flex items-center justify-between">
                <span className="font-semibold">📸 عدد الصور: {returnData.photos.length}</span>
                <span className="text-blue-700">📅 {format(new Date(), 'dd/MM/yyyy HH:mm')}</span>
              </p>
            </div>
          </div>
        )}

        {/* الحسابات النهائية */}
        <div className="border-3 border-indigo-400 rounded-xl overflow-hidden shadow-xl">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="font-bold text-white text-xl">الحسابات النهائية والتسوية المالية</h3>
          </div>
          <table className="w-full">
            <tbody>
              <tr className="bg-gradient-to-r from-gray-100 to-gray-50">
                <td className="border border-gray-300 p-4 font-bold text-gray-800 text-base">💵 المبلغ الأساسي للعقد</td>
                <td className="border border-gray-300 p-4 text-left font-bold text-lg text-gray-900">
                  {contract.total_amount?.toFixed(2) || '0.00'} ر.س
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="border border-gray-300 p-3 bg-gradient-to-r from-yellow-100 to-yellow-50 font-bold text-yellow-900">
                  ➕ رسوم إضافية:
                </td>
              </tr>
              <tr className="bg-white">
                <td className="border border-gray-300 p-3 pr-8 flex items-center gap-2">
                  <span className="text-red-600">⏰</span>
                  رسوم التأخير
                </td>
                <td className="border border-gray-300 p-3 text-left font-semibold">
                  {returnData?.additionalCharges?.lateFee?.toFixed(2) || '0.00'} ر.س
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3 pr-8 flex items-center gap-2">
                  <span className="text-orange-600">⛽</span>
                  رسوم الوقود
                </td>
                <td className="border border-gray-300 p-3 text-left font-semibold">
                  {returnData?.additionalCharges?.fuelFee?.toFixed(2) || '0.00'} ر.س
                </td>
              </tr>
              <tr className="bg-white">
                <td className="border border-gray-300 p-3 pr-8 flex items-center gap-2">
                  <span className="text-blue-600">🧹</span>
                  رسوم التنظيف
                </td>
                <td className="border border-gray-300 p-3 text-left font-semibold">
                  {returnData?.additionalCharges?.cleaningFee?.toFixed(2) || '0.00'} ر.س
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3 pr-8 flex items-center gap-2">
                  <span className="text-red-600">⚠️</span>
                  رسوم الأضرار
                </td>
                <td className="border border-gray-300 p-3 text-left font-bold text-red-700 bg-red-50">
                  {damagesCost.toFixed(2)} ر.س
                </td>
              </tr>
              <tr className="bg-white">
                <td className="border border-gray-300 p-3 pr-8 flex items-center gap-2">
                  <span className="text-purple-600">📏</span>
                  رسوم الكيلومترات الزائدة
                </td>
                <td className="border border-gray-300 p-3 text-left font-semibold">
                  {returnData?.additionalCharges?.mileageFee?.toFixed(2) || '0.00'} ر.س
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3 pr-8 flex items-center gap-2">
                  <span className="text-gray-600">📋</span>
                  رسوم أخرى
                </td>
                <td className="border border-gray-300 p-3 text-left font-semibold">
                  {returnData?.additionalCharges?.other?.toFixed(2) || '0.00'} ر.س
                </td>
              </tr>
              <tr className="bg-gradient-to-r from-yellow-200 to-yellow-100">
                <td className="border-2 border-yellow-400 p-4 font-black text-yellow-900 text-base">
                  📊 إجمالي الرسوم الإضافية
                </td>
                <td className="border-2 border-yellow-400 p-4 text-left font-black text-xl text-yellow-900">
                  {totalDeductions.toFixed(2)} ر.س
                </td>
              </tr>
              <tr className="bg-gradient-to-r from-blue-100 to-blue-50">
                <td className="border border-gray-300 p-4 font-bold text-blue-900 text-base">
                  💳 الوديعة المدفوعة
                </td>
                <td className="border border-gray-300 p-4 text-left font-bold text-lg text-blue-900">
                  {contract.deposit_amount?.toFixed(2) || '0.00'} ر.س
                </td>
              </tr>
              <tr className={`bg-gradient-to-r ${refund >= 0 ? 'from-green-200 to-green-100' : 'from-red-200 to-red-100'}`}>
                <td className={`border-3 ${refund >= 0 ? 'border-green-500' : 'border-red-500'} p-5 font-black text-xl ${refund >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                  {refund >= 0 ? '✅ المبلغ المسترد للعميل' : '⚠️ المتبقي على العميل'}
                </td>
                <td className={`border-3 ${refund >= 0 ? 'border-green-500' : 'border-red-500'} p-5 text-left font-black text-2xl ${refund >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                  {Math.abs(refund).toFixed(2)} ر.س
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ملاحظات */}
        {returnData?.notes && (
          <div className="border-2 border-amber-200 rounded-xl p-4 bg-gradient-to-br from-amber-50 to-white shadow-md">
            <div className="flex items-center gap-2 mb-3 border-b border-amber-300 pb-2">
              <span className="text-2xl">📝</span>
              <h3 className="font-bold text-amber-900 text-lg">ملاحظات</h3>
            </div>
            <div className="bg-white rounded-lg p-3 border-2 border-amber-200">
              <p className="text-sm text-gray-700 leading-relaxed">{returnData.notes}</p>
            </div>
          </div>
        )}

        {/* التوقيعات */}
        <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t-4 border-gray-300">
          <div className="bg-gradient-to-br from-green-50 to-white border-2 border-green-300 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white">✍️</span>
              </div>
              <p className="font-bold text-green-900 text-base">توقيع المستأجر</p>
            </div>
            <p className="text-xs text-gray-600 mb-6 italic bg-green-100 p-2 rounded border-r-4 border-green-600">
              أقر بإعادة المركبة والموافقة على الفحص والتكاليف الإضافية المذكورة أعلاه
            </p>
            <div className="border-t-2 border-green-600 pt-3 mt-12">
              <p className="text-xs mb-1"><span className="font-semibold">الاسم:</span> _____________________</p>
              <p className="text-xs"><span className="font-semibold">التاريخ:</span> {format(new Date(), 'dd/MM/yyyy')}</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-300 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white">✍️</span>
              </div>
              <p className="font-bold text-blue-900 text-base">توقيع الموظف</p>
            </div>
            <p className="text-xs text-gray-600 mb-6 italic bg-blue-100 p-2 rounded border-r-4 border-blue-600">
              أقر باستلام المركبة وصحة الفحص والحسابات المالية المذكورة في هذا النموذج
            </p>
            <div className="border-t-2 border-blue-600 pt-3 mt-12">
              <p className="text-xs mb-1"><span className="font-semibold">الاسم:</span> _____________________</p>
              <p className="text-xs"><span className="font-semibold">التاريخ:</span> {format(new Date(), 'dd/MM/yyyy')}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 pt-4 border-t-3 border-gray-300">
          <div className="bg-gradient-to-r from-green-100 via-blue-50 to-green-100 rounded-lg p-4 shadow-md">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <p className="font-black text-lg text-gray-800">تم إنهاء العقد بنجاح</p>
            </div>
            <p className="text-sm text-gray-700 font-medium">شكراً لاختياركم خدماتنا، ونتطلع لخدمتكم مجدداً</p>
            <p className="text-[10px] text-gray-500 mt-2">هذا المستند يمثل إقراراً قانونياً بحالة المركبة عند الإرجاع</p>
          </div>
        </div>
      </div>
    </PrintLayout>
  );
};