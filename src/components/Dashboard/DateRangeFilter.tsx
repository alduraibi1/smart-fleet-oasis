
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { DateRange } from "react-day-picker";

interface DateRangeFilterProps {
  onDateRangeChange: (range: DateRange | undefined) => void;
  onPresetChange: (preset: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  onDateRangeChange,
  onPresetChange,
  onRefresh,
  isLoading = false
}) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  const [selectedPreset, setSelectedPreset] = useState("this_month");

  const presets = [
    { value: "today", label: "اليوم" },
    { value: "yesterday", label: "أمس" },
    { value: "this_week", label: "هذا الأسبوع" },
    { value: "last_week", label: "الأسبوع الماضي" },
    { value: "this_month", label: "هذا الشهر" },
    { value: "last_month", label: "الشهر الماضي" },
    { value: "this_quarter", label: "هذا الربع" },
    { value: "last_quarter", label: "الربع الماضي" },
    { value: "this_year", label: "هذا العام" },
    { value: "last_year", label: "العام الماضي" },
    { value: "custom", label: "فترة مخصصة" }
  ];

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    onPresetChange(preset);
    
    const now = new Date();
    let newRange: DateRange | undefined;

    switch (preset) {
      case "today":
        newRange = { from: now, to: now };
        break;
      case "yesterday":
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        newRange = { from: yesterday, to: yesterday };
        break;
      case "this_week":
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        newRange = { from: startOfWeek, to: now };
        break;
      case "this_month":
        newRange = { 
          from: new Date(now.getFullYear(), now.getMonth(), 1), 
          to: now 
        };
        break;
      case "last_month":
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        newRange = { from: lastMonth, to: lastMonthEnd };
        break;
      case "this_year":
        newRange = { 
          from: new Date(now.getFullYear(), 0, 1), 
          to: now 
        };
        break;
      default:
        newRange = dateRange;
    }

    if (preset !== "custom") {
      setDateRange(newRange);
      onDateRangeChange(newRange);
    }
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    onDateRangeChange(range);
    if (range?.from && range?.to) {
      setSelectedPreset("custom");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">الفترة الزمنية</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Select value={selectedPreset} onValueChange={handlePresetChange}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="اختر الفترة" />
              </SelectTrigger>
              <SelectContent>
                {presets.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {selectedPreset === "custom" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yyyy", { locale: ar })} -{" "}
                        {format(dateRange.to, "dd/MM/yyyy", { locale: ar })}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy", { locale: ar })
                    )
                  ) : (
                    "اختر الفترة المخصصة"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
