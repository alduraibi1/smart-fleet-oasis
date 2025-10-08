import { PrintLayout } from './PrintLayout';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';

interface VehicleHandoverFormProps {
  contract: any;
  inspectionData?: {
    mileage: number;
    fuelLevel: string;
    condition: Record<string, { status: string; notes: string }>;
    accessories: string[];
    photos: string[];
    notes: string;
  };
}

export const VehicleHandoverForm = ({ contract, inspectionData }: VehicleHandoverFormProps) => {
  const verificationUrl = `${window.location.origin}/contracts/${contract.id}/handover`;

  const inspectionPoints = [
    'المصد الأمامي', 'غطاء المحرك', 'الباب الأيمن الأمامي', 'الباب الأيسر الأمامي',
    'الباب الأيمن الخلفي', 'الباب الأيسر الخلفي', 'المصد الخلفي', 'صندوق الأمتعة',
    'الإطار الأمامي الأيمن', 'الإطار الأمامي الأيسر', 'الإطار الخلفي الأيمن', 'الإطار الخلفي الأيسر',
    'الزجاج الأمامي', 'الزجاج الخلفي', 'المرايا الجانبية', 'الأضواء الأمامية',
    'الأضواء الخلفية', 'المقاعد الأمامية', 'المقاعد الخلفية', 'لوحة القيادة',
  ];

  const accessories = [
    'مثلث التحذير', 'طفاية الحريق', 'عدة الإسعافات الأولية', 'جهاز الرافعة',
    'الإطار الاحتياطي', 'دليل المستخدم', 'بطاقة التأمين',
  ];

  return (
    <PrintLayout title="نموذج استلام المركبة" showLogo>
      <div className="space-y-4 text-sm">
        {/* معلومات العقد */}
        <div className="flex justify-between items-center border-b-2 border-gray-300 pb-3">
          <div>
            <p className="font-semibold">رقم العقد: {contract.contract_number}</p>
            <p className="text-gray-600">التاريخ: {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
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

        {/* القراءات الأولية */}
        <div className="border-2 border-gray-400 rounded p-3 bg-blue-50">
          <h3 className="font-bold mb-3 text-lg">القراءات الأولية عند الاستلام</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">عداد الكيلومترات:</p>
              <div className="border-b-2 border-gray-400 mt-2 pb-1">
                {inspectionData?.mileage || '_____________'} كم
              </div>
            </div>
            <div>
              <p className="font-semibold">مستوى الوقود:</p>
              <div className="flex gap-3 mt-2">
                <label className="flex items-center gap-1">
                  <input type="checkbox" className="print:hidden" /> ممتلئ
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" className="print:hidden" /> 3/4
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" className="print:hidden" /> نصف
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" className="print:hidden" /> 1/4
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* فحص حالة المركبة */}
        <div className="border border-gray-300 rounded overflow-hidden">
          <div className="bg-gray-200 p-2">
            <h3 className="font-bold">فحص حالة المركبة</h3>
          </div>
          <table className="w-full text-xs">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-1 w-8">#</th>
                <th className="border border-gray-300 p-1">الجزء</th>
                <th className="border border-gray-300 p-1 w-16">ممتاز</th>
                <th className="border border-gray-300 p-1 w-16">جيد</th>
                <th className="border border-gray-300 p-1 w-16">مقبول</th>
                <th className="border border-gray-300 p-1 w-16">تالف</th>
                <th className="border border-gray-300 p-1">ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {inspectionPoints.map((point, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-1 text-center">{index + 1}</td>
                  <td className="border border-gray-300 p-1">{point}</td>
                  <td className="border border-gray-300 p-1 text-center">☐</td>
                  <td className="border border-gray-300 p-1 text-center">☐</td>
                  <td className="border border-gray-300 p-1 text-center">☐</td>
                  <td className="border border-gray-300 p-1 text-center">☐</td>
                  <td className="border border-gray-300 p-1"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* الإكسسوارات والمحتويات */}
        <div className="border border-gray-300 rounded p-3">
          <h3 className="font-bold mb-2">الإكسسوارات والمحتويات</h3>
          <div className="grid grid-cols-3 gap-2">
            {accessories.map((item, index) => (
              <label key={index} className="flex items-center gap-2">
                <input type="checkbox" className="print:hidden" />
                <span className="text-xs">{item}</span>
              </label>
            ))}
          </div>
          <div className="mt-3">
            <p className="text-xs"><span className="font-semibold">عدد المفاتيح:</span> _____ مفتاح</p>
          </div>
        </div>

        {/* مساحة للصور */}
        <div className="border border-gray-300 rounded p-3">
          <h3 className="font-bold mb-3">الصور التوثيقية (8 صور إلزامية)</h3>
          <div className="grid grid-cols-4 gap-2">
            {['أمامية', 'خلفية', 'يمين', 'يسار', 'لوحة أمامية', 'لوحة خلفية', 'عداد الكيلو', 'داخلية'].map((label, index) => (
              <div key={index} className="border-2 border-dashed border-gray-300 h-24 flex items-center justify-center text-xs text-gray-500">
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* ملاحظات إضافية */}
        <div className="border border-gray-300 rounded p-3">
          <h3 className="font-bold mb-2">ملاحظات إضافية</h3>
          <div className="border-b border-gray-400 h-20"></div>
        </div>

        {/* التوقيعات */}
        <div className="grid grid-cols-2 gap-6 mt-6 pt-6 border-t-2 border-gray-400">
          <div>
            <p className="font-semibold mb-1">توقيع المستأجر</p>
            <p className="text-xs text-gray-600 mb-8">(أقر باستلام المركبة بالحالة المذكورة أعلاه)</p>
            <div className="border-t-2 border-gray-400 pt-2">
              <p className="text-xs">الاسم: _____________________</p>
              <p className="text-xs">التاريخ: {format(new Date(), 'dd/MM/yyyy')}</p>
            </div>
          </div>
          <div>
            <p className="font-semibold mb-1">توقيع الموظف</p>
            <p className="text-xs text-gray-600 mb-8">(أقر بتسليم المركبة للعميل بالحالة المذكورة)</p>
            <div className="border-t-2 border-gray-400 pt-2">
              <p className="text-xs">الاسم: _____________________</p>
              <p className="text-xs">التاريخ: {format(new Date(), 'dd/MM/yyyy')}</p>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500 mt-4">
          <p>نسخة واحدة للعميل ونسخة للشركة</p>
        </div>
      </div>
    </PrintLayout>
  );
};