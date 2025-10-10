import { PrintLayout } from './PrintLayout';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Contract {
  id: string;
  contract_number: string;
  start_date: string;
  end_date: string;
  daily_rate: number;
  total_amount: number;
  deposit_amount: number;
  paid_amount: number;
  vat_included?: boolean;
  notes?: string;
  customers?: {
    name: string;
    national_id: string;
    phone: string;
    email?: string;
    address?: string;
    nationality?: string;
    date_of_birth?: string;
  };
  vehicles?: {
    brand: string;
    model: string;
    year: number;
    plate_number: string;
    color?: string;
    vin?: string;
  };
}

interface ContractTemplateProps {
  contract: Contract;
}

export const ContractTemplate = ({ contract }: ContractTemplateProps) => {
  const { settings } = useSystemSettings();

  const days = Math.ceil(
    (new Date(contract.end_date).getTime() - new Date(contract.start_date).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  // إصلاح حساب VAT: إذا كان شامل الضريبة، نستخرجها من المبلغ بدلاً من إضافتها
  let baseAmount: number;
  let vatAmount: number;
  let totalWithVat: number;

  if (contract.vat_included) {
    // المبلغ المدخل شامل الضريبة، نستخرج الضريبة منه
    totalWithVat = contract.total_amount;
    baseAmount = totalWithVat / 1.15;
    vatAmount = totalWithVat - baseAmount;
  } else {
    // المبلغ المدخل بدون ضريبة
    baseAmount = contract.total_amount;
    vatAmount = 0;
    totalWithVat = baseAmount;
  }

  const remaining = totalWithVat - contract.paid_amount;

  const verificationUrl = `${window.location.origin}/contracts/verify/${contract.id}`;

  return (
    <PrintLayout title="عقد تأجير مركبة" showLogo showSeal>
      <div className="space-y-6 text-sm">
        {/* معلومات العقد */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-gray-600">
              <span className="font-semibold">رقم العقد:</span> {contract.contract_number}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">التاريخ:</span>{' '}
              {format(new Date(contract.start_date), 'dd MMMM yyyy', { locale: ar })}
            </p>
          </div>
          <div>
            <QRCodeSVG value={verificationUrl} size={80} />
          </div>
        </div>

        {/* معلومات المؤجر */}
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <h3 className="font-bold text-lg mb-3 text-gray-800">معلومات المؤجر</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            <div>
              <span className="text-gray-600">الاسم:</span>
              <span className="font-medium mr-2">{settings?.companyName}</span>
            </div>
            <div>
              <span className="text-gray-600">السجل التجاري:</span>
              <span className="font-medium mr-2">{settings?.commercialRegistration}</span>
            </div>
            <div>
              <span className="text-gray-600">الرقم الضريبي:</span>
              <span className="font-medium mr-2">{settings?.taxNumber}</span>
            </div>
            <div>
              <span className="text-gray-600">رقم الترخيص:</span>
              <span className="font-medium mr-2">{settings?.licenseNumber}</span>
            </div>
          </div>
        </div>

        {/* معلومات المستأجر */}
        <div className="border border-gray-300 rounded-lg p-4">
          <h3 className="font-bold text-lg mb-3 text-gray-800">معلومات المستأجر / Lessee Information</h3>
          {contract.customers ? (
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              <div>
                <span className="text-gray-600">الاسم / Name:</span>
                <span className="font-medium mr-2">{contract.customers.name}</span>
              </div>
              <div>
                <span className="text-gray-600">رقم الهوية / ID No.:</span>
                <span className="font-medium mr-2 ltr">{contract.customers.national_id}</span>
              </div>
              <div>
                <span className="text-gray-600">الجنسية / Nationality:</span>
                <span className="font-medium mr-2">{contract.customers.nationality || 'غير محدد'}</span>
              </div>
              <div>
                <span className="text-gray-600">الهاتف / Mobile:</span>
                <span className="font-medium mr-2 ltr">{contract.customers.phone}</span>
              </div>
              {contract.customers.email && (
                <div>
                  <span className="text-gray-600">البريد / Email:</span>
                  <span className="font-medium mr-2 ltr text-xs">{contract.customers.email}</span>
                </div>
              )}
              {contract.customers.address && (
                <div className="col-span-2">
                  <span className="text-gray-600">العنوان / Address:</span>
                  <span className="font-medium mr-2">{contract.customers.address}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-destructive">⚠️ بيانات العميل غير متوفرة</p>
          )}
        </div>

        {/* معلومات المركبة */}
        <div className="border border-gray-300 rounded-lg p-4 bg-blue-50">
          <h3 className="font-bold text-lg mb-3 text-gray-800">معلومات المركبة / Vehicle Information</h3>
          {contract.vehicles ? (
            <div className="grid grid-cols-3 gap-x-8 gap-y-2">
              <div>
                <span className="text-gray-600">نوع المركبة / Type:</span>
                <span className="font-medium mr-2">
                  {contract.vehicles.brand} {contract.vehicles.model}
                </span>
              </div>
              <div>
                <span className="text-gray-600">الموديل / Year:</span>
                <span className="font-medium mr-2">{contract.vehicles.year}</span>
              </div>
              <div>
                <span className="text-gray-600">رقم اللوحة / Plate No.:</span>
                <span className="font-medium mr-2 ltr">{contract.vehicles.plate_number}</span>
              </div>
              {contract.vehicles.color && (
                <div>
                  <span className="text-gray-600">اللون / Color:</span>
                  <span className="font-medium mr-2">{contract.vehicles.color}</span>
                </div>
              )}
              {contract.vehicles.vin && (
                <div className="col-span-2">
                  <span className="text-gray-600">رقم الشاصي / VIN:</span>
                  <span className="font-medium mr-2 ltr text-xs">{contract.vehicles.vin}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-destructive">⚠️ بيانات المركبة غير متوفرة</p>
          )}
        </div>

        {/* التفاصيل المالية */}
        <div className="border-2 border-gray-400 rounded-lg overflow-hidden">
          <div className="bg-gray-200 p-3">
            <h3 className="font-bold text-lg text-gray-800">التفاصيل المالية / Financial Details</h3>
          </div>
          <table className="w-full">
            <tbody className="divide-y divide-gray-300">
              <tr>
                <td className="p-3 text-gray-600">السعر اليومي / Daily Rate</td>
                <td className="p-3 text-left font-medium">{contract.daily_rate.toFixed(2)} ر.س</td>
              </tr>
              <tr>
                <td className="p-3 text-gray-600">عدد الأيام / Duration</td>
                <td className="p-3 text-left font-medium">{days} يوم</td>
              </tr>
              <tr>
                <td className="p-3 text-gray-600">المبلغ الأساسي / Base Amount</td>
                <td className="p-3 text-left font-medium">{baseAmount.toFixed(2)} ر.س</td>
              </tr>
              {contract.vat_included && (
                <>
                  <tr className="bg-yellow-50">
                    <td className="p-3 text-gray-600 font-semibold">
                      ضريبة القيمة المضافة (15%) / VAT (15%)
                    </td>
                    <td className="p-3 text-left font-medium">{vatAmount.toFixed(2)} ر.س</td>
                  </tr>
                  <tr className="bg-yellow-100">
                    <td className="p-3 text-gray-800 font-bold">المجموع شامل الضريبة / Total incl. VAT</td>
                    <td className="p-3 text-left font-bold text-lg">{totalWithVat.toFixed(2)} ر.س</td>
                  </tr>
                </>
              )}
              {!contract.vat_included && (
                <tr className="bg-gray-100">
                  <td className="p-3 text-gray-800 font-bold">المجموع الكلي / Total Amount</td>
                  <td className="p-3 text-left font-bold text-lg">{baseAmount.toFixed(2)} ر.س</td>
                </tr>
              )}
              <tr>
                <td className="p-3 text-gray-600">المبلغ المدفوع / Paid Amount</td>
                <td className="p-3 text-left font-medium text-green-600">
                  {contract.paid_amount.toFixed(2)} ر.س
                </td>
              </tr>
              <tr>
                <td className="p-3 text-gray-600">الوديعة / Deposit</td>
                <td className="p-3 text-left font-medium">{contract.deposit_amount.toFixed(2)} ر.س</td>
              </tr>
              <tr className="bg-blue-50">
                <td className="p-3 text-gray-800 font-bold">المتبقي / Remaining</td>
                <td className="p-3 text-left font-bold text-red-600">{remaining.toFixed(2)} ر.س</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* شروط الوديعة */}
        <div className="border-2 border-amber-500 rounded-lg p-4 bg-amber-50">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">💰</span>
            <h3 className="font-bold text-lg text-amber-800">شروط الوديعة الضامنة / Security Deposit Terms</h3>
          </div>
          <ul className="text-sm text-amber-900 space-y-2 mr-6">
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>الوديعة البالغة <strong>{contract.deposit_amount?.toLocaleString() || 0} ر.س</strong> هي مبلغ ضمان فقط ولا تُحتسب من قيمة الإيجار</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>تُسترد الوديعة بالكامل عند إعادة المركبة بحالة جيدة ودون أضرار أو مخالفات</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>في حال وجود أضرار أو مخالفات، يتم خصم قيمتها من مبلغ الوديعة</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>الوديعة غير قابلة للاسترداد في حالة إلغاء العقد من قبل المستأجر خلال أول 7 أيام</span>
            </li>
          </ul>
        </div>

        {/* مدة العقد */}
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-gray-300 rounded-lg p-3">
            <span className="text-gray-600">تاريخ البداية / Start Date:</span>
            <p className="font-semibold mt-1">
              {format(new Date(contract.start_date), 'dd/MM/yyyy')}
            </p>
          </div>
          <div className="border border-gray-300 rounded-lg p-3">
            <span className="text-gray-600">تاريخ النهاية / End Date:</span>
            <p className="font-semibold mt-1">
              {format(new Date(contract.end_date), 'dd/MM/yyyy')}
            </p>
          </div>
        </div>

        {/* البنود والشروط */}
        {settings?.contractTerms && (
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 mt-6">
            <h3 className="font-bold text-lg mb-3 text-gray-800">بنود وشروط العقد</h3>
            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {settings.contractTerms}
            </div>
          </div>
        )}

        {/* الملاحظات */}
        {contract.notes && (
          <div className="border border-gray-300 rounded-lg p-4 bg-yellow-50">
            <h3 className="font-bold text-base mb-2 text-gray-800">ملاحظات / Notes:</h3>
            <p className="text-sm text-gray-700">{contract.notes}</p>
          </div>
        )}

        {/* التوقيعات */}
        <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t-2 border-gray-400">
          <div className="text-center">
            <div className="border-t-2 border-gray-400 pt-2 mt-16">
              <p className="font-semibold">توقيع المستأجر</p>
              <p className="text-xs text-gray-600">Renter's Signature</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t-2 border-gray-400 pt-2 mt-16">
              <p className="font-semibold">توقيع الموظف</p>
              <p className="text-xs text-gray-600">Employee's Signature</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold mb-2">ختم الشركة</p>
            <p className="text-xs text-gray-600 mb-4">Company Seal</p>
            {settings?.companySealUrl && (
              <img
                src={settings.companySealUrl}
                alt="ختم الشركة"
                className="h-20 mx-auto object-contain"
              />
            )}
          </div>
        </div>

        {/* تاريخ الطباعة */}
        <div className="text-center text-xs text-gray-500 mt-4">
          <p>تاريخ الطباعة: {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
        </div>
      </div>
    </PrintLayout>
  );
};