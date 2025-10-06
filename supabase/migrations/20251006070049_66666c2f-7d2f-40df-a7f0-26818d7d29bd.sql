-- إضافة قائمة شاملة بالجنسيات
-- حذف البيانات الموجودة أولاً
DELETE FROM nationalities;

-- إعادة تعيين التسلسل
ALTER SEQUENCE IF EXISTS nationalities_id_seq RESTART WITH 1;

-- إضافة الجنسيات بترتيب الأولوية

-- 1. المملكة العربية السعودية (أعلى أولوية)
INSERT INTO nationalities (code, name_ar, name_en, id_prefix, id_length, priority, is_active) VALUES
('SA', 'سعودي', 'Saudi', '1', 10, 1, true);

-- 2. دول مجلس التعاون الخليجي
INSERT INTO nationalities (code, name_ar, name_en, id_prefix, id_length, priority, is_active) VALUES
('AE', 'إماراتي', 'Emirati', '2', 10, 2, true),
('KW', 'كويتي', 'Kuwaiti', '2', 10, 3, true),
('QA', 'قطري', 'Qatari', '2', 10, 4, true),
('BH', 'بحريني', 'Bahraini', '2', 10, 5, true),
('OM', 'عماني', 'Omani', '2', 10, 6, true);

-- 3. الدول العربية
INSERT INTO nationalities (code, name_ar, name_en, id_prefix, id_length, priority, is_active) VALUES
('EG', 'مصري', 'Egyptian', '2', 10, 10, true),
('JO', 'أردني', 'Jordanian', '2', 10, 11, true),
('SY', 'سوري', 'Syrian', '2', 10, 12, true),
('LB', 'لبناني', 'Lebanese', '2', 10, 13, true),
('IQ', 'عراقي', 'Iraqi', '2', 10, 14, true),
('YE', 'يمني', 'Yemeni', '2', 10, 15, true),
('PS', 'فلسطيني', 'Palestinian', '2', 10, 16, true),
('SD', 'سوداني', 'Sudanese', '2', 10, 17, true),
('LY', 'ليبي', 'Libyan', '2', 10, 18, true),
('TN', 'تونسي', 'Tunisian', '2', 10, 19, true),
('DZ', 'جزائري', 'Algerian', '2', 10, 20, true),
('MA', 'مغربي', 'Moroccan', '2', 10, 21, true),
('MR', 'موريتاني', 'Mauritanian', '2', 10, 22, true),
('SO', 'صومالي', 'Somali', '2', 10, 23, true),
('DJ', 'جيبوتي', 'Djiboutian', '2', 10, 24, true),
('KM', 'قمري', 'Comorian', '2', 10, 25, true);

-- 4. دول آسيا الرئيسية
INSERT INTO nationalities (code, name_ar, name_en, id_prefix, id_length, priority, is_active) VALUES
('IN', 'هندي', 'Indian', '2', 10, 30, true),
('PK', 'باكستاني', 'Pakistani', '2', 10, 31, true),
('BD', 'بنغلاديشي', 'Bangladeshi', '2', 10, 32, true),
('PH', 'فلبيني', 'Filipino', '2', 10, 33, true),
('ID', 'إندونيسي', 'Indonesian', '2', 10, 34, true),
('MY', 'ماليزي', 'Malaysian', '2', 10, 35, true),
('TH', 'تايلاندي', 'Thai', '2', 10, 36, true),
('CN', 'صيني', 'Chinese', '2', 10, 37, true),
('JP', 'ياباني', 'Japanese', '2', 10, 38, true),
('KR', 'كوري جنوبي', 'South Korean', '2', 10, 39, true),
('VN', 'فيتنامي', 'Vietnamese', '2', 10, 40, true),
('NP', 'نيبالي', 'Nepalese', '2', 10, 41, true),
('LK', 'سريلانكي', 'Sri Lankan', '2', 10, 42, true),
('AF', 'أفغاني', 'Afghan', '2', 10, 43, true),
('TR', 'تركي', 'Turkish', '2', 10, 44, true),
('IR', 'إيراني', 'Iranian', '2', 10, 45, true);

