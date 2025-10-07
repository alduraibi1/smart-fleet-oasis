import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, DollarSign } from "lucide-react";

interface PricingRangeSectionProps {
  minDailyRate: number;
  dailyRate: number;
  maxDailyRate: number;
  onChange: (field: 'min_daily_rate' | 'daily_rate' | 'max_daily_rate', value: number) => void;
}

export const PricingRangeSection = ({
  minDailyRate,
  dailyRate,
  maxDailyRate,
  onChange,
}: PricingRangeSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">نطاق التسعير</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="min_daily_rate" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            الحد الأدنى (ريال/يوم)
          </Label>
          <Input
            id="min_daily_rate"
            type="number"
            min="0"
            step="0.01"
            value={minDailyRate}
            onChange={(e) => onChange('min_daily_rate', parseFloat(e.target.value) || 0)}
            placeholder="السعر الأدنى"
            className="text-right"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="daily_rate" className="flex items-center gap-2 font-semibold text-primary">
            <DollarSign className="h-4 w-4" />
            السعر الافتراضي (ريال/يوم) *
          </Label>
          <Input
            id="daily_rate"
            type="number"
            min="0"
            step="0.01"
            required
            value={dailyRate}
            onChange={(e) => onChange('daily_rate', parseFloat(e.target.value) || 0)}
            placeholder="السعر الافتراضي"
            className="text-right border-primary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_daily_rate" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            الحد الأقصى (ريال/يوم)
          </Label>
          <Input
            id="max_daily_rate"
            type="number"
            min="0"
            step="0.01"
            value={maxDailyRate}
            onChange={(e) => onChange('max_daily_rate', parseFloat(e.target.value) || 0)}
            placeholder="السعر الأقصى"
            className="text-right"
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        💡 يمكنك تحديد نطاق سعري مرن للمركبة حسب الطلب والموسم
      </p>
    </div>
  );
};
