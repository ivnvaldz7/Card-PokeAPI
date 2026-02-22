"use client";

import Image from "next/image";
import type { PokemonSummary } from "@/features/pokedex/model/pokemon";
import { prefetchPokemonDetail } from "@/features/pokedex/api/pokeapi.service";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import Link from "next/link";

type PokemonCardProps = {
  pokemon: PokemonSummary;
  onQuickView?: (pokemon: PokemonSummary) => void;
  compareMode?: boolean;
  onComparePick?: (pokemon: PokemonSummary) => void;
};

export const PokemonCard = ({
  pokemon,
  onQuickView,
  compareMode,
  onComparePick,
}: PokemonCardProps) => (
  <article
    className="group relative flex min-h-[360px] flex-col rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-32px_rgba(15,23,42,0.45)] dark:border-slate-800/80 dark:bg-slate-950/80 animate-fade-up"
    onMouseEnter={() => prefetchPokemonDetail(pokemon.name)}
    onFocusCapture={() => prefetchPokemonDetail(pokemon.name)}
  >
    <div className="relative z-10 flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          #{String(pokemon.id).padStart(3, "0")}
        </p>
        <h3 className="text-xl font-semibold capitalize text-slate-900 dark:text-slate-100">
          {pokemon.name}
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {pokemon.types.map((type) => (
          <Badge key={type}>{type}</Badge>
        ))}
      </div>
    </div>
    <div className="relative z-10 mt-4 flex flex-1 items-center justify-center">
      {pokemon.image ? (
        <Image
          src={pokemon.image}
          alt={pokemon.name}
          width={160}
          height={160}
          sizes="(min-width: 1280px) 160px, (min-width: 640px) 140px, 120px"
          className="h-36 w-36 object-contain transition group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="flex h-36 w-36 items-center justify-center rounded-full border border-dashed border-slate-200 text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
          Sin imagen
        </div>
      )}
    </div>
    <div className="relative z-10 mt-4 grid grid-cols-3 gap-2 text-center text-xs font-semibold text-slate-600 dark:text-slate-300">
      <div className="rounded-2xl bg-slate-50 py-2 dark:bg-slate-900">
        ATK
        <span className="mt-1 block text-base text-slate-900 dark:text-slate-100">
          {pokemon.stats.attack}
        </span>
      </div>
      <div className="rounded-2xl bg-slate-50 py-2 dark:bg-slate-900">
        DEF
        <span className="mt-1 block text-base text-slate-900 dark:text-slate-100">
          {pokemon.stats.defense}
        </span>
      </div>
      <div className="rounded-2xl bg-slate-50 py-2 dark:bg-slate-900">
        SPD
        <span className="mt-1 block text-base text-slate-900 dark:text-slate-100">
          {pokemon.stats.speed}
        </span>
      </div>
    </div>
    <div className="relative z-10 mt-4 flex flex-wrap items-center justify-between gap-2">
      {compareMode ? (
        <Button
          type="button"
          variant="primary"
          onClick={() => onComparePick?.(pokemon)}
        >
          Seleccionar
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          onClick={() => onQuickView?.(pokemon)}
        >
          Vista rápida
        </Button>
      )}
      <Link
        href={`/pokemon/${pokemon.name}`}
        prefetch={false}
        className="relative z-10"
        onClick={(event) => event.stopPropagation()}
      >
        <Button type="button" variant="primary">
          Ver detalle
        </Button>
      </Link>
    </div>
  </article>
);
