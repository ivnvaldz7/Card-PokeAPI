import type { SelectHTMLAttributes } from "react";
import { cn } from "@/shared/ui/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = ({ className, ...props }: SelectProps) => (
  <select
    className={cn(
      "w-full rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
      className,
    )}
    {...props}
  />
);
