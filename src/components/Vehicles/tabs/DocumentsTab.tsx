import { FileText, Download, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Vehicle } from '@/types/vehicle';

interface DocumentsTabProps {
  vehicle: Vehicle;
  getDocumentStatus: (status: string) => { label: string; variant: any; icon: any };
  getDocumentTypeLabel: (type: string) => string;
}

export default function DocumentsTab({ vehicle, getDocumentStatus, getDocumentTypeLabel }: DocumentsTabProps) {
  return (
    <div className="space-y-4">
      {vehicle.documents && vehicle.documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicle.documents.map((doc) => {
            const docStatus = getDocumentStatus(doc.status);
            return (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{doc.name}</p>
                        <Badge variant="outline" className="text-xs mb-2">
                          {getDocumentTypeLabel(doc.type)}
                        </Badge>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            رفع في: {new Date(doc.uploadDate).toLocaleDateString('ar')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ينتهي في: {new Date(doc.expiryDate).toLocaleDateString('ar')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Badge variant={docStatus.variant} className="flex items-center gap-1">
                      <docStatus.icon className="h-3 w-3" />
                      {docStatus.label}
                    </Badge>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                      عرض
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                      تحميل
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">لا توجد مستندات</p>
            <p className="text-muted-foreground">لم يتم رفع أي مستندات لهذه المركبة بعد</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}