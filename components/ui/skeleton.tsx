import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean
}

function Skeleton({
  className,
  shimmer = true,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md",
        shimmer
          ? "skeleton-shimmer"
          : "animate-pulse bg-white/[0.06]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }

