import { supabase } from "@/integrations/supabase/client";

/**
 * رفع صورة للعقد إلى Supabase Storage
 * @param file - ملف الصورة
 * @param contractId - معرف العقد
 * @param type - نوع النموذج (handover أو return)
 * @returns رابط الصورة العام
 */
export async function uploadContractImage(
  file: File,
  contractId: string,
  type: 'handover' | 'return'
): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${contractId}/${type}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('contract-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('contract-images')
      .getPublicUrl(fileName);
      
    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('فشل رفع الصورة');
  }
}

/**
 * رفع عدة صور للعقد
 * @param files - قائمة ملفات الصور
 * @param contractId - معرف العقد
 * @param type - نوع النموذج
 * @returns قائمة روابط الصور
 */
export async function uploadMultipleContractImages(
  files: File[],
  contractId: string,
  type: 'handover' | 'return'
): Promise<string[]> {
  try {
    const uploadPromises = files.map(file => 
      uploadContractImage(file, contractId, type)
    );
    
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw new Error('فشل رفع الصور');
  }
}

/**
 * حذف صورة من Storage
 * @param imageUrl - رابط الصورة
 */
export async function deleteContractImage(imageUrl: string): Promise<void> {
  try {
    // استخراج المسار من الرابط
    const urlParts = imageUrl.split('/contract-images/');
    if (urlParts.length < 2) {
      throw new Error('رابط صورة غير صحيح');
    }
    
    const filePath = urlParts[1];
    
    const { error } = await supabase.storage
      .from('contract-images')
      .remove([filePath]);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('فشل حذف الصورة');
  }
}
