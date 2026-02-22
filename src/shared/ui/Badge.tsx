import type { HTMLAttributes } from "react";
import { cn } from "@/shared/ui/cn";

type BadgeProps = HTMLAttributes<HTMLSpanElement>;

export const Badge = ({ className, ...props }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full border border-slate-200/80 bg-slate-100 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-slate-700 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-200",
      className,
    )}
    {...props}
  />
);
