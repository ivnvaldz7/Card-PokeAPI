import { Skeleton } from "@/shared/ui/Skeleton";

export const PokemonCardSkeleton = () => (
  <div className="flex h-full flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <Skeleton className="h-3 w-16 rounded-full" />
        <Skeleton className="h-5 w-32 rounded-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-12 rounded-full" />
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>
    </div>
    <div className="flex flex-1 items-center justify-center">
      <Skeleton className="h-36 w-36 rounded-full" />
    </div>
    <div className="grid grid-cols-3 gap-2">
      <Skeleton className="h-12 w-full rounded-2xl" />
      <Skeleton className="h-12 w-full rounded-2xl" />
      <Skeleton className="h-12 w-full rounded-2xl" />
    </div>
  </div>
);
