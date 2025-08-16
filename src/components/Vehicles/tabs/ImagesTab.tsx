import { Image as ImageIcon, Download, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Vehicle } from '@/types/vehicle';

interface ImagesTabProps {
  vehicle: Vehicle;
}

export default function ImagesTab({ vehicle }: ImagesTabProps) {
  return (
    <div className="space-y-4">
      {vehicle.images && vehicle.images.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicle.images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative group">
                <img
                  src={image.url}
                  alt={image.description || 'صورة المركبة'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button variant="secondary" size="sm">
                    <Eye className="h-4 w-4" />
                    عرض
                  </Button>
                  <Button variant="secondary" size="sm">
                    <Download className="h-4 w-4" />
                    تحميل
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium">{image.description || 'بدون وصف'}</p>
                <p className="text-xs text-muted-foreground">
                  رفع في: {new Date(image.uploadDate || image.upload_date || '').toLocaleDateString('ar')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">لا توجد صور</p>
            <p className="text-muted-foreground">لم يتم رفع أي صور لهذه المركبة بعد</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
