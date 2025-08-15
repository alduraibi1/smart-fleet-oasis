
export type Locale = 'ar' | 'en';

interface Translations {
  [key: string]: {
    ar: string;
    en: string;
  };
}

const translations: Translations = {
  // Common
  'common.loading': { ar: 'جاري التحميل...', en: 'Loading...' },
  'common.error': { ar: 'خطأ', en: 'Error' },
  'common.success': { ar: 'تم بنجاح', en: 'Success' },
  'common.cancel': { ar: 'إلغاء', en: 'Cancel' },
  'common.save': { ar: 'حفظ', en: 'Save' },
  'common.delete': { ar: 'حذف', en: 'Delete' },
  'common.edit': { ar: 'تعديل', en: 'Edit' },
  'common.add': { ar: 'إضافة', en: 'Add' },
  
  // Error messages
  'error.unexpected': { ar: 'حدث خطأ غير متوقع', en: 'An unexpected error occurred' },
  'error.unauthorized': { ar: 'غير مصرح', en: 'Unauthorized' },
  'error.network': { ar: 'خطأ في الشبكة', en: 'Network error' },
  
  // App specific
  'app.title': { ar: 'نظام إدارة تأجير السيارات', en: 'Car Rental Management System' },
  'auth.login': { ar: 'تسجيل الدخول', en: 'Login' },
  'auth.logout': { ar: 'تسجيل الخروج', en: 'Logout' },
};

class I18n {
  private locale: Locale = 'ar';

  setLocale(locale: Locale) {
    this.locale = locale;
    localStorage.setItem('locale', locale);
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }

  getLocale(): Locale {
    return this.locale;
  }

  t(key: string, fallback?: string): string {
    const translation = translations[key];
    if (translation) {
      return translation[this.locale];
    }
    return fallback || key;
  }

  init() {
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && ['ar', 'en'].includes(savedLocale)) {
      this.setLocale(savedLocale);
    } else {
      this.setLocale('ar'); // Default to Arabic
    }
  }
}

export const i18n = new I18n();

// Initialize i18n function
export const initializeI18n = () => {
  i18n.init();
};
