"use client";

import { useMemo, useState } from "react";
import type { PokemonSummary } from "@/features/pokedex/model/pokemon";
import { PokemonCard } from "@/features/pokedex/ui/components/PokemonCard";
import { PokemonCardSkeleton } from "@/features/pokedex/ui/components/PokemonCardSkeleton";
import { useElementSize } from "@/shared/hooks/useElementSize";

type PokemonGridProps = {
  items: PokemonSummary[];
  isLoading?: boolean;
  skeletonCount?: number;
  onQuickView?: (pokemon: PokemonSummary) => void;
  compareMode?: boolean;
  onComparePick?: (pokemon: PokemonSummary) => void;
  selectedNames?: Set<string>;
};

const VIRTUALIZE_THRESHOLD = 200;
const ROW_HEIGHT = 360;
const OVERSCAN = 2;

export const PokemonGrid = ({
  items,
  isLoading,
  skeletonCount = 6,
  onQuickView,
  compareMode,
  onComparePick,
  selectedNames,
}: PokemonGridProps) => (
  <>
    {isLoading ? (
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <PokemonCardSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    ) : items.length > VIRTUALIZE_THRESHOLD ? (
      <VirtualizedPokemonGrid
        items={items}
        onQuickView={onQuickView}
        compareMode={compareMode}
        onComparePick={onComparePick}
        selectedNames={selectedNames}
      />
    ) : (
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((pokemon) => (
          selectedNames?.has(pokemon.name) ? (
            <SelectedPlaceholderCard key={`selected-${pokemon.id}`} pokemon={pokemon} />
          ) : (
            <PokemonCard
              key={pokemon.id}
              pokemon={pokemon}
              onQuickView={onQuickView}
              compareMode={compareMode}
              onComparePick={onComparePick}
            />
          )
        ))}
      </div>
    )}
  </>
);

type VirtualizedPokemonGridProps = {
  items: PokemonSummary[];
  onQuickView?: (pokemon: PokemonSummary) => void;
  compareMode?: boolean;
  onComparePick?: (pokemon: PokemonSummary) => void;
  selectedNames?: Set<string>;
};

const VirtualizedPokemonGrid = ({
  items,
  onQuickView,
  compareMode,
  onComparePick,
  selectedNames,
}: VirtualizedPokemonGridProps) => {
  const { ref, size } = useElementSize<HTMLDivElement>();
  const [scrollTop, setScrollTop] = useState(0);

  const columns = useMemo(() => {
    if (size.width >= 1280) return 3;
    if (size.width >= 640) return 2;
    return 1;
  }, [size.width]);

  const rowCount = Math.ceil(items.length / columns);
  const viewportHeight = Math.max(300, size.height);

  const startRow = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const endRow = Math.min(
    rowCount - 1,
    Math.ceil((scrollTop + viewportHeight) / ROW_HEIGHT) + OVERSCAN,
  );

  const rows = [];
  for (let row = startRow; row <= endRow; row += 1) {
    const startIndex = row * columns;
    const slice = items.slice(startIndex, startIndex + columns);
    rows.push({ row, items: slice });
  }

  return (
      <div
        ref={ref}
        className="relative max-h-[70vh] overflow-auto rounded-3xl border border-slate-200 bg-white/70 p-4 shadow-inner backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/40"
        onScroll={(event) =>
          setScrollTop((event.target as HTMLDivElement).scrollTop)
        }
      >
      <div style={{ height: rowCount * ROW_HEIGHT }}>
        {rows.map((row) => (
          <div
            key={`row-${row.row}`}
            className="absolute left-0 right-0 grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
            style={{ top: row.row * ROW_HEIGHT }}
          >
            {row.items.map((pokemon) => (
              selectedNames?.has(pokemon.name) ? (
                <SelectedPlaceholderCard
                  key={`selected-${pokemon.id}`}
                  pokemon={pokemon}
                />
              ) : (
                <PokemonCard
                  key={pokemon.id}
                  pokemon={pokemon}
                  onQuickView={onQuickView}
                  compareMode={compareMode}
                  onComparePick={onComparePick}
                />
              )
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

type SelectedPlaceholderCardProps = {
  pokemon: PokemonSummary;
};

const SelectedPlaceholderCard = ({ pokemon }: SelectedPlaceholderCardProps) => (
  <article className="flex min-h-[360px] flex-col items-center justify-center rounded-[28px] border border-dashed border-blue-200/80 bg-blue-50/70 p-5 text-center text-sm text-blue-700 dark:border-blue-400/30 dark:bg-blue-950/40 dark:text-blue-200 animate-fade-up">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500/70">
      Seleccionado
    </p>
    <h3 className="mt-2 text-lg font-semibold capitalize">{pokemon.name}</h3>
    <p className="mt-2 text-xs text-blue-600/80 dark:text-blue-200/70">
      Ya está en la comparación
    </p>
  </article>
);
