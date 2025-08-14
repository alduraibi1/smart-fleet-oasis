
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Cancel, 
  Search,
  Filter,
  Download,
  Upload,
  Print,
  Settings,
  User,
  Bell,
  Menu,
  X
} from 'lucide-react';

export const ButtonTest = () => {
  const handleClick = (buttonName: string) => {
    console.log(`${buttonName} button clicked!`);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">اختبار جميع الأزرار</h2>
      
      {/* Primary Buttons */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">الأزرار الأساسية</h3>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => handleClick('إضافة')}>
            <Plus className="h-4 w-4 mr-2" />
            إضافة
          </Button>
          <Button onClick={() => handleClick('تعديل')}>
            <Edit className="h-4 w-4 mr-2" />
            تعديل
          </Button>
          <Button onClick={() => handleClick('حذف')} variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            حذف
          </Button>
          <Button onClick={() => handleClick('حفظ')} variant="success">
            <Save className="h-4 w-4 mr-2" />
            حفظ
          </Button>
          <Button onClick={() => handleClick('إلغاء')} variant="outline">
            <Cancel className="h-4 w-4 mr-2" />
            إلغاء
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">أزرار الإجراءات</h3>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => handleClick('بحث')} variant="outline">
            <Search className="h-4 w-4 mr-2" />
            بحث
          </Button>
          <Button onClick={() => handleClick('فلترة')} variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            فلترة
          </Button>
          <Button onClick={() => handleClick('تصدير')} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            تصدير
          </Button>
          <Button onClick={() => handleClick('استيراد')} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            استيراد
          </Button>
          <Button onClick={() => handleClick('طباعة')} variant="outline">
            <Print className="h-4 w-4 mr-2" />
            طباعة
          </Button>
        </div>
      </div>

      {/* Icon Buttons */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">الأزرار الأيقونية</h3>
        <div className="flex flex-wrap gap-2">
          <Button size="icon" onClick={() => handleClick('إعدادات')}>
            <Settings className="h-4 w-4" />
          </Button>
          <Button size="icon" onClick={() => handleClick('مستخدم')}>
            <User className="h-4 w-4" />
          </Button>
          <Button size="icon" onClick={() => handleClick('إشعارات')}>
            <Bell className="h-4 w-4" />
          </Button>
          <Button size="icon" onClick={() => handleClick('قائمة')}>
            <Menu className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={() => handleClick('إغلاق')}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Different Variants */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">أشكال مختلفة من الأزرار</h3>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => handleClick('افتراضي')}>افتراضي</Button>
          <Button variant="secondary" onClick={() => handleClick('ثانوي')}>ثانوي</Button>
          <Button variant="outline" onClick={() => handleClick('محدد')}>محدد</Button>
          <Button variant="ghost" onClick={() => handleClick('شفاف')}>شفاف</Button>
          <Button variant="link" onClick={() => handleClick('رابط')}>رابط</Button>
          <Button variant="gradient" onClick={() => handleClick('متدرج')}>متدرج</Button>
          <Button variant="glow" onClick={() => handleClick('متوهج')}>متوهج</Button>
        </div>
      </div>

      {/* Different Sizes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">أحجام مختلفة</h3>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => handleClick('صغير')}>صغير</Button>
          <Button onClick={() => handleClick('عادي')}>عادي</Button>
          <Button size="lg" onClick={() => handleClick('كبير')}>كبير</Button>
          <Button size="xl" onClick={() => handleClick('كبير جداً')}>كبير جداً</Button>
        </div>
      </div>
    </div>
  );
};
