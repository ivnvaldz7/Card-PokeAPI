import { useEffect, useState } from "react";
import type { PokemonListPage, PokemonSummary } from "@/features/pokedex/model/pokemon";
import type { PokedexFilters, SortDirection, SortKey } from "@/features/pokedex/model/filters";
import {
  getPokemonByName,
  getPokemonListPage,
  getPokemonNamesByGeneration,
  getPokemonNamesByType,
  pokedexCache,
} from "@/features/pokedex/api/pokeapi.service";
import { setPokedexCache } from "@/features/pokedex/api/pokedex.cache";

type UsePokemonListParams = {
  offset: number;
  limit: number;
  filters: PokedexFilters;
  sortKey: SortKey;
  sortDirection: SortDirection;
  refreshToken?: number;
  enabled?: boolean;
};

type LoadState = {
  cacheKey: string;
  status: "idle" | "loading" | "success" | "error";
  data: PokemonListPage | null;
  error: string | null;
  isStale: boolean;
};

const CACHE_TTL_MS = 5 * 60 * 1000;
const STALE_TTL_MS = 60 * 60 * 1000;

const getCacheKey = (params: UsePokemonListParams) =>
  [
    "pokedex:page",
    params.offset,
    params.limit,
    params.filters.type ?? "all",
    params.filters.generation ?? "all",
    params.sortKey,
    params.sortDirection,
  ].join(":");

export const usePokemonList = (params: UsePokemonListParams) => {
  const filterType = params.filters.type;
  const filterGeneration = params.filters.generation;
  const cacheKey = getCacheKey(params);
  const cached = pokedexCache.get<PokemonListPage>(cacheKey);
  const enabled = params.enabled ?? true;
  const [state, setState] = useState<LoadState>(() => ({
    cacheKey,
    status: cached ? "success" : enabled ? "loading" : "idle",
    data: cached?.data ?? null,
    error: null,
    isStale: false,
  }));

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    const load = async () => {
      try {
        const page = await resolvePage(
          {
            offset: params.offset,
            limit: params.limit,
            filterType,
            filterGeneration,
            sortKey: params.sortKey,
            sortDirection: params.sortDirection,
          },
          controller.signal,
        );
        setPokedexCache(cacheKey, page, CACHE_TTL_MS, STALE_TTL_MS);
        setState({
          cacheKey,
          status: "success",
          data: page,
          error: null,
          isStale: false,
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        setState({
          cacheKey,
          status: "error",
          data: null,
          error: error instanceof Error ? error.message : "Unknown error",
          isStale: false,
        });
      }
    };

    void load();
    return () => controller.abort();
  }, [
    cacheKey,
    enabled,
    params.offset,
    params.limit,
    filterType,
    filterGeneration,
    params.sortKey,
    params.sortDirection,
    params.refreshToken,
  ]);

  if (!enabled) {
    return {
      cacheKey,
      status: "idle",
      data: null,
      error: null,
      isStale: false,
    };
  }

  if (state.cacheKey === cacheKey) return state;

  if (cached) {
    return {
      cacheKey,
      status: "success",
      data: cached.data,
      error: null,
      isStale: false,
    };
  }

  return {
    cacheKey,
    status: "loading",
    data: null,
    error: null,
    isStale: false,
  };
};

type ResolveParams = {
  offset: number;
  limit: number;
  filterType: string | null;
  filterGeneration: string | null;
  sortKey: SortKey;
  sortDirection: SortDirection;
};

const resolvePage = async (
  params: ResolveParams,
  signal: AbortSignal,
): Promise<PokemonListPage> => {
  const hasFilters = Boolean(params.filterType || params.filterGeneration);

  if (!hasFilters) {
    const page = await getPokemonListPage(params.offset, params.limit, signal);
    return applySort(page, params.sortKey, params.sortDirection);
  }

  const [typeNames, generationNames] = await Promise.all([
    params.filterType
      ? getPokemonNamesByType(params.filterType, signal)
      : Promise.resolve(null),
    params.filterGeneration
      ? getPokemonNamesByGeneration(params.filterGeneration, signal)
      : Promise.resolve(null),
  ]);

  const filteredNames = intersectNames(typeNames, generationNames);
  const total = filteredNames.length;
  const pageNames = filteredNames.slice(
    params.offset,
    params.offset + params.limit,
  );
  const results = await Promise.all(
    pageNames.map((name) => getPokemonByName(name, signal)),
  );

  const page: PokemonListPage = {
    count: total,
    nextOffset:
      params.offset + params.limit < total ? params.offset + params.limit : null,
    prevOffset: params.offset - params.limit >= 0 ? params.offset - params.limit : null,
    results,
  };

  return applySort(page, params.sortKey, params.sortDirection);
};

const intersectNames = (
  typeNames: string[] | null,
  generationNames: string[] | null,
) => {
  if (typeNames && generationNames) {
    const set = new Set(typeNames);
    return generationNames.filter((name) => set.has(name));
  }
  if (typeNames) return typeNames;
  if (generationNames) return generationNames;
  return [];
};

const applySort = (
  page: PokemonListPage,
  key: SortKey,
  direction: SortDirection,
) => {
  const sorted = [...page.results].sort((a, b) => {
    const modifier = direction === "asc" ? 1 : -1;
    if (key === "name") {
      return a.name.localeCompare(b.name) * modifier;
    }
    if (key === "id") {
      return (a.id - b.id) * modifier;
    }
    return (getStatValue(a, key) - getStatValue(b, key)) * modifier;
  });

  return { ...page, results: sorted };
};

const getStatValue = (pokemon: PokemonSummary, key: SortKey) => {
  switch (key) {
    case "attack":
      return pokemon.stats.attack;
    case "defense":
      return pokemon.stats.defense;
    case "specialAttack":
      return pokemon.stats.specialAttack;
    case "specialDefense":
      return pokemon.stats.specialDefense;
    case "hp":
      return pokemon.stats.hp;
    case "speed":
      return pokemon.stats.speed;
    case "id":
      return pokemon.id;
    case "name":
      return 0;
  }
};
