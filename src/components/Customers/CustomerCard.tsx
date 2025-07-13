import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Customer } from "@/types";
import { Phone, Mail, Star, Calendar, FileText, Edit } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface CustomerCardProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onView: (customer: Customer) => void;
}

export const CustomerCard = ({ customer, onEdit, onView }: CustomerCardProps) => {
  const getDocumentStatus = () => {
    const licenseExpiry = new Date(customer.licenseExpiry);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((licenseExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: 'expired', text: 'منتهية الصلاحية', color: 'destructive' };
    if (daysUntilExpiry <= 30) return { status: 'expiring', text: 'تنتهي قريباً', color: 'secondary' };
    return { status: 'valid', text: 'صالحة', color: 'default' };
  };

  const documentStatus = getDocumentStatus();
  const isActive = customer.totalRentals > 0;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer.name}`} />
              <AvatarFallback>{customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{customer.name}</h3>
              <div className="flex items-center gap-1 mt-1">
                {renderStars(customer.rating)}
                <span className="text-sm text-muted-foreground mr-1">({customer.rating})</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "نشط" : "غير نشط"}
            </Badge>
            <Badge variant={documentStatus.color as any}>
              {documentStatus.text}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span dir="ltr">{customer.phone}</span>
        </div>
        
        {customer.email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{customer.email}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>الرخصة تنتهي: {format(new Date(customer.licenseExpiry), 'dd/MM/yyyy', { locale: ar })}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>إجمالي الإيجارات: {customer.totalRentals}</span>
        </div>

        <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onView(customer);
            }}
            className="flex-1"
          >
            عرض التفاصيل
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(customer);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};