"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type {
  PokemonGeneration,
  PokemonSummary,
  PokemonType,
} from "@/features/pokedex/model/pokemon";
import type { SortDirection, SortKey } from "@/features/pokedex/model/filters";
import { useDebouncedValue } from "@/features/pokedex/hooks/useDebouncedValue";
import { usePokemonDetail } from "@/features/pokedex/hooks/usePokemonDetail";
import { usePokemonList } from "@/features/pokedex/hooks/usePokemonList";
import { usePokemonNameSuggestions } from "@/features/pokedex/hooks/usePokemonNameSuggestions";
import { usePokemonSuggestionPreview } from "@/features/pokedex/hooks/usePokemonSuggestionPreview";
import {
  getPokemonGenerations,
  getPokemonTypes,
  prefetchPokemonListPage,
} from "@/features/pokedex/api/pokeapi.service";
import { PokemonGrid } from "@/features/pokedex/ui/components/PokemonGrid";
import { Pagination } from "@/features/pokedex/ui/components/Pagination";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";

const PAGE_SIZE = 24;
const SORT_KEYS: SortKey[] = [
  "id",
  "name",
  "attack",
  "defense",
  "specialAttack",
  "specialDefense",
  "hp",
  "speed",
];

const parseSortKey = (value: string | null): SortKey =>
  SORT_KEYS.includes(value as SortKey) ? (value as SortKey) : "id";

const parseSortDirection = (value: string | null): SortDirection =>
  value === "desc" ? "desc" : "asc";

