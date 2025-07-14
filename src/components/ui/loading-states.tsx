import React from "react"
import { Skeleton } from "./skeleton"
import { LoadingSpinner } from "./loading-spinner"
import { cn } from "@/lib/utils"

interface LoadingCardProps {
  className?: string
}

export const LoadingCard = ({ className }: LoadingCardProps) => (
  <div className={cn("dashboard-card space-y-4", className)}>
    <Skeleton className="h-4 w-[250px]" />
    <Skeleton className="h-4 w-[200px]" />
    <Skeleton className="h-4 w-[150px]" />
  </div>
)

export const LoadingTable = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    ))}
  </div>
)

export const LoadingPage = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center space-y-4">
      <LoadingSpinner size="xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px] mx-auto" />
        <Skeleton className="h-4 w-[150px] mx-auto" />
      </div>
    </div>
  </div>
)

interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  className?: string
}

export const LoadingOverlay = ({ isLoading, children, className }: LoadingOverlayProps) => (
  <div className={cn("relative", className)}>
    {children}
    {isLoading && (
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
        <LoadingSpinner size="lg" />
      </div>
    )}
  </div>
)