/**
 * تحسين QR Code للفاتورة الضريبية - معيار ZATCA
 * يستخدم TLV (Tag-Length-Value) encoding
 */

interface ZatcaQRData {
  sellerName: string;
  vatNumber: string;
  timestamp: string;
  totalWithVat: string;
  vatAmount: string;
}

/**
 * تحويل نص إلى TLV format
 */
function toTLV(tag: number, value: string): string {
  const encoder = new TextEncoder();
  const valueBytes = encoder.encode(value);
  const length = valueBytes.length;
  
  // تنسيق: Tag (1 byte) + Length (1 byte) + Value
  return String.fromCharCode(tag) + String.fromCharCode(length) + value;
}

/**
 * توليد QR Code متوافق مع ZATCA
 */
export function generateZatcaQR(data: ZatcaQRData): string {
  let tlvString = '';
  
  // Tag 1: اسم البائع
  tlvString += toTLV(1, data.sellerName);
  
  // Tag 2: الرقم الضريبي
  tlvString += toTLV(2, data.vatNumber);
  
  // Tag 3: التاريخ والوقت
  tlvString += toTLV(3, data.timestamp);
  
  // Tag 4: إجمالي الفاتورة شامل الضريبة
  tlvString += toTLV(4, data.totalWithVat);
  
  // Tag 5: قيمة الضريبة
  tlvString += toTLV(5, data.vatAmount);
  
  // تحويل إلى Base64
  return btoa(unescape(encodeURIComponent(tlvString)));
}

/**
 * توليد QR Code بسيط (للحالات التي لا تحتاج TLV)
 */
export function generateSimpleQR(data: ZatcaQRData): string {
  return JSON.stringify({
    seller: data.sellerName,
    vat_number: data.vatNumber,
    timestamp: data.timestamp,
    total: data.totalWithVat,
    vat_amount: data.vatAmount,
  });
}
