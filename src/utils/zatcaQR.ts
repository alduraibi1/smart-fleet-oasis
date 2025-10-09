/**
 * توليد QR Code للفاتورة الضريبية - معيار ZATCA
 */

export interface ZatcaQRData {
  sellerName: string;
  vatNumber: string;
  timestamp: string;
  totalWithVat: string;
  vatAmount: string;
}

/**
 * توليد QR Code متوافق مع ZATCA باستخدام TLV encoding
 */
export function generateZatcaQR(data: ZatcaQRData): string {
  try {
    const parts: string[] = [];
    
    // Tag 1: اسم البائع
    const sellerName = data.sellerName || '';
    parts.push(String.fromCharCode(1) + String.fromCharCode(sellerName.length) + sellerName);
    
    // Tag 2: الرقم الضريبي
    const vatNumber = data.vatNumber || '';
    parts.push(String.fromCharCode(2) + String.fromCharCode(vatNumber.length) + vatNumber);
    
    // Tag 3: التاريخ والوقت
    const timestamp = data.timestamp || '';
    parts.push(String.fromCharCode(3) + String.fromCharCode(timestamp.length) + timestamp);
    
    // Tag 4: إجمالي الفاتورة شامل الضريبة
    const totalWithVat = data.totalWithVat || '';
    parts.push(String.fromCharCode(4) + String.fromCharCode(totalWithVat.length) + totalWithVat);
    
    // Tag 5: قيمة الضريبة
    const vatAmount = data.vatAmount || '';
    parts.push(String.fromCharCode(5) + String.fromCharCode(vatAmount.length) + vatAmount);
    
    const tlvString = parts.join('');
    return btoa(tlvString);
  } catch (error) {
    console.error('Error generating ZATCA QR:', error);
    return btoa(JSON.stringify(data));
  }
}
