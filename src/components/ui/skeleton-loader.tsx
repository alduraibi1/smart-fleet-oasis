import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-muted via-muted/50 to-muted",
        "bg-[length:200%_100%] animate-shimmer",
        className
      )}
      {...props}
    />
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

function AuthSkeleton() {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center space-y-4">
        <Skeleton className="w-16 h-16 rounded-2xl mx-auto" />
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
      
      <div className="p-6 space-y-6 bg-card rounded-lg border">
        <Skeleton className="h-6 w-24 mx-auto" />
        <FormSkeleton />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 mx-auto" />
          <Skeleton className="h-4 w-40 mx-auto" />
        </div>
      </div>
    </div>
  );
}

export { Skeleton, FormSkeleton, AuthSkeleton };