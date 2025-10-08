import { PrintLayout } from './PrintLayout';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';

interface VehicleReturnFormProps {
  contract: any;
  returnData?: {
    mileageOut: number;
    fuelLevelOut: string;
    damages: Array<{ description: string; cost: number }>;
    additionalCharges: {
      lateFee: number;
      fuelFee: number;
      cleaningFee: number;
      other: number;
    };
    notes: string;
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
      <div className="space-y-4 text-sm">
        {/* معلومات العقد */}
        <div className="flex justify-between items-center border-b-2 border-gray-300 pb-3">
          <div>
            <p className="font-semibold">رقم العقد: {contract.contract_number}</p>
            <p className="text-gray-600">تاريخ الإرجاع: {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
          </div>
          <QRCodeSVG value={verificationUrl} size={60} />
        </div>

        {/* معلومات العميل والمركبة */}
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-gray-300 rounded p-3">
            <h3 className="font-bold mb-2">معلومات العميل</h3>
            <p><span className="text-gray-600">الاسم:</span> {contract.customers?.name}</p>
            <p><span className="text-gray-600">الهاتف:</span> {contract.customers?.phone}</p>
          </div>
          <div className="border border-gray-300 rounded p-3">
            <h3 className="font-bold mb-2">معلومات المركبة</h3>
            <p><span className="text-gray-600">النوع:</span> {contract.vehicles?.brand} {contract.vehicles?.model}</p>
            <p><span className="text-gray-600">اللوحة:</span> {contract.vehicles?.plate_number}</p>
          </div>
        </div>

        {/* القراءات النهائية */}
        <div className="border-2 border-gray-400 rounded p-3 bg-yellow-50">
          <h3 className="font-bold mb-3 text-lg">القراءات عند الإرجاع</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">عداد الكيلومترات عند الاستلام:</p>
              <div className="border-b border-gray-400 mt-1 pb-1">
                {contract.odometer_start || '_____________'} كم
              </div>
            </div>
            <div>
              <p className="font-semibold">عداد الكيلومترات عند الإرجاع:</p>
              <div className="border-b-2 border-gray-600 mt-1 pb-1 font-bold">
                {returnData?.mileageOut || '_____________'} كم
              </div>
            </div>
          </div>
          <div className="mt-3 bg-white p-2 rounded border border-gray-300">
            <p className="font-bold">
              المسافة المقطوعة:{' '}
              {returnData?.mileageOut && contract.odometer_start
                ? `${returnData.mileageOut - contract.odometer_start} كم`
                : '_____________'}
            </p>
          </div>
        </div>

        {/* مستوى الوقود */}
        <div className="border border-gray-300 rounded p-3">
          <h3 className="font-bold mb-2">مستوى الوقود</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">عند الاستلام: {contract.fuel_level_start || 'ممتلئ'}</p>
            </div>
            <div>
              <p className="font-semibold">عند الإرجاع: {returnData?.fuelLevelOut || '___________'}</p>
            </div>
          </div>
        </div>

        {/* الأضرار الجديدة */}
        {returnData?.damages && returnData.damages.length > 0 && (
          <div className="border-2 border-red-300 rounded p-3 bg-red-50">
            <h3 className="font-bold mb-3 text-red-700">الأضرار والخدوش الجديدة</h3>
            <table className="w-full text-xs">
              <thead className="bg-red-100">
                <tr>
                  <th className="border border-red-300 p-2">#</th>
                  <th className="border border-red-300 p-2">وصف الضرر</th>
                  <th className="border border-red-300 p-2">التكلفة المقدرة</th>
                </tr>
              </thead>
              <tbody>
                {returnData.damages.map((damage, index) => (
                  <tr key={index}>
                    <td className="border border-red-300 p-2 text-center">{index + 1}</td>
                    <td className="border border-red-300 p-2">{damage.description}</td>
                    <td className="border border-red-300 p-2 text-left font-medium">
                      {damage.cost.toFixed(2)} ر.س
                    </td>
                  </tr>
                ))}
                <tr className="bg-red-200 font-bold">
                  <td colSpan={2} className="border border-red-300 p-2 text-right">
                    إجمالي تكلفة الأضرار:
                  </td>
                  <td className="border border-red-300 p-2 text-left">
                    {damagesCost.toFixed(2)} ر.س
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* الحسابات النهائية */}
        <div className="border-2 border-gray-400 rounded overflow-hidden">
          <div className="bg-gray-200 p-3">
            <h3 className="font-bold text-lg">الحسابات النهائية والتسوية المالية</h3>
          </div>
          <table className="w-full">
            <tbody>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3 font-semibold">المبلغ الأساسي للعقد</td>
                <td className="border border-gray-300 p-3 text-left font-medium">
                  {contract.total_amount?.toFixed(2) || '0.00'} ر.س
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="border border-gray-300 p-2 bg-yellow-50 font-semibold">
                  رسوم إضافية:
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 pr-6">رسوم التأخير</td>
                <td className="border border-gray-300 p-2 text-left">
                  {returnData?.additionalCharges?.lateFee?.toFixed(2) || '0.00'} ر.س
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 pr-6">رسوم الوقود</td>
                <td className="border border-gray-300 p-2 text-left">
                  {returnData?.additionalCharges?.fuelFee?.toFixed(2) || '0.00'} ر.س
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 pr-6">رسوم التنظيف</td>
                <td className="border border-gray-300 p-2 text-left">
                  {returnData?.additionalCharges?.cleaningFee?.toFixed(2) || '0.00'} ر.س
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 pr-6">رسوم الأضرار</td>
                <td className="border border-gray-300 p-2 text-left font-medium text-red-600">
                  {damagesCost.toFixed(2)} ر.س
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 pr-6">رسوم أخرى</td>
                <td className="border border-gray-300 p-2 text-left">
                  {returnData?.additionalCharges?.other?.toFixed(2) || '0.00'} ر.س
                </td>
              </tr>
              <tr className="bg-yellow-100">
                <td className="border border-gray-300 p-3 font-bold">إجمالي الرسوم الإضافية</td>
                <td className="border border-gray-300 p-3 text-left font-bold">
                  {totalDeductions.toFixed(2)} ر.س
                </td>
              </tr>
              <tr className="bg-blue-50">
                <td className="border border-gray-300 p-3 font-semibold">الوديعة المدفوعة</td>
                <td className="border border-gray-300 p-3 text-left font-medium">
                  {contract.deposit_amount?.toFixed(2) || '0.00'} ر.س
                </td>
              </tr>
              <tr className={refund >= 0 ? 'bg-green-100' : 'bg-red-100'}>
                <td className="border border-gray-300 p-4 font-bold text-lg">
                  {refund >= 0 ? 'المبلغ المسترد للعميل' : 'المتبقي على العميل'}
                </td>
                <td className="border border-gray-300 p-4 text-left font-bold text-xl">
                  {Math.abs(refund).toFixed(2)} ر.س
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ملاحظات */}
        {returnData?.notes && (
          <div className="border border-gray-300 rounded p-3 bg-gray-50">
            <h3 className="font-bold mb-2">ملاحظات</h3>
            <p className="text-sm">{returnData.notes}</p>
          </div>
        )}

        {/* التوقيعات */}
        <div className="grid grid-cols-2 gap-6 mt-6 pt-6 border-t-2 border-gray-400">
          <div>
            <p className="font-semibold mb-1">توقيع المستأجر</p>
            <p className="text-xs text-gray-600 mb-8">
              (أقر بإعادة المركبة والموافقة على الفحص والتكاليف الإضافية)
            </p>
            <div className="border-t-2 border-gray-400 pt-2">
              <p className="text-xs">الاسم: _____________________</p>
              <p className="text-xs">التاريخ: {format(new Date(), 'dd/MM/yyyy')}</p>
            </div>
          </div>
          <div>
            <p className="font-semibold mb-1">توقيع الموظف</p>
            <p className="text-xs text-gray-600 mb-8">
              (أقر باستلام المركبة وصحة الفحص والحسابات المذكورة)
            </p>
            <div className="border-t-2 border-gray-400 pt-2">
              <p className="text-xs">الاسم: _____________________</p>
              <p className="text-xs">التاريخ: {format(new Date(), 'dd/MM/yyyy')}</p>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500 mt-4 border-t border-gray-300 pt-3">
          <p className="font-semibold">تم إنهاء العقد بنجاح</p>
          <p>شكراً لاختياركم خدماتنا، ونتطلع لخدمتكم مجدداً</p>
        </div>
      </div>
    </PrintLayout>
  );
};