import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, TrendingUp } from "lucide-react"

interface ValidationStatsProps {
  totalRecords: number
  validRecords: number
  invalidRecords: number
  duplicateRecords?: number
  expiringDocuments?: number
  className?: string
}

export function ValidationStats({ 
  totalRecords, 
  validRecords, 
  invalidRecords, 
  duplicateRecords = 0,
  expiringDocuments = 0,
  className 
}: ValidationStatsProps) {
  const validationPercentage = totalRecords > 0 ? (validRecords / totalRecords) * 100 : 0

  const getQualityColor = (percentage: number) => {
    if (percentage >= 90) return "text-success"
    if (percentage >= 70) return "text-warning"
    return "text-destructive"
  }

  const getQualityLabel = (percentage: number) => {
    if (percentage >= 90) return "ممتازة"
    if (percentage >= 70) return "جيدة"
    return "تحتاج تحسين"
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          إحصائيات جودة البيانات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Quality Score */}
        <div className="text-center space-y-2">
          <div className={`text-3xl font-bold ${getQualityColor(validationPercentage)}`}>
            {validationPercentage.toFixed(1)}%
          </div>
          <Badge variant="outline" className={getQualityColor(validationPercentage)}>
            جودة البيانات: {getQualityLabel(validationPercentage)}
          </Badge>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            <div className="text-sm">
              <div className="font-medium">{validRecords}</div>
              <div className="text-muted-foreground">صحيحة</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-destructive" />
            <div className="text-sm">
              <div className="font-medium">{invalidRecords}</div>
              <div className="text-muted-foreground">غير صحيحة</div>
            </div>
          </div>

          {duplicateRecords > 0 && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <div className="text-sm">
                <div className="font-medium">{duplicateRecords}</div>
                <div className="text-muted-foreground">مكررة</div>
              </div>
            </div>
          )}

          {expiringDocuments > 0 && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <div className="text-sm">
                <div className="font-medium">{expiringDocuments}</div>
                <div className="text-muted-foreground">منتهية الصلاحية</div>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>التقدم نحو البيانات المثالية</span>
            <span>{validationPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                validationPercentage >= 90 ? 'bg-success' :
                validationPercentage >= 70 ? 'bg-warning' : 'bg-destructive'
              }`}
              style={{ width: `${validationPercentage}%` }}
            />
          </div>
        </div>

        {/* Recommendations */}
        {validationPercentage < 90 && (
          <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
            <div className="font-medium mb-1">توصيات للتحسين:</div>
            <ul className="space-y-1">
              {invalidRecords > 0 && <li>• مراجعة وتصحيح {invalidRecords} سجل غير صحيح</li>}
              {duplicateRecords > 0 && <li>• إزالة أو دمج {duplicateRecords} سجل مكرر</li>}
              {expiringDocuments > 0 && <li>• تجديد {expiringDocuments} وثيقة منتهية الصلاحية</li>}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}