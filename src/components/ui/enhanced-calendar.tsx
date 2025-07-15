import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { DayPicker, type DayPickerSingleProps } from "react-day-picker";
import { format, getYear, setYear, setMonth, getMonth } from "date-fns";
import { ar } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type EnhancedCalendarProps = Omit<DayPickerSingleProps, 'mode'> & {
  showYearDropdown?: boolean;
  showMonthDropdown?: boolean;
  yearRange?: { start: number; end: number };
};

function EnhancedCalendar({
  className,
  classNames,
  showOutsideDays = true,
  showYearDropdown = true,
  showMonthDropdown = true,
  yearRange,
  selected,
  onSelect,
  month,
  onMonthChange,
  ...props
}: EnhancedCalendarProps) {
  const currentDate = selected as Date || new Date();
  const currentMonth = month || currentDate;
  const currentYear = getYear(currentMonth);
  const currentMonthIndex = getMonth(currentMonth);

  // إنشاء نطاق السنوات الافتراضي
  const defaultYearRange = yearRange || {
    start: currentYear - 50,
    end: currentYear + 10
  };

  const years = Array.from(
    { length: defaultYearRange.end - defaultYearRange.start + 1 },
    (_, i) => defaultYearRange.start + i
  );

  const months = [
    "يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  const handleYearChange = (year: string) => {
    const newDate = setYear(currentMonth, parseInt(year));
    onMonthChange?.(newDate);
  };

  const handleMonthChange = (monthIndex: string) => {
    const newDate = setMonth(currentMonth, parseInt(monthIndex));
    onMonthChange?.(newDate);
  };

  const goToPreviousYear = () => {
    const newDate = setYear(currentMonth, currentYear - 1);
    onMonthChange?.(newDate);
  };

  const goToNextYear = () => {
    const newDate = setYear(currentMonth, currentYear + 1);
    onMonthChange?.(newDate);
  };

  const goToPrevious10Years = () => {
    const newDate = setYear(currentMonth, currentYear - 10);
    onMonthChange?.(newDate);
  };

  const goToNext10Years = () => {
    const newDate = setYear(currentMonth, currentYear + 10);
    onMonthChange?.(newDate);
  };

  return (
    <div className="p-3 pointer-events-auto">
      {/* شريط التنقل المحسّن */}
      <div className="flex items-center justify-between mb-4 space-x-2 rtl:space-x-reverse">
        {/* أزرار التنقل السريع */}
        <div className="flex items-center space-x-1 rtl:space-x-reverse">
          <button
            type="button"
            onClick={goToPrevious10Years}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            )}
            title="السنة السابقة ×10"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goToPreviousYear}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            )}
            title="السنة السابقة"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* قوائم الشهر والسنة */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {showMonthDropdown && (
            <Select 
              value={currentMonthIndex.toString()} 
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="h-8 w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {showYearDropdown && (
            <Select 
              value={currentYear.toString()} 
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="h-8 w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {years.reverse().map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* أزرار التنقل السريع للأمام */}
        <div className="flex items-center space-x-1 rtl:space-x-reverse">
          <button
            type="button"
            onClick={goToNextYear}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            )}
            title="السنة التالية"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goToNext10Years}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            )}
            title="السنة التالية ×10"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <DayPicker
        mode="single"
        showOutsideDays={showOutsideDays}
        className={cn("", className)}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "hidden", // نخفي الـ caption الافتراضي لأننا أنشأنا واحد مخصص
          caption_label: "text-sm font-medium",
          nav: "hidden", // نخفي أزرار التنقل الافتراضية
          nav_button: "hidden",
          nav_button_previous: "hidden",
          nav_button_next: "hidden",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell:
            "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
          ),
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside:
            "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        locale={ar}
        selected={selected}
        onSelect={onSelect}
        month={currentMonth}
        onMonthChange={onMonthChange}
        {...props}
      />
    </div>
  );
}

EnhancedCalendar.displayName = "EnhancedCalendar";

export { EnhancedCalendar };