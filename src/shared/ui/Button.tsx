import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/ui/cn";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-blue-600 text-white hover:bg-blue-500 dark:bg-blue-400 dark:text-slate-950 dark:hover:bg-blue-300",
        variant === "ghost" &&
          "border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800/70",
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