-- 5. دول أوروبا الرئيسية
INSERT INTO nationalities (code, name_ar, name_en, id_prefix, id_length, priority, is_active) VALUES
('GB', 'بريطاني', 'British', '2', 10, 50, true),
('FR', 'فرنسي', 'French', '2', 10, 51, true),
('DE', 'ألماني', 'German', '2', 10, 52, true),
('IT', 'إيطالي', 'Italian', '2', 10, 53, true),
('ES', 'إسباني', 'Spanish', '2', 10, 54, true),
('NL', 'هولندي', 'Dutch', '2', 10, 55, true),
('BE', 'بلجيكي', 'Belgian', '2', 10, 56, true),
('CH', 'سويسري', 'Swiss', '2', 10, 57, true),
('AT', 'نمساوي', 'Austrian', '2', 10, 58, true),
('SE', 'سويدي', 'Swedish', '2', 10, 59, true),
('NO', 'نرويجي', 'Norwegian', '2', 10, 60, true),
('DK', 'دنماركي', 'Danish', '2', 10, 61, true),
('FI', 'فنلندي', 'Finnish', '2', 10, 62, true),
('PL', 'بولندي', 'Polish', '2', 10, 63, true),
('RU', 'روسي', 'Russian', '2', 10, 64, true);

-- 6. الأمريكتان
INSERT INTO nationalities (code, name_ar, name_en, id_prefix, id_length, priority, is_active) VALUES
('US', 'أمريكي', 'American', '2', 10, 70, true),
('CA', 'كندي', 'Canadian', '2', 10, 71, true),
('MX', 'مكسيكي', 'Mexican', '2', 10, 72, true),
('BR', 'برازيلي', 'Brazilian', '2', 10, 73, true),
('AR', 'أرجنتيني', 'Argentine', '2', 10, 74, true),
('CL', 'تشيلي', 'Chilean', '2', 10, 75, true),
('CO', 'كولومبي', 'Colombian', '2', 10, 76, true),
('VE', 'فنزويلي', 'Venezuelan', '2', 10, 77, true);

-- 7. دول أفريقيا الرئيسية
INSERT INTO nationalities (code, name_ar, name_en, id_prefix, id_length, priority, is_active) VALUES
('NG', 'نيجيري', 'Nigerian', '2', 10, 80, true),
('ET', 'إثيوبي', 'Ethiopian', '2', 10, 81, true),
('KE', 'كيني', 'Kenyan', '2', 10, 82, true),
('ZA', 'جنوب أفريقي', 'South African', '2', 10, 83, true),
('GH', 'غاني', 'Ghanaian', '2', 10, 84, true),
('UG', 'أوغندي', 'Ugandan', '2', 10, 85, true),
('TZ', 'تنزاني', 'Tanzanian', '2', 10, 86, true),
('SN', 'سنغالي', 'Senegalese', '2', 10, 87, true),
('ER', 'إريتري', 'Eritrean', '2', 10, 88, true),
('TD', 'تشادي', 'Chadian', '2', 10, 89, true);

-- 8. دول أوقيانوسيا
INSERT INTO nationalities (code, name_ar, name_en, id_prefix, id_length, priority, is_active) VALUES
('AU', 'أسترالي', 'Australian', '2', 10, 90, true),
('NZ', 'نيوزيلندي', 'New Zealander', '2', 10, 91, true);

-- 9. دول آسيوية إضافية
INSERT INTO nationalities (code, name_ar, name_en, id_prefix, id_length, priority, is_active) VALUES
('SG', 'سنغافوري', 'Singaporean', '2', 10, 95, true),
('MM', 'ميانماري', 'Burmese', '2', 10, 96, true),
('KH', 'كمبودي', 'Cambodian', '2', 10, 97, true),
('LA', 'لاوسي', 'Lao', '2', 10, 98, true),
('UZ', 'أوزبكي', 'Uzbek', '2', 10, 99, true),
('KZ', 'كازاخستاني', 'Kazakh', '2', 10, 100, true);