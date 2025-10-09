import { PrintLayout } from './PrintLayout';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { Camera, FileText } from 'lucide-react';

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
      <div className="space-y-5 text-sm">
        {/* Header Section - معلومات العقد */}
        <div className="flex justify-between items-start bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <p className="font-bold text-lg text-blue-900">رقم العقد: {contract.contract_number}</p>
            </div>
            <p className="text-gray-700 text-xs flex items-center gap-1">
              <span className="font-semibold">تاريخ الاستلام:</span>
              {format(new Date(), 'dd/MM/yyyy - HH:mm')}
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <QRCodeSVG value={verificationUrl} size={70} className="border-4 border-white shadow-md rounded" />
            <p className="text-[10px] text-gray-600">رمز التحقق</p>
          </div>
        </div>

        {/* معلومات العميل والمركبة - Grid محسّن */}
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

        {/* القراءات الأولية - تصميم محسّن */}
        <div className="border-3 border-blue-400 rounded-xl p-5 bg-gradient-to-br from-blue-50 via-white to-cyan-50 shadow-lg">
          <div className="flex items-center gap-2 mb-4 border-b-2 border-blue-300 pb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-lg">📊</span>
            </div>
            <h3 className="font-bold text-xl text-blue-900">القراءات الأولية عند الاستلام</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-5">
            <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-500">
              <p className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-blue-600">⏱️</span>
                عداد الكيلومترات
              </p>
              <div className="bg-blue-100 border-2 border-blue-400 rounded-lg mt-3 p-3 text-center">
                <p className="text-3xl font-black text-blue-900">
                  {contract.odometer_start || contract.mileage_start || inspectionData?.mileage || '_____'}
                </p>
                <p className="text-sm text-blue-700 font-medium mt-1">كيلومتر</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-orange-500">
              <p className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-orange-600">⛽</span>
                مستوى الوقود
              </p>
              <div className="bg-orange-100 border-2 border-orange-400 rounded-lg mt-3 p-3 text-center">
                <p className="text-3xl font-black text-orange-900">
                  {contract.fuel_level_start || inspectionData?.fuelLevel || '____'}
                </p>
              </div>
              <div className="flex gap-3 mt-3 text-xs justify-center">
                <span className="bg-white px-2 py-1 rounded border">☐ ممتلئ</span>
                <span className="bg-white px-2 py-1 rounded border">☐ 3/4</span>
                <span className="bg-white px-2 py-1 rounded border">☐ نصف</span>
                <span className="bg-white px-2 py-1 rounded border">☐ 1/4</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 bg-white/80 rounded-lg p-3 border border-blue-200">
            <p className="text-sm text-gray-700">
              <span className="font-bold text-blue-700">تاريخ ووقت الاستلام:</span>{' '}
              {format(new Date(contract.start_date || new Date()), 'dd/MM/yyyy - HH:mm')}
            </p>
          </div>
        </div>

        {/* فحص حالة المركبة - جدول محسّن */}
        <div className="border-2 border-gray-300 rounded-xl overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-gray-700 to-gray-600 p-3 flex items-center gap-2">
            <span className="text-2xl">🔍</span>
            <h3 className="font-bold text-white text-lg">فحص حالة المركبة</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gradient-to-r from-gray-200 to-gray-100">
                <tr>
                  <th className="border border-gray-400 p-2 w-8 font-bold">#</th>
                  <th className="border border-gray-400 p-2 font-bold text-right">الجزء</th>
                  <th className="border border-gray-400 p-2 w-16 font-bold bg-green-100">ممتاز</th>
                  <th className="border border-gray-400 p-2 w-16 font-bold bg-blue-100">جيد</th>
                  <th className="border border-gray-400 p-2 w-16 font-bold bg-yellow-100">مقبول</th>
                  <th className="border border-gray-400 p-2 w-16 font-bold bg-red-100">تالف</th>
                  <th className="border border-gray-400 p-2 font-bold">ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {inspectionPoints.map((point, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 p-2 text-center font-semibold text-gray-600">{index + 1}</td>
                    <td className="border border-gray-300 p-2 font-medium">{point}</td>
                    <td className="border border-gray-300 p-2 text-center bg-green-50">☐</td>
                    <td className="border border-gray-300 p-2 text-center bg-blue-50">☐</td>
                    <td className="border border-gray-300 p-2 text-center bg-yellow-50">☐</td>
                    <td className="border border-gray-300 p-2 text-center bg-red-50">☐</td>
                    <td className="border border-gray-300 p-2 bg-gray-50"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* الإكسسوارات - تصميم بطاقات */}
        <div className="border-2 border-indigo-200 rounded-xl p-4 bg-gradient-to-br from-indigo-50 to-white shadow-md">
          <div className="flex items-center gap-2 mb-4 border-b border-indigo-300 pb-2">
            <span className="text-2xl">🧰</span>
            <h3 className="font-bold text-indigo-900 text-lg">الإكسسوارات والمحتويات</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {accessories.map((item, index) => (
              <label key={index} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors cursor-pointer shadow-sm">
                <input type="checkbox" className="print:hidden w-4 h-4 accent-indigo-600" />
                <span className="text-xs font-medium text-gray-700">✓ {item}</span>
              </label>
            ))}
          </div>
          <div className="mt-4 bg-white rounded-lg p-3 border-2 border-indigo-200">
            <p className="text-sm flex items-center gap-2">
              <span className="font-bold text-indigo-700">🔑 عدد المفاتيح:</span>
              <span className="border-b-2 border-indigo-400 px-3">_____</span>
              <span className="text-gray-600">مفتاح</span>
            </p>
          </div>
        </div>

        {/* الصور التوثيقية */}
        <div className="border-2 border-teal-200 rounded-xl p-4 bg-gradient-to-br from-teal-50 to-white shadow-md">
          <div className="flex items-center gap-2 mb-4 border-b border-teal-300 pb-2">
            <Camera className="w-6 h-6 text-teal-600" />
            <h3 className="font-bold text-teal-900 text-lg">الصور التوثيقية للمركبة</h3>
          </div>
          
          {inspectionData?.photos && inspectionData.photos.length > 0 ? (
            <div className="photo-grid grid grid-cols-4 gap-3">
              {inspectionData.photos.map((photoUrl: string, index: number) => (
                <div key={index} className="border-2 border-teal-300 overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <img 
                    src={photoUrl} 
                    alt={`صورة ${index + 1}`}
                    className="w-full h-28 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3Eفشل التحميل%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <div className="bg-gradient-to-r from-teal-100 to-teal-50 py-1 px-2 text-center border-t border-teal-300">
                    <p className="text-[10px] font-semibold text-teal-900">صورة {index + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {['أمامية', 'خلفية', 'يمين', 'يسار', 'لوحة أمامية', 'لوحة خلفية', 'عداد الكيلو', 'داخلية'].map((label, index) => (
                <div key={index} className="border-2 border-dashed border-teal-300 bg-teal-50 h-28 flex flex-col items-center justify-center text-xs text-teal-700 rounded-lg hover:bg-teal-100 transition-colors">
                  <Camera className="w-6 h-6 mb-1 text-teal-400" />
                  <span className="font-medium">{label}</span>
                </div>
              ))}
            </div>
          )}
          
          {inspectionData?.photos && inspectionData.photos.length > 0 && (
            <div className="mt-3 bg-teal-100 rounded-lg p-2 border border-teal-300">
              <p className="text-xs text-teal-900 flex items-center justify-between">
                <span className="font-semibold">📸 عدد الصور: {inspectionData.photos.length}</span>
                <span className="text-teal-700">📅 {format(new Date(), 'dd/MM/yyyy HH:mm')}</span>
              </p>
            </div>
          )}
        </div>

        {/* ملاحظات إضافية */}
        <div className="border-2 border-amber-200 rounded-xl p-4 bg-gradient-to-br from-amber-50 to-white shadow-md">
          <div className="flex items-center gap-2 mb-3 border-b border-amber-300 pb-2">
            <span className="text-2xl">📝</span>
            <h3 className="font-bold text-amber-900 text-lg">ملاحظات إضافية</h3>
          </div>
          <div className="bg-white border-2 border-amber-200 rounded-lg p-3 min-h-[80px]">
            {inspectionData?.notes && (
              <p className="text-sm text-gray-700">{inspectionData.notes}</p>
            )}
          </div>
        </div>

        {/* التوقيعات - تصميم احترافي */}
        <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t-4 border-gray-300">
          <div className="bg-gradient-to-br from-green-50 to-white border-2 border-green-300 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white">✍️</span>
              </div>
              <p className="font-bold text-green-900 text-base">توقيع المستأجر</p>
            </div>
            <p className="text-xs text-gray-600 mb-6 italic bg-green-100 p-2 rounded border-r-4 border-green-600">
              أقر باستلام المركبة بالحالة المذكورة أعلاه وأتحمل المسؤولية الكاملة عنها
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
              أقر بتسليم المركبة للعميل بالحالة الموضحة في هذا النموذج
            </p>
            <div className="border-t-2 border-blue-600 pt-3 mt-12">
              <p className="text-xs mb-1"><span className="font-semibold">الاسم:</span> _____________________</p>
              <p className="text-xs"><span className="font-semibold">التاريخ:</span> {format(new Date(), 'dd/MM/yyyy')}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 pt-4 border-t-2 border-gray-300">
          <div className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-600 font-medium">📋 نسخة واحدة للعميل ونسخة للشركة</p>
            <p className="text-[10px] text-gray-500 mt-1">هذا المستند يمثل إقراراً قانونياً بحالة المركبة عند الاستلام</p>
          </div>
        </div>
      </div>
    </PrintLayout>
  );
};