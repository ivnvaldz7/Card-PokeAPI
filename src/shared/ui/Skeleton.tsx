import type { HTMLAttributes } from "react";
import { cn } from "@/shared/ui/cn";

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export const Skeleton = ({ className, ...props }: SkeletonProps) => (
  <div
    className={cn(
      "animate-pulse rounded-2xl bg-black/10 dark:bg-white/10",
      className,
    )}
    aria-hidden="true"
    {...props}
  />
);
