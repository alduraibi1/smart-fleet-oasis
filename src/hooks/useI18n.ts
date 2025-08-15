
import { useState, useEffect } from 'react';
import { i18n, type Locale } from '@/lib/i18n';

export const useI18n = () => {
  const [locale, setLocaleState] = useState<Locale>(i18n.getLocale());

  const setLocale = (newLocale: Locale) => {
    i18n.setLocale(newLocale);
    setLocaleState(newLocale);
  };

  const t = (key: string, fallback?: string) => {
    return i18n.t(key, fallback);
  };

  useEffect(() => {
    i18n.init();
    setLocaleState(i18n.getLocale());
  }, []);

  return {
    locale,
    setLocale,
    t,
    isRTL: locale === 'ar',
  };
};
