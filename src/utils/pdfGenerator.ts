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
      console.error(`❌ العنصر ${elementId} غير موجود`);
      throw new Error(`العنصر ${elementId} غير موجود`);
    }

    console.log(`📄 بدء توليد PDF: ${fileName}`);

    // إنشاء canvas من العنصر مع إعدادات محسّنة
    const canvas = await html2canvas(element, {
      scale: 2, // دقة عالية
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      imageTimeout: 15000, // مهلة 15 ثانية للصور
      removeContainer: true,
    });

    console.log(`✅ تم إنشاء Canvas بنجاح (${canvas.width}x${canvas.height})`);

    // إنشاء PDF
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? 'portrait' : 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true, // ضغط PDF لتقليل الحجم
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

    console.log(`✅ تم إنشاء PDF بنجاح (${pdf.getNumberOfPages()} صفحة)`);

    // تحويل PDF إلى Blob
    const pdfBlob = pdf.output('blob');
    console.log(`📦 حجم PDF: ${(pdfBlob.size / 1024).toFixed(2)} KB`);

    // رفع الملف إلى Supabase Storage
    const filePath = `${contractId}/${fileName}`;
    console.log(`☁️ جارٍ رفع الملف: ${filePath}`);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('contract-documents')
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('❌ خطأ في رفع الملف:', uploadError);
      throw uploadError;
    }

    console.log(`✅ تم رفع الملف بنجاح:`, uploadData);

    // الحصول على URL العام
    const { data: urlData } = supabase.storage
      .from('contract-documents')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;
    console.log(`🔗 رابط PDF: ${publicUrl}`);

    // تحديث رابط PDF في قاعدة البيانات
    const columnMap = {
      contract: 'contract_pdf_url',
      invoice: 'invoice_pdf_url',
      handover: 'handover_pdf_url',
      return: 'return_pdf_url',
    };

    const { error: updateError } = await supabase
      .from('rental_contracts')
      .update({ [columnMap[documentType]]: publicUrl })
      .eq('id', contractId);

    if (updateError) {
      console.error('⚠️ تحذير: فشل تحديث رابط PDF في قاعدة البيانات:', updateError);
      // لا نرمي خطأ هنا لأن الملف تم رفعه بنجاح
    } else {
      console.log(`✅ تم تحديث رابط PDF في قاعدة البيانات`);
    }

    return publicUrl;
  } catch (error) {
    console.error('💥 خطأ في توليد ورفع PDF:', error);
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

  console.log(`🚀 بدء توليد مستندات العقد: ${contractNumber}`);
  const startTime = Date.now();

  try {
    // توليد عقد الإيجار
    console.log('📄 توليد عقد الإيجار...');
    results.contract = await generateAndUploadPDF(
      'contract-template',
      `contract-${contractNumber}-${timestamp}.pdf`,
      contractId,
      'contract'
    );

    // توليد الفاتورة الضريبية
    console.log('🧾 توليد الفاتورة الضريبية...');
    results.invoice = await generateAndUploadPDF(
      'tax-invoice-template',
      `invoice-${contractNumber}-${timestamp}.pdf`,
      contractId,
      'invoice'
    );

    // توليد نموذج الاستلام
    console.log('📋 توليد نموذج الاستلام...');
    results.handover = await generateAndUploadPDF(
      'handover-template',
      `handover-${contractNumber}-${timestamp}.pdf`,
      contractId,
      'handover'
    );

    // توليد نموذج الإرجاع (اختياري - فقط عند طلبه)
    if (includeReturn) {
      console.log('🔄 توليد نموذج الإرجاع...');
      results.return = await generateAndUploadPDF(
        'return-template',
        `return-${contractNumber}-${timestamp}.pdf`,
        contractId,
        'return'
      );
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    const successCount = Object.values(results).filter(r => r !== null).length;
    const totalDocs = includeReturn ? 4 : 3;
    
    console.log(`✅ اكتملت عملية التوليد في ${duration} ثانية`);
    console.log(`📊 تم توليد ${successCount} من ${totalDocs} مستندات`);

  } catch (error) {
    console.error('💥 خطأ عام في توليد المستندات:', error);
  }

  return results;
};
