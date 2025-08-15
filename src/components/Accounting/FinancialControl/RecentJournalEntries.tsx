
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { RefreshCcw } from "lucide-react";

type JournalEntryRow = {
  id: string;
  entry_number: string | null;
  entry_date: string | null;
  description: string | null;
  reference_type: string | null;
  total_amount: number | null;
  status: string | null;
  created_at: string | null;
};

export function RecentJournalEntries() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["recent-journal-entries"],
    queryFn: async (): Promise<JournalEntryRow[]> => {
      console.log("[RecentJournalEntries] fetching recent journal entries...");
      const { data, error } = await supabase
        .from("journal_entries")
        .select("id, entry_number, entry_date, description, reference_type, total_amount, status, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("[RecentJournalEntries] error:", error);
        throw error;
      }
      return (data as JournalEntryRow[]) ?? [];
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">أحدث القيود اليومية</CardTitle>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCcw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          <span className="sr-only">تحديث</span>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="py-10 text-center text-muted-foreground">جاري التحميل...</div>
        )}
        {error && (
          <div className="py-10 text-center text-red-600">
            حدث خطأ أثناء جلب القيود اليومية
          </div>
        )}
        {!isLoading && !error && (
          <>
            {(!data || data.length === 0) ? (
              <div className="py-10 text-center text-muted-foreground">
                لا توجد قيود بعد. سيتم إنشاء قيود تلقائياً عند إنشاء عقد أو سند قبض أو إكمال صيانة أو إضافة حركة مخزون.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">رقم القيد</TableHead>
                      <TableHead className="whitespace-nowrap">التاريخ</TableHead>
                      <TableHead className="whitespace-nowrap">الوصف</TableHead>
                      <TableHead className="whitespace-nowrap">مرجع العملية</TableHead>
                      <TableHead className="whitespace-nowrap text-right">المبلغ</TableHead>
                      <TableHead className="whitespace-nowrap text-center">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data!.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">
                          {row.entry_number ?? "-"}
                        </TableCell>
                        <TableCell>
                          {row.entry_date
                            ? new Date(row.entry_date).toLocaleDateString("ar-SA")
                            : "-"}
                        </TableCell>
                        <TableCell className="max-w-[360px] truncate">
                          {row.description ?? "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {row.reference_type ?? "-"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {typeof row.total_amount === "number"
                            ? formatCurrency(row.total_amount)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              row.status === "posted"
                                ? "default"
                                : row.status === "draft"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {row.status ?? "-"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default RecentJournalEntries;
