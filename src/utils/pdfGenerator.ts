import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

/**
 * توليد PDF من عنصر HTML وحفظه في Supabase Storage
 */
export const generateAndUploadPDF = async (
  elementId: string,
  fileName: string,
  contractId: string,
  documentType: 'contract' | 'invoice' | 'handover' | 'return'
): Promise<string | null> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`العنصر ${elementId} غير موجود`);
    }

    // إنشاء canvas من العنصر
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // إنشاء PDF
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? 'portrait' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // إضافة الصورة للـ PDF
    let heightLeft = imgHeight;
    let position = 0;
    const pageHeight = 297; // A4 height in mm

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // إضافة صفحات إضافية إذا لزم الأمر
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // تحويل PDF إلى Blob
    const pdfBlob = pdf.output('blob');

    // رفع الملف إلى Supabase Storage
    const filePath = `${contractId}/${fileName}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('contract-documents')
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // الحصول على URL العام
    const { data: urlData } = supabase.storage
      .from('contract-documents')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // تحديث رابط PDF في قاعدة البيانات
    const columnMap = {
      contract: 'contract_pdf_url',
      invoice: 'invoice_pdf_url',
      handover: 'handover_pdf_url',
      return: 'return_pdf_url',
    };

    await supabase
      .from('rental_contracts')
      .update({ [columnMap[documentType]]: publicUrl })
      .eq('id', contractId);

    return publicUrl;
  } catch (error) {
    console.error('خطأ في توليد ورفع PDF:', error);
    return null;
  }
};

/**
 * توليد جميع مستندات PDF للعقد
 */
export const generateAllContractDocuments = async (
  contractId: string,
  contractNumber: string,
  includeReturn: boolean = false
): Promise<{
  contract: string | null;
  invoice: string | null;
  handover: string | null;
  return: string | null;
}> => {
  const timestamp = Date.now();
  
  const results = {
    contract: null as string | null,
    invoice: null as string | null,
    handover: null as string | null,
    return: null as string | null,
  };

  // توليد عقد الإيجار
  results.contract = await generateAndUploadPDF(
    'contract-template',
    `contract-${contractNumber}-${timestamp}.pdf`,
    contractId,
    'contract'
  );

  // توليد الفاتورة الضريبية
  results.invoice = await generateAndUploadPDF(
    'tax-invoice-template',
    `invoice-${contractNumber}-${timestamp}.pdf`,
    contractId,
    'invoice'
  );

  // توليد نموذج الاستلام
  results.handover = await generateAndUploadPDF(
    'handover-template',
    `handover-${contractNumber}-${timestamp}.pdf`,
    contractId,
    'handover'
  );

  // توليد نموذج الإرجاع (اختياري - فقط عند طلبه)
  if (includeReturn) {
    results.return = await generateAndUploadPDF(
      'return-template',
      `return-${contractNumber}-${timestamp}.pdf`,
      contractId,
      'return'
    );
  }

  return results;
};
