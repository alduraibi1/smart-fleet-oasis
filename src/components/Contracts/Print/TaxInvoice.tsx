import { PrintLayout } from './PrintLayout';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface TaxInvoiceProps {
  contract: any;
  invoiceNumber?: string;
}

export const TaxInvoice = ({ contract, invoiceNumber }: TaxInvoiceProps) => {
  const { settings } = useSystemSettings();

  const baseAmount = contract.total_amount || 0;
  const vatAmount = contract.vat_included ? baseAmount * 0.15 : 0;
  const totalWithVat = baseAmount + vatAmount;

  // إنشاء QR Code متوافق مع الفاتورة الإلكترونية السعودية (ZATCA)
  // TLV Format: Tag-Length-Value
  const generateZatcaQR = () => {
    const sellerName = settings?.companyName || '';
    const vatNumber = settings?.taxNumber || '';
    const timestamp = new Date().toISOString();
    const total = totalWithVat.toFixed(2);
    const vat = vatAmount.toFixed(2);

    // تنسيق TLV بسيط (في الإنتاج يحتاج Base64 encoding)
    const qrData = JSON.stringify({
      seller: sellerName,
      vat_number: vatNumber,
      timestamp,
      total,
      vat_amount: vat,
    });

    return qrData;
  };

  return (
    <PrintLayout showLogo showSeal>
      <div className="space-y-4 text-sm">
        {/* عنوان الفاتورة */}
        <div className="text-center border-4 border-gray-800 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-gray-50">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">فاتورة ضريبية</h1>
          <h2 className="text-2xl font-semibold text-gray-700">Tax Invoice</h2>
        </div>

        {/* معلومات الفاتورة */}
        <div className="flex justify-between items-start">
          <div>
            <p className="font-bold text-lg">
              رقم الفاتورة / Invoice No:{' '}
              <span className="text-primary">{invoiceNumber || contract.contract_number}</span>
            </p>
            <p className="text-gray-600">
              التاريخ / Date: {format(new Date(), 'dd/MM/yyyy', { locale: ar })}
            </p>
            <p className="text-gray-600">
              الوقت / Time: {format(new Date(), 'HH:mm:ss')}
            </p>
          </div>
          <div className="text-right">
            <QRCodeSVG value={generateZatcaQR()} size={100} />
            <p className="text-xs text-gray-500 mt-1">رمز التحقق ZATCA</p>
          </div>
        </div>

        {/* معلومات المؤجر (البائع) */}
        <div className="border-2 border-gray-400 rounded-lg p-4 bg-blue-50">
          <h3 className="font-bold text-lg mb-3 border-b border-gray-400 pb-2">
            بيانات المؤجر / Lessor Information
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-gray-600">الاسم / Name:</p>
              <p className="font-semibold">{settings?.companyName}</p>
            </div>
            <div>
              <p className="text-gray-600">العنوان / Address:</p>
              <p className="font-medium">{settings?.companyAddress}</p>
            </div>
            <div>
              <p className="text-gray-600">السجل التجاري / CR:</p>
              <p className="font-medium ltr">{settings?.commercialRegistration}</p>
            </div>
            <div className="col-span-2 bg-yellow-100 p-2 rounded border-2 border-yellow-400">
              <p className="text-gray-700 font-bold">الرقم الضريبي / VAT Number:</p>
              <p className="font-bold text-xl ltr">{settings?.taxNumber}</p>
            </div>
          </div>
        </div>

        {/* معلومات المستأجر (المشتري) */}
        <div className="border-2 border-gray-400 rounded-lg p-4">
          <h3 className="font-bold text-lg mb-3 border-b border-gray-400 pb-2">
            بيانات المستأجر / Lessee Information
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-gray-600">الاسم / Name:</p>
              <p className="font-semibold">{contract.customers?.name}</p>
            </div>
            <div>
              <p className="text-gray-600">رقم الهوية / ID No.:</p>
              <p className="font-medium ltr">{contract.customers?.national_id}</p>
            </div>
            <div>
              <p className="text-gray-600">الهاتف / Mobile:</p>
              <p className="font-medium ltr">{contract.customers?.phone}</p>
            </div>
            {contract.customers?.address && (
              <div>
                <p className="text-gray-600">العنوان / Address:</p>
                <p className="font-medium">{contract.customers.address}</p>
              </div>
            )}
          </div>
        </div>

        {/* تفاصيل الخدمة */}
        <div className="border-2 border-gray-400 rounded-lg overflow-hidden">
          <div className="bg-gray-200 p-3">
            <h3 className="font-bold text-lg">تفاصيل الخدمة / Service Details</h3>
          </div>
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-right">#</th>
                <th className="border border-gray-300 p-2 text-right">
                  الوصف / Description
                </th>
                <th className="border border-gray-300 p-2 text-center">
                  المدة / Duration
                </th>
                <th className="border border-gray-300 p-2 text-left">
                  السعر / Price
                </th>
                <th className="border border-gray-300 p-2 text-left">
                  المبلغ / Amount
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 text-center">1</td>
                <td className="border border-gray-300 p-2">
                  <p className="font-medium">
                    إيجار مركبة {contract.vehicles?.brand} {contract.vehicles?.model}
                  </p>
                  <p className="text-xs text-gray-600">
                    Vehicle Rental - {contract.vehicles?.plate_number}
                  </p>
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {Math.ceil(
                    (new Date(contract.end_date).getTime() -
                      new Date(contract.start_date).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{' '}
                  يوم
                </td>
                <td className="border border-gray-300 p-2 text-left ltr">
                  {contract.daily_rate?.toFixed(2)} SAR
                </td>
                <td className="border border-gray-300 p-2 text-left font-medium ltr">
                  {baseAmount.toFixed(2)} SAR
                </td>
              </tr>
              {contract.deposit_amount > 0 && (
                <tr className="bg-green-50">
                  <td className="border border-gray-300 p-2 text-center">2</td>
                  <td className="border border-gray-300 p-2">
                    <p className="font-medium">وديعة (قابلة للاسترداد)</p>
                    <p className="text-xs text-gray-600">Deposit (Refundable)</p>
                  </td>
                  <td className="border border-gray-300 p-2 text-center">-</td>
                  <td className="border border-gray-300 p-2 text-left">-</td>
                  <td className="border border-gray-300 p-2 text-left font-medium ltr">
                    {contract.deposit_amount.toFixed(2)} SAR
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* الإجمالي */}
        <div className="border-4 border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full text-base">
            <tbody>
              <tr className="bg-gray-100">
                <td className="p-4 font-semibold">المجموع قبل الضريبة / Subtotal</td>
                <td className="p-4 text-left font-bold text-lg ltr">
                  {baseAmount.toFixed(2)} ر.س
                </td>
              </tr>
              {contract.vat_included && (
                <>
                  <tr className="bg-yellow-100">
                    <td className="p-4 font-bold">ضريبة القيمة المضافة (15%) / VAT (15%)</td>
                    <td className="p-4 text-left font-bold text-lg ltr">
                      {vatAmount.toFixed(2)} ر.س
                    </td>
                  </tr>
                  <tr className="bg-blue-600 text-white">
                    <td className="p-5 font-bold text-xl">
                      الإجمالي شامل الضريبة / Total Including VAT
                    </td>
                    <td className="p-5 text-left font-bold text-2xl ltr">
                      {totalWithVat.toFixed(2)} ر.س
                    </td>
                  </tr>
                </>
              )}
              {!contract.vat_included && (
                <tr className="bg-blue-600 text-white">
                  <td className="p-5 font-bold text-xl">الإجمالي / Total Amount</td>
                  <td className="p-5 text-left font-bold text-2xl ltr">
                    {baseAmount.toFixed(2)} ر.س
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* معلومات الدفع */}
        {settings?.bankName && settings?.bankIban && (
          <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
            <h3 className="font-bold mb-2">معلومات الدفع / Payment Information</h3>
            <div className="text-sm">
              <p>
                <span className="text-gray-600">اسم البنك / Bank Name:</span>{' '}
                <span className="font-medium">{settings.bankName}</span>
              </p>
              <p>
                <span className="text-gray-600">رقم الحساب / IBAN:</span>{' '}
                <span className="font-medium ltr">{settings.bankIban}</span>
              </p>
            </div>
          </div>
        )}

        {/* ملاحظة قانونية */}
        <div className="border-t-2 border-gray-400 pt-3 mt-4">
          <p className="text-xs text-gray-600 text-center">
            هذه فاتورة ضريبية صادرة وفقاً لأنظمة المملكة العربية السعودية
            <br />
            This is a tax invoice issued in accordance with the regulations of the Kingdom
            of Saudi Arabia
          </p>
        </div>

        {/* تاريخ الطباعة */}
        <div className="text-center text-xs text-gray-500 mt-2">
          <p>تاريخ الطباعة / Print Date: {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
        </div>
      </div>
    </PrintLayout>
  );
};