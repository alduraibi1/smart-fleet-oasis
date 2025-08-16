
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Car, Users, Calendar, DollarSign, Settings, 
  Package, UserCheck, BarChart3, FileText, ArrowRight 
} from 'lucide-react';

interface QuickLinkProps {
  entity_type: 'customer' | 'vehicle' | 'contract';
  entity_id: string;
  entity_name: string;
}

export function QuickLinks({ entity_type, entity_id, entity_name }: QuickLinkProps) {
  const navigate = useNavigate();

  const getRelatedLinks = () => {
    switch (entity_type) {
      case 'customer':
        return [
          { label: 'عقود العميل', path: `/contracts?customer=${entity_id}`, icon: Calendar },
          { label: 'مدفوعات العميل', path: `/accounting?customer=${entity_id}`, icon: DollarSign },
          { label: 'تقييمات العميل', path: `/customers/${entity_id}/ratings`, icon: UserCheck },
        ];
      case 'vehicle':
        return [
          { label: 'عقود المركبة', path: `/contracts?vehicle=${entity_id}`, icon: Calendar },
          { label: 'صيانة المركبة', path: `/maintenance?vehicle=${entity_id}`, icon: Settings },
          { label: 'مالك المركبة', path: `/owners?vehicle=${entity_id}`, icon: Users },
        ];
      case 'contract':
        return [
          { label: 'تفاصيل العميل', path: `/customers?from_contract=${entity_id}`, icon: Users },
          { label: 'تفاصيل المركبة', path: `/vehicles?from_contract=${entity_id}`, icon: Car },
          { label: 'مدفوعات العقد', path: `/accounting?contract=${entity_id}`, icon: DollarSign },
        ];
      default:
        return [];
    }
  };

  const links = getRelatedLinks();

  if (links.length === 0) return null;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <ArrowRight className="h-4 w-4" />
          روابط سريعة - {entity_name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {links.map((link, index) => {
            const IconComponent = link.icon;
            return (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => navigate(link.path)}
              >
                <IconComponent className="h-4 w-4" />
                {link.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// مكون للإحصائيات السريعة
export function EntityStats({ entity_type, entity_id }: Omit<QuickLinkProps, 'entity_name'>) {
  // هذا المكون يمكن تطويره لاحقاً لعرض إحصائيات سريعة حسب نوع الكيان
  return null;
}
