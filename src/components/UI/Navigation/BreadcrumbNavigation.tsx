
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

// ترجمة أسماء المسارات
const pathLabels: Record<string, string> = {
  '': 'الرئيسية',
  'customers': 'العملاء',
  'customers-new': 'العملاء المطور',
  'vehicles': 'المركبات',
  'contracts': 'العقود',
  'maintenance': 'الصيانة',
  'accounting': 'المحاسبة',
  'reports': 'التقارير',
  'owners': 'المالكين',
  'hr': 'الموارد البشرية',
  'suppliers': 'الموردين',
  'inventory': 'المخزون',
  'system': 'إدارة النظام',
  'notification-settings': 'إعدادات الإشعارات'
};

export function BreadcrumbNavigation() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'الرئيسية', href: '/' }
  ];

  let currentPath = '';
  pathnames.forEach((segment) => {
    currentPath += `/${segment}`;
    const label = pathLabels[segment] || segment;
    breadcrumbItems.push({
      label,
      href: currentPath
    });
  });

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <div className="px-6 py-2 border-b bg-muted/50">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={item.href || item.label}>
              <BreadcrumbItem>
                {index === breadcrumbItems.length - 1 ? (
                  <BreadcrumbPage className="font-medium">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={item.href!} className="flex items-center gap-1 hover:text-primary">
                      {index === 0 && <Home className="h-4 w-4" />}
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbItems.length - 1 && (
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
