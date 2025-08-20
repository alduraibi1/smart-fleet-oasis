
import * as React from "react"
import { cn } from "@/lib/utils"
import { Info, Lightbulb, AlertCircle } from "lucide-react"

export interface Suggestion {
  type: 'info' | 'tip' | 'warning'
  message: string
  action?: () => void
}

export interface SmartSuggestionsProps {
  suggestions: Suggestion[]
  className?: string
}

const SmartSuggestions = React.forwardRef<HTMLDivElement, SmartSuggestionsProps>(
  ({ suggestions, className }, ref) => {
    if (!suggestions.length) return null

    const getIcon = (type: Suggestion['type']) => {
      switch (type) {
        case 'info':
          return Info
        case 'tip':
          return Lightbulb
        case 'warning':
          return AlertCircle
        default:
          return Info
      }
    }

    const getStyles = (type: Suggestion['type']) => {
      switch (type) {
        case 'info':
          return 'text-blue-600 bg-blue-50 border-blue-200'
        case 'tip':
          return 'text-green-600 bg-green-50 border-green-200'
        case 'warning':
          return 'text-orange-600 bg-orange-50 border-orange-200'
        default:
          return 'text-gray-600 bg-gray-50 border-gray-200'
      }
    }

    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        {suggestions.map((suggestion, index) => {
          const Icon = getIcon(suggestion.type)
          return (
            <div
              key={index}
              className={cn(
                "flex items-start gap-2 p-2 rounded-md border text-sm",
                getStyles(suggestion.type),
                suggestion.action && "cursor-pointer hover:opacity-80"
              )}
              onClick={suggestion.action}
            >
              <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{suggestion.message}</span>
            </div>
          )
        })}
      </div>
    )
  }
)

SmartSuggestions.displayName = "SmartSuggestions"

export { SmartSuggestions }
