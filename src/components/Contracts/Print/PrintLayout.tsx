import { ReactNode } from 'react';
import { useSystemSettings } from '@/hooks/useSystemSettings';

interface PrintLayoutProps {
  children: ReactNode;
  title?: string;
  showLogo?: boolean;
  showSeal?: boolean;
}

export const PrintLayout = ({ children, title, showLogo = true, showSeal = false }: PrintLayoutProps) => {
  const { settings } = useSystemSettings();

  return (
    <div className="print:block hidden">
      <div className="max-w-[210mm] mx-auto bg-white p-8 print:p-0" style={{ minHeight: '297mm' }}>
        {/* الترويسة */}
        {showLogo && (
          <div className="flex items-start justify-between mb-6 pb-4 border-b-2 border-gray-300">
            {/* الشعار */}
            <div className="flex-shrink-0">
              {settings?.companyLogoUrl && (
                <img
                  src={settings.companyLogoUrl}
                  alt="شعار الشركة"
                  className="h-20 object-contain"
                />
              )}
            </div>

            {/* معلومات الشركة */}
            <div className="text-right flex-1 mr-4">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{settings?.companyName}</h1>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{settings?.companyAddress}</p>
                <p>
                  <span className="font-semibold">الهاتف:</span> {settings?.companyPhone}
                </p>
                <p>
                  <span className="font-semibold">البريد:</span> {settings?.companyEmail}
                </p>
                <p>
                  <span className="font-semibold">الرقم الضريبي:</span> {settings?.taxNumber}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* العنوان */}
        {title && (
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-1">{title}</h2>
            <div className="text-sm text-gray-500">{title} / {title}</div>
          </div>
        )}

        {/* المحتوى */}
        <div className="mb-8">{children}</div>

        {/* الختم - في الأسفل */}
        {showSeal && settings?.companySealUrl && (
          <div className="mt-8 pt-4 border-t border-gray-300">
            <div className="flex justify-end">
              <img
                src={settings.companySealUrl}
                alt="ختم الشركة"
                className="h-24 object-contain opacity-80"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};