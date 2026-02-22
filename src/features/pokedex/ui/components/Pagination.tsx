import { Button } from "@/shared/ui/Button";

type PaginationProps = {
  page: number;
  total: number;
  pageSize: number;
  onPrev: () => void;
  onNext: () => void;
  onPrevHover?: () => void;
  onNextHover?: () => void;
};

export const Pagination = ({
  page,
  total,
  pageSize,
  onPrev,
  onNext,
  onPrevHover,
  onNextHover,
}: PaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-sm text-black/60 dark:text-white/60">
        Página {page} de {totalPages}
      </p>
      <div className="flex gap-3">
        <Button
          variant="ghost"
          onClick={onPrev}
          onMouseEnter={onPrevHover}
          disabled={page <= 1}
        >
          Anterior
        </Button>
        <Button
          variant="primary"
          onClick={onNext}
          onMouseEnter={onNextHover}
          disabled={page >= totalPages}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
};
