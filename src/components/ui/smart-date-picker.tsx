import * as React from "react";
import { format, parse, isValid, addDays, startOfMonth, endOfMonth, subDays } from "date-fns";
import { ar } from "date-fns/locale";
import { CalendarIcon, Clock, Calendar } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EnhancedCalendar } from "@/components/ui/enhanced-calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SmartDatePickerProps {
  label?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  yearRange?: { start: number; end: number };
  showQuickActions?: boolean;
  dateFormat?: string;
  direction?: "ltr" | "rtl";
}

const quickActions = [
  { label: "اليوم", getValue: () => new Date() },
  { label: "أمس", getValue: () => subDays(new Date(), 1) },
  { label: "الأسبوع الماضي", getValue: () => subDays(new Date(), 7) },
  { label: "بداية الشهر", getValue: () => startOfMonth(new Date()) },
  { label: "نهاية الشهر", getValue: () => endOfMonth(new Date()) },
];

export function SmartDatePicker({
  label,
  value,
  onChange,
  placeholder = "اختر التاريخ",
  required = false,
  disabled = false,
  className,
  yearRange,
  showQuickActions = true,
  dateFormat = "dd/MM/yyyy",
  direction = "rtl",
}: SmartDatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [month, setMonth] = React.useState<Date>(value || new Date());

  // تحديث القيمة النصية عند تغيير القيمة المختارة
  React.useEffect(() => {
    if (value) {
      setInputValue(format(value, dateFormat, { locale: ar }));
      setMonth(value);
    } else {
      setInputValue("");
    }
  }, [value, dateFormat]);

  // معالجة تغيير النص المدخل
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // محاولة تحليل التاريخ المدخل
    if (newValue.trim()) {
      // دعم تنسيقات مختلفة للتاريخ
      const formats = [
        "dd/MM/yyyy",
        "d/M/yyyy", 
        "dd-MM-yyyy",
        "d-M-yyyy",
        "yyyy/MM/dd",
        "yyyy-MM-dd"
      ];

      for (const fmt of formats) {
        try {
          const parsedDate = parse(newValue, fmt, new Date());
          if (isValid(parsedDate)) {
            onChange?.(parsedDate);
            setMonth(parsedDate);
            return;
          }
        } catch {
          // تجاهل الأخطاء ومتابعة تجربة التنسيق التالي
        }
      }
    }
  };

  // معالجة اختيار التاريخ من التقويم
  const handleDateSelect = (selectedDate: Date | undefined) => {
    onChange?.(selectedDate);
    if (selectedDate) {
      setInputValue(format(selectedDate, dateFormat, { locale: ar }));
      setOpen(false);
    }
  };

  // معالجة الإجراءات السريعة
  const handleQuickAction = (getDate: () => Date) => {
    const selectedDate = getDate();
    onChange?.(selectedDate);
    setInputValue(format(selectedDate, dateFormat, { locale: ar }));
    setOpen(false);
  };

  return (
    <div className={cn("space-y-2", className)} dir={direction}>
      {label && (
        <Label htmlFor="date-input" className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive mr-1">*</span>}
        </Label>
      )}
      
      <Popover open={open} onOpenChange={setOpen}>
        <div className="flex gap-2">
          {/* حقل الإدخال النصي */}
          <Input
            id="date-input"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "flex-1",
              !isValid(value) && inputValue.trim() && "border-destructive"
            )}
            dir="ltr" // التاريخ يُكتب من اليسار لليمين
          />
          
          {/* زر فتح التقويم */}
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              disabled={disabled}
              className="shrink-0"
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
        </div>

        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* التقويم المحسّن */}
            <div className="border-l border-border">
              <EnhancedCalendar
                selected={value}
                onSelect={handleDateSelect}
                month={month}
                onMonthChange={setMonth}
                yearRange={yearRange}
                initialFocus
              />
            </div>

            {/* الإجراءات السريعة */}
            {showQuickActions && (
              <div className="w-40 border-r border-border bg-muted/30">
                <div className="p-3">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    اختيار سريع
                  </h4>
                  <div className="space-y-1">
                    {quickActions.map((action) => (
                      <Button
                        key={action.label}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start h-8 px-2 text-sm"
                        onClick={() => handleQuickAction(action.getValue)}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* معلومات إضافية */}
          <div className="border-t border-border p-2 bg-muted/30">
            <p className="text-xs text-muted-foreground text-center">
              يمكنك كتابة التاريخ مباشرة أو اختياره من التقويم
            </p>
            {inputValue.trim() && !isValid(value) && (
              <p className="text-xs text-destructive text-center mt-1">
                تنسيق التاريخ غير صحيح. استخدم: DD/MM/YYYY
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}