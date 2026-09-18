import { cls } from "@/utils/cls";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={cls("skeleton bg-foreground/20", className)} />;
}
