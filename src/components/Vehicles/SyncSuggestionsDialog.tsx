
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnmatchedSuggestion, MatchSuggestion } from "@/hooks/useTrackerSync";
import { Copy, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SyncSuggestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestions: UnmatchedSuggestion[];
  onApplySuggestion?: (devicePlate: string, trackerId: string, suggestion: MatchSuggestion) => void;
}

const SyncSuggestionsDialog: React.FC<SyncSuggestionsDialogProps> = ({
  open,
  onOpenChange,
  suggestions,
  onApplySuggestion
}) => {
  const { toast } = useToast();

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "تم النسخ",
        description: "تم نسخ النص إلى الحافظة",
        variant: "default"
      });
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 0.75) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            اقتراحات مطابقة الأجهزة غير المطابقة
          </DialogTitle>
          <DialogDescription>
            تم العثور على {suggestions.length} جهاز غير مطابق مع اقتراحات للمطابقة المحتملة
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <Card key={index} className="border-l-4 border-l-amber-400">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>جهاز: {suggestion.devicePlate}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyToClipboard(suggestion.devicePlate)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    مُطبّع: {suggestion.normalizedPlate}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {suggestion.topCandidates.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground mb-3">
                      الاقتراحات المحتملة:
                    </h4>
                    {suggestion.topCandidates.map((candidate, candIndex) => (
                      <div
                        key={candIndex}
                        className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{candidate.plate}</span>
                            <Badge 
                              className={`text-xs ${getScoreColor(candidate.score)}`}
                              variant="outline"
                            >
                              {Math.round(candidate.score * 100)}%
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {candidate.reason}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyToClipboard(candidate.plate)}
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          {onApplySuggestion && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onApplySuggestion(
                                suggestion.devicePlate,
                                "", // We don't have trackerId here, will need to be handled
                                candidate
                              )}
                              disabled={candidate.score < 0.8}
                            >
                              تطبيق
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                    <p>لم يتم العثور على اقتراحات مناسبة لهذا الجهاز</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            * يمكنك نسخ أرقام اللوحات واستخدامها في المزامنة اليدوية
          </div>
          <Button onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SyncSuggestionsDialog;
