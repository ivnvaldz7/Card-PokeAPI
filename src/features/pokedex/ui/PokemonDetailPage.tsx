"use client";

import Image from "next/image";
import Link from "next/link";
import { usePokemonDetail } from "@/features/pokedex/hooks/usePokemonDetail";
import { Badge } from "@/shared/ui/Badge";
import { Skeleton } from "@/shared/ui/Skeleton";

type PokemonDetailPageProps = {
  name: string;
};

export const PokemonDetailPage = ({ name }: PokemonDetailPageProps) => {
  const state = usePokemonDetail(name);

  if (state.status === "loading") {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr,1fr]">
          <div className="flex flex-col gap-4 rounded-3xl border border-black/10 bg-white p-8 dark:border-white/10 dark:bg-zinc-950">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-10 w-40 rounded-full" />
            <div className="flex items-center justify-center py-6">
              <Skeleton className="h-60 w-60 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
          </div>
          <div className="flex flex-col gap-4 rounded-3xl border border-black/10 bg-white p-8 dark:border-white/10 dark:bg-zinc-950">
            <Skeleton className="h-6 w-32 rounded-full" />
            <div className="flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton
                  key={`stat-${index}`}
                  className="h-12 w-full rounded-2xl"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.status === "not-found") {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12">
        <p className="text-sm text-black/60 dark:text-white/60">
          No encontramos ese Pokémon.
        </p>
        <Link
          href="/"
          className="text-sm font-semibold uppercase tracking-[0.3em] text-black/60 dark:text-white/60"
          prefetch={false}
        >
          Volver al listado
        </Link>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12">
        <p className="text-sm text-black/60 dark:text-white/60">
          Ocurrió un error al cargar el detalle.
        </p>
        <Link
          href="/"
          className="text-sm font-semibold uppercase tracking-[0.3em] text-black/60 dark:text-white/60"
          prefetch={false}
        >
          Volver al listado
        </Link>
      </div>
    );
  }

  if (!state.data) return null;

  const pokemon = state.data;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12">
      <Link
        href="/"
        className="text-sm font-semibold uppercase tracking-[0.3em] text-black/40 dark:text-white/40"
        prefetch={false}
      >
        ← Volver
      </Link>
      <div className="grid gap-8 lg:grid-cols-[1.2fr,1fr]">
        <div className="flex flex-col gap-4 rounded-[32px] border border-slate-200/70 bg-white/90 p-8 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.4)] dark:border-slate-800/70 dark:bg-slate-950/70">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                #{String(pokemon.id).padStart(3, "0")}
              </p>
              <h1 className="text-4xl font-semibold capitalize text-slate-900 dark:text-slate-100">
                {pokemon.name}
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              {pokemon.types.map((type) => (
                <Badge key={type}>{type}</Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center py-6">
            {pokemon.image ? (
              <Image
                src={pokemon.image}
                alt={pokemon.name}
                width={260}
                height={260}
                sizes="(min-width: 1024px) 260px, 220px"
                className="h-60 w-60 object-contain"
                priority
              />
            ) : (
              <div className="flex h-60 w-60 items-center justify-center rounded-full border border-dashed border-slate-200 text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
                Sin imagen
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-300">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
              Altura
              <span className="mt-1 block text-xl text-slate-900 dark:text-slate-100">
                {pokemon.height}
              </span>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
              Peso
              <span className="mt-1 block text-xl text-slate-900 dark:text-slate-100">
                {pokemon.weight}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-[32px] border border-slate-200/70 bg-white/90 p-8 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.4)] dark:border-slate-800/70 dark:bg-slate-950/70">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Stats base
          </h2>
          <div className="flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-300">
            <Stat label="HP" value={pokemon.stats.hp} />
            <Stat label="Ataque" value={pokemon.stats.attack} />
            <Stat label="Defensa" value={pokemon.stats.defense} />
            <Stat label="Ataque Especial" value={pokemon.stats.specialAttack} />
            <Stat label="Defensa Especial" value={pokemon.stats.specialDefense} />
            <Stat label="Velocidad" value={pokemon.stats.speed} />
          </div>
        </div>
      </div>
    </div>
  );
};

type StatProps = {
  label: string;
  value: number;
};

const Stat = ({ label, value }: StatProps) => (
  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900">
    <span>{label}</span>
    <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
      {value}
    </span>
  </div>
);
