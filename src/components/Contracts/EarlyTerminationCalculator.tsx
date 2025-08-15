
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MinimalContractForEarlyTermination, calculateEarlyTerminationCharges } from "@/utils/earlyTerminationUtils";

interface Props {
  contract: MinimalContractForEarlyTermination;
  requestedDateISO: string;
}

export const EarlyTerminationCalculator = ({ contract, requestedDateISO }: Props) => {
  const breakdown = calculateEarlyTerminationCharges(contract, requestedDateISO);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-base">تفاصيل التكلفة</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>الأيام المستخدمة</span>
          <span className="font-medium">{breakdown.daysUsed} يوم</span>
        </div>
        <div className="flex justify-between">
          <span>الحد الأدنى للأيام</span>
          <span className="font-medium">{breakdown.minimumDays} يوم</span>
        </div>
        <div className="flex justify-between">
          <span>الأجرة اليومية</span>
          <span className="font-medium">{breakdown.dailyRate.toLocaleString()} ريال</span>
        </div>
        <div className="flex justify-between">
          <span>مبلغ الأيام الفعلية</span>
          <span className="font-medium">{breakdown.baseProrated.toLocaleString()} ريال</span>
        </div>
        <div className="flex justify-between">
          <span>مبلغ الحد الأدنى</span>
          <span className="font-medium">{breakdown.minimumCharge.toLocaleString()} ريال</span>
        </div>
        <div className="flex justify-between">
          <span>رسوم الإلغاء المبكر</span>
          <span className="font-medium">{breakdown.fee.toLocaleString()} ريال</span>
        </div>
        <div className="flex justify-between text-lg">
          <span className="font-semibold">الإجمالي المستحق</span>
          <span className="font-bold text-green-600">{breakdown.totalDue.toLocaleString()} ريال</span>
        </div>
        <ul className="list-disc pr-4 text-muted-foreground">
          {breakdown.notes.map((n, i) => <li key={i}>{n}</li>)}
        </ul>
      </CardContent>
    </Card>
  );
};