export const PokedexPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  const [types, setTypes] = useState<PokemonType[]>([]);
  const [generations, setGenerations] = useState<PokemonGeneration[]>([]);

  const [refreshToken, setRefreshToken] = useState(0);
  const [showList, setShowList] = useState(false);
  const [quickView, setQuickView] = useState<PokemonSummary | null>(null);
  const [compareA, setCompareA] = useState<PokemonSummary | null>(null);
  const [compareB, setCompareB] = useState<PokemonSummary | null>(null);
  const [comparePrompt, setComparePrompt] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const listSectionRef = useRef<HTMLDivElement | null>(null);
  const compareSectionRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const sortKey = parseSortKey(searchParams.get("sort"));
  const sortDirection = parseSortDirection(searchParams.get("dir"));
  const type = searchParams.get("type");
  const generation = searchParams.get("generation");

  const filters = useMemo(
    () => ({ type, generation }),
    [type, generation],
  );

  const hasListIntent =
    showList ||
    page > 1 ||
    searchParams.has("type") ||
    searchParams.has("generation") ||
    searchParams.has("sort") ||
    searchParams.has("dir");

  const searchValue = debouncedSearch.trim();
  const searchNormalized = searchValue.toLowerCase();
  const isNumericSearch = /^\d+$/.test(searchNormalized);
  const suggestionsState = usePokemonNameSuggestions(searchNormalized);
  const shouldSearchDetail =
    (searchNormalized.length > 0 && suggestionsState.exactMatch) ||
    isNumericSearch;
  const previewState = usePokemonSuggestionPreview(
    suggestionsState.suggestions,
    searchNormalized.length > 0 && !shouldSearchDetail && !isNumericSearch,
  );
  const searchState = usePokemonDetail(
    shouldSearchDetail ? searchNormalized : null,
  );

  const listState = usePokemonList({
    offset: (page - 1) * PAGE_SIZE,
    limit: PAGE_SIZE,
    filters,
    sortKey,
    sortDirection,
    refreshToken,
    enabled: searchValue.length === 0 && hasListIntent,
  });

  const selectedNames = useMemo(() => {
    const names = new Set<string>();
    if (compareA) names.add(compareA.name);
    if (compareB) names.add(compareB.name);
    return names;
  }, [compareA, compareB]);

  const updateQuery = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (!value) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [searchParams, router, pathname],
  );

  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (debouncedSearch === current) return;
    updateQuery({ q: debouncedSearch || null, page: "1" });
  }, [debouncedSearch, searchParams, updateQuery]);

  useEffect(() => {
    const controller = new AbortController();
    const loadFilters = async () => {
      const [typesData, generationsData] = await Promise.all([
        getPokemonTypes(controller.signal),
        getPokemonGenerations(controller.signal),
      ]);
      setTypes(typesData);
      setGenerations(generationsData);
    };
    void loadFilters();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!comparePrompt) return;
    setTimeout(() => {
      listSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }, [comparePrompt]);

  useEffect(() => {
    if (!compareA || !compareB) return;
    setTimeout(() => {
      compareSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }, [compareA, compareB]);

  useEffect(() => {
    if (!quickView) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setTimeout(() => closeButtonRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = previous;
    };
  }, [quickView]);

  const onRetry = () => setRefreshToken((value) => value + 1);

  const handleQuickView = (pokemon: PokemonSummary) => {
    setQuickView(pokemon);
  };

  const handleComparePick = (pokemon: PokemonSummary) => {
    if (!compareA) {
      setCompareA(pokemon);
      setComparePrompt(true);
      setShowList(true);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
      return;
    }
    if (!compareB || compareB.name === compareA.name) {
      setCompareB(pokemon);
      setComparePrompt(false);
      setShowList(false);
      return;
    }
    setCompareB(pokemon);
    setComparePrompt(false);
    setShowList(false);
  };

  const handleClearCompare = () => {
    setCompareA(null);
    setCompareB(null);
    setComparePrompt(false);
  };

  const statsForCompare = useMemo(() => {
    if (!compareA || !compareB) return null;
    const stats = [
      { key: "hp", label: "HP" },
      { key: "attack", label: "Ataque" },
      { key: "defense", label: "Defensa" },
      { key: "specialAttack", label: "Ataque Esp." },
      { key: "specialDefense", label: "Defensa Esp." },
      { key: "speed", label: "Velocidad" },
    ] as const;
    const totalA = stats.reduce(
      (sum, stat) => sum + compareA.stats[stat.key],
      0,
    );
    const totalB = stats.reduce(
      (sum, stat) => sum + compareB.stats[stat.key],
      0,
    );
    return { stats, totalA, totalB };
  }, [compareA, compareB]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-6 md:px-8">
      <header className="sticky top-3 z-40 flex flex-col gap-3 rounded-[24px] border border-slate-200/70 bg-white/90 p-4 shadow-[0_12px_40px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/70 animate-fade-up">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex max-w-md flex-col gap-1">
            <p className="text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-slate-400">
              Pokédex
            </p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 md:text-3xl">
              Card PokeAPI
            </h1>
          </div>
          <ThemeToggle />
        </div>
        <div className="grid gap-2 lg:grid-cols-[2fr,1fr,1fr,1fr,1fr]">
          <div className="relative">
            <Input
              ref={searchInputRef}
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscar por nombre o ID"
              aria-label="Buscar Pokémon"
              aria-autocomplete="list"
              role="combobox"
              aria-expanded={
                searchNormalized.length > 0 &&
                !isNumericSearch &&
                suggestionsState.suggestions.length > 0
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !shouldSearchDetail &&
                  suggestionsState.suggestions.length > 0
                ) {
                  const next = suggestionsState.suggestions[0];
                  setSearchInput(next);
                  updateQuery({ q: next, page: "1" });
                }
              }}
            />
            {searchNormalized.length > 0 &&
              !isNumericSearch &&
              suggestionsState.suggestions.length > 0 && (
                <div
                  className="absolute left-0 right-0 top-12 z-20 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950"
                  role="listbox"
                  aria-label="Sugerencias de Pokémon"
                >
                  {suggestionsState.suggestions.map((name) => (
                    <button
                      key={name}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/60"
                      onClick={() => {
                        setSearchInput(name);
                        updateQuery({ q: name, page: "1" });
                      }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
          </div>
          <Select
            value={type ?? ""}
            onChange={(event) =>
              updateQuery({ type: event.target.value || null, page: "1" })
            }
            aria-label="Filtrar por tipo"
            disabled={searchValue.length > 0}
          >
            <option value="">Tipo</option>
            {types.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </Select>
          <Select
            value={generation ?? ""}
            onChange={(event) =>
              updateQuery({ generation: event.target.value || null, page: "1" })
            }
            aria-label="Filtrar por generación"
            disabled={searchValue.length > 0}
          >
            <option value="">Generación</option>
            {generations.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </Select>
          <Select
            value={sortKey}
            onChange={(event) =>
              updateQuery({ sort: event.target.value, page: "1" })
            }
            aria-label="Ordenar por"
            disabled={searchValue.length > 0}
          >
            <option value="id">ID</option>
            <option value="name">Nombre</option>
            <option value="attack">Ataque</option>
            <option value="defense">Defensa</option>
            <option value="specialAttack">Ataque Especial</option>
            <option value="specialDefense">Defensa Especial</option>
            <option value="hp">HP</option>
            <option value="speed">Velocidad</option>
          </Select>
          <Select
            value={sortDirection}
            onChange={(event) =>
              updateQuery({ dir: event.target.value, page: "1" })
            }
            aria-label="Orden"
            disabled={searchValue.length > 0}
          >
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </Select>
        </div>
        {comparePrompt && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-200/70 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-500/30 dark:bg-blue-950/40 dark:text-blue-200">
            <span>
              Seleccioná otro Pokémon para completar la comparación.
            </span>
            <Button
              variant="ghost"
              onClick={() => searchInputRef.current?.focus()}
            >
              Ir a búsqueda
            </Button>
          </div>
        )}
      </header>

      {searchValue.length > 0 ? (
        <section className="flex flex-col gap-6 rounded-[32px] border border-slate-200/70 bg-white/90 p-6 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/70 animate-fade-up">
          <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-black/50 dark:text-white/50">
            Resultado de búsqueda
          </h2>
          {!shouldSearchDetail && suggestionsState.status !== "error" && (
            <div className="flex flex-col gap-3 text-sm text-slate-500 dark:text-slate-400">
              <p>Coincidencias sugeridas</p>
              <div className="flex flex-wrap gap-2">
                {suggestionsState.suggestions.map((name) => (
                  <Button
                    key={name}
                    variant="ghost"
                    onClick={() => {
                      setSearchInput(name);
                      updateQuery({ q: name, page: "1" });
                    }}
                  >
                    {name}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {!shouldSearchDetail &&
            previewState.status === "loading" &&
            suggestionsState.suggestions.length > 0 && (
              <PokemonGrid items={[]} isLoading skeletonCount={4} />
            )}
          {!shouldSearchDetail &&
            previewState.status === "ready" &&
            previewState.items.length > 0 && (
              <PokemonGrid
                items={previewState.items}
                onQuickView={handleQuickView}
                compareMode={comparePrompt}
                onComparePick={handleComparePick}
                selectedNames={selectedNames}
              />
            )}
          {searchState.status === "loading" && (
            <PokemonGrid items={[]} isLoading skeletonCount={1} />
          )}
          {searchState.status === "not-found" && (
            <p
              className="text-sm text-slate-500 dark:text-slate-400"
              aria-live="polite"
            >
              No encontramos resultados para esa búsqueda.
            </p>
          )}
          {searchState.status === "error" && (
            <div
              className="flex flex-col gap-3 text-sm text-slate-500 dark:text-slate-400"
              role="alert"
            >
              <p>Ocurrió un error al buscar.</p>
              <Button onClick={onRetry} variant="ghost">
                Reintentar
              </Button>
            </div>
          )}
          {searchState.status === "success" && searchState.data && (
            <PokemonGrid
              items={[searchState.data]}
              onQuickView={handleQuickView}
              compareMode={comparePrompt}
              onComparePick={handleComparePick}
              selectedNames={selectedNames}
            />
          )}
        </section>
      ) : (
        <section
          ref={listSectionRef}
          className="flex flex-col gap-6 rounded-[32px] border border-slate-200/70 bg-white/90 p-6 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/70 animate-fade-up"
        >
          {!hasListIntent && (
            <div className="flex flex-col gap-4 text-sm text-slate-500 dark:text-slate-400">
              <p>
                Empezá escribiendo un nombre o aplicá filtros para ver resultados.
              </p>
              <Button onClick={() => setShowList(true)}>
                Ver listado completo
              </Button>
            </div>
          )}
          {hasListIntent && listState.status === "loading" && (
            <PokemonGrid items={[]} isLoading skeletonCount={6} />
          )}
          {hasListIntent && listState.status === "error" && (
            <div
              className="flex flex-col gap-3 text-sm text-slate-500 dark:text-slate-400"
              role="alert"
            >
              <p>Ocurrió un error al cargar la lista.</p>
              <Button onClick={onRetry} variant="ghost">
                Reintentar
              </Button>
            </div>
          )}
          {hasListIntent && listState.status === "success" && listState.data && (
            <>
              {listState.data.results.length === 0 ? (
                <p
                  className="text-sm text-slate-500 dark:text-slate-400"
                  aria-live="polite"
                >
                  No hay Pokémon para los filtros seleccionados.
                </p>
              ) : (
                <>
                  <PokemonGrid
                    items={listState.data.results}
                    onQuickView={handleQuickView}
                    compareMode={comparePrompt}
                    onComparePick={handleComparePick}
                    selectedNames={selectedNames}
                  />
                  <Pagination
                    page={page}
                    total={listState.data.count}
                    pageSize={PAGE_SIZE}
                    onPrev={() =>
                      updateQuery({ page: String(Math.max(1, page - 1)) })
                    }
                    onNext={() => updateQuery({ page: String(page + 1) })}
                    onPrevHover={() => {
                      const prevOffset = listState.data?.prevOffset;
                      if (prevOffset !== null && prevOffset !== undefined) {
                        void prefetchPokemonListPage(prevOffset, PAGE_SIZE);
                      }
                    }}
                    onNextHover={() => {
                      const nextOffset = listState.data?.nextOffset;
                      if (nextOffset !== null && nextOffset !== undefined) {
                        void prefetchPokemonListPage(nextOffset, PAGE_SIZE);
                      }
                    }}
                  />
                </>
              )}
            </>
          )}
        </section>
      )}

      {(compareA || compareB) && (
        <section
          ref={compareSectionRef}
          className="flex flex-col gap-4 rounded-[28px] border border-slate-200/70 bg-white/95 p-5 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.4)] dark:border-slate-800/70 dark:bg-slate-950/70 animate-fade-up"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
              Comparativa
            </div>
            <Button variant="ghost" onClick={handleClearCompare}>
              Limpiar
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <CompareCard
              slot="A"
              pokemon={compareA}
              onClear={() => setCompareA(null)}
            />
            <CompareCard
              slot="B"
              pokemon={compareB}
              onClear={() => setCompareB(null)}
            />
          </div>
          {statsForCompare && compareA && compareB && (
            <div className="flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span>Total</span>
                <span
                  className={
                    statsForCompare.totalA > statsForCompare.totalB
                      ? "font-semibold text-blue-600 dark:text-blue-300"
                      : "text-slate-500 dark:text-slate-400"
                  }
                >
                  {compareA.name}: {statsForCompare.totalA}
                </span>
                <span
                  className={
                    statsForCompare.totalB > statsForCompare.totalA
                      ? "font-semibold text-blue-600 dark:text-blue-300"
                      : "text-slate-500 dark:text-slate-400"
                  }
                >
                  {compareB.name}: {statsForCompare.totalB}
                </span>
              </div>
              {statsForCompare.stats.map((stat) => {
                const a = compareA.stats[stat.key];
                const b = compareB.stats[stat.key];
                const max = Math.max(a, b, 1);
                const aWidth = Math.round((a / max) * 100);
                const bWidth = Math.round((b / max) * 100);
                return (
                  <div
                    key={stat.key}
                    className="grid gap-2 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
                      <span>{stat.label}</span>
                      <div className="flex gap-4">
                        <span
                          className={
                            a > b
                              ? "font-semibold text-blue-600 dark:text-blue-300"
                              : "text-slate-500 dark:text-slate-400"
                          }
                        >
                          {a}
                        </span>
                        <span
                          className={
                            b > a
                              ? "font-semibold text-blue-600 dark:text-blue-300"
                              : "text-slate-500 dark:text-slate-400"
                          }
                        >
                          {b}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className="h-2 rounded-full bg-blue-500/80"
                          style={{ width: `${aWidth}%` }}
                        />
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className="h-2 rounded-full bg-amber-400/80"
                          style={{ width: `${bWidth}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {quickView && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setQuickView(null);
            }
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quickview-title"
            aria-describedby="quickview-desc"
            className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950 animate-scale-in"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  #{String(quickView.id).padStart(3, "0")}
                </p>
                <h3
                  id="quickview-title"
                  className="text-2xl font-semibold capitalize text-slate-900 dark:text-slate-100"
                >
                  {quickView.name}
                </h3>
              </div>
              <Button
                ref={closeButtonRef}
                variant="ghost"
                onClick={() => setQuickView(null)}
                aria-label="Cerrar vista rápida"
              >
                Cerrar
              </Button>
            </div>
            <p
              id="quickview-desc"
              className="mt-2 text-sm text-slate-500 dark:text-slate-400"
            >
              Resumen de stats principales para comparar rápido.
            </p>
            <div className="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
              <QuickStat label="HP" value={quickView.stats.hp} />
              <QuickStat label="Ataque" value={quickView.stats.attack} />
              <QuickStat label="Defensa" value={quickView.stats.defense} />
              <QuickStat label="Ataque Esp." value={quickView.stats.specialAttack} />
              <QuickStat label="Defensa Esp." value={quickView.stats.specialDefense} />
              <QuickStat label="Velocidad" value={quickView.stats.speed} />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  handleComparePick(quickView);
                  setQuickView(null);
                }}
              >
                Comparar
              </Button>
              <Link href={`/pokemon/${quickView.name}`} prefetch={false}>
                <Button type="button" variant="primary">
                  Ver detalle
                </Button>
              </Link>
              <Button variant="ghost" onClick={() => setQuickView(null)}>
                Volver
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

type CompareCardProps = {
  slot: "A" | "B";
  pokemon: PokemonSummary | null;
  onClear: () => void;
};

const CompareCard = ({ slot, pokemon, onClear }: CompareCardProps) => (
  <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {slot}
      </span>
      {pokemon && (
        <Button variant="ghost" onClick={onClear}>
          Quitar
        </Button>
      )}
    </div>
    {pokemon ? (
      <>
        <span className="text-lg font-semibold capitalize text-slate-900 dark:text-slate-100">
          {pokemon.name}
        </span>
        <span>ID #{pokemon.id}</span>
      </>
    ) : (
      <span>Seleccioná un Pokémon para comparar</span>
    )}
  </div>
);

type QuickStatProps = {
  label: string;
  value: number;
};

const QuickStat = ({ label, value }: QuickStatProps) => (
  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-900">
    <span>{label}</span>
    <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
      {value}
    </span>
  </div>
);
