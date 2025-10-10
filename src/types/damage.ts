// Unified Damage Model - نموذج موحد للأضرار يجمع بين المعلومات التفصيلية والموقع البصري

export type DamageView = 'front' | 'back' | 'left' | 'right' | 'top';

export type DamageSeverity = 'minor' | 'moderate' | 'major';

export type DamageType = 
  | 'scratch' // خدش
  | 'dent' // انبعاج
  | 'crack' // تشقق
  | 'broken' // كسر
  | 'paint_damage' // ضرر طلاء
  | 'rust' // صدأ
  | 'mechanical' // ميكانيكي
  | 'electrical' // كهربائي
  | 'interior' // داخلي
  | 'other'; // أخرى

export type RepairMethod =
  | 'polish' // تلميع
  | 'paint' // طلاء
  | 'panel_replacement' // استبدال قطعة
  | 'dent_removal' // إزالة انبعاج
  | 'part_replacement' // استبدال جزء
  | 'welding' // لحام
  | 'electrical_repair' // إصلاح كهربائي
  | 'professional_repair' // إصلاح احترافي
  | 'other'; // أخرى

export type RepairUrgency = 
  | 'immediate' // فوري
  | 'high' // عالي
  | 'medium' // متوسط
  | 'low'; // منخفض

// الموقع البصري على الرسم التخطيطي
export interface VisualLocation {
  view: DamageView;
  x: number; // نسبة من 0 إلى 100
  y: number; // نسبة من 0 إلى 100
}

// نموذج الضرر الموحد
export interface UnifiedDamage {
  id: string;
  
  // المعلومات الأساسية
  location: string; // الموقع الوصفي (مثل: "الباب الأمامي الأيمن")
  severity: DamageSeverity;
  description: string;
  estimatedCost: number;
  
  // المعلومات التفصيلية الإضافية
  damageType: DamageType;
  repairMethod?: RepairMethod;
  repairUrgency: RepairUrgency;
  
  // الموقع البصري على الرسم التخطيطي
  visualLocation?: VisualLocation;
  
  // صور الضرر
  photos: string[]; // URLs للصور
  
  // معلومات إضافية
  notes?: string;
  createdAt: Date;
}

// Labels للعرض
export const damageTypeLabels: Record<DamageType, string> = {
  scratch: 'خدش',
  dent: 'انبعاج',
  crack: 'تشقق',
  broken: 'كسر',
  paint_damage: 'ضرر طلاء',
  rust: 'صدأ',
  mechanical: 'ميكانيكي',
  electrical: 'كهربائي',
  interior: 'داخلي',
  other: 'أخرى'
};

export const repairMethodLabels: Record<RepairMethod, string> = {
  polish: 'تلميع',
  paint: 'طلاء',
  panel_replacement: 'استبدال قطعة',
  dent_removal: 'إزالة انبعاج',
  part_replacement: 'استبدال جزء',
  welding: 'لحام',
  electrical_repair: 'إصلاح كهربائي',
  professional_repair: 'إصلاح احترافي',
  other: 'أخرى'
};

export const repairUrgencyLabels: Record<RepairUrgency, { label: string; color: string }> = {
  immediate: { label: 'فوري', color: 'text-red-600' },
  high: { label: 'عالي', color: 'text-orange-600' },
  medium: { label: 'متوسط', color: 'text-yellow-600' },
  low: { label: 'منخفض', color: 'text-green-600' }
};

export const severityLabels: Record<DamageSeverity, { label: string; color: string }> = {
  minor: { label: 'بسيط', color: 'text-yellow-600' },
  moderate: { label: 'متوسط', color: 'text-orange-600' },
  major: { label: 'كبير', color: 'text-red-600' }
};

// دوال مساعدة
export const createEmptyDamage = (): UnifiedDamage => ({
  id: Date.now().toString(),
  location: '',
  severity: 'minor',
  description: '',
  estimatedCost: 0,
  damageType: 'scratch',
  repairUrgency: 'medium',
  photos: [],
  createdAt: new Date()
});

export const getSeverityColor = (severity: DamageSeverity): string => {
  switch (severity) {
    case 'minor': return '#FCD34D';
    case 'moderate': return '#FB923C';
    case 'major': return '#EF4444';
    default: return '#FCD34D';
  }
};
