import { createHttpClient } from "@/lib/http/client";
import { MemoryCache } from "@/lib/http/cache";
import { createLimiter } from "@/lib/http/limiter";
import { pokedexCache, setPokedexCache } from "@/features/pokedex/api/pokedex.cache";
import {
  GenerationDetailSchema,
  GenerationListSchema,
  PokemonListSchema,
  PokemonSchema,
  TypeDetailSchema,
  TypeListSchema,
} from "@/features/pokedex/api/pokeapi.dto";
import {
  mapGenerationDetailPokemonNames,
  mapGenerationList,
  mapPokemon,
  mapPokemonListPage,
  mapTypeDetailPokemonNames,
  mapTypeList,
} from "@/features/pokedex/api/pokeapi.mapper";
import type { PokemonListPage, PokemonSummary } from "@/features/pokedex/model/pokemon";

const CACHE_TTL_MS = 5 * 60 * 1000;
const STALE_TTL_MS = 60 * 60 * 1000;

const pokeApiClient = createHttpClient({
  baseUrl: "https://pokeapi.co/api/v2",
  cache: new MemoryCache(),
  limiter: createLimiter(6),
  defaultOptions: {
    timeoutMs: 8000,
    retries: 2,
    retryDelayMs: 400,
    cacheTtlMs: CACHE_TTL_MS,
    staleTtlMs: STALE_TTL_MS,
    swr: true,
  },
});

export const pokeApiCache = pokeApiClient.cache;
export { pokedexCache };

export const getPokemonByName = async (
  nameOrId: string | number,
  signal?: AbortSignal,
): Promise<PokemonSummary> => {
  const dto = await pokeApiClient.get({
    url: `/pokemon/${nameOrId}`,
    cacheKey: `pokemon:${nameOrId}`,
    parser: (json) => PokemonSchema.parse(json),
    signal,
  });
  return mapPokemon(dto);
};

export const getPokemonListPage = async (
  offset: number,
  limit: number,
  signal?: AbortSignal,
): Promise<PokemonListPage> => {
  const listCacheKey = `pokedex:list:${offset}:${limit}`;
  const cached = pokedexCache.get<PokemonListPage>(listCacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  const listDto = await pokeApiClient.get({
    url: "/pokemon",
    query: { offset, limit },
    cacheKey: `pokemon:list:${offset}:${limit}`,
    parser: (json) => PokemonListSchema.parse(json),
    signal,
  });

  const results = await Promise.all(
    listDto.results.map((entry) => getPokemonByName(entry.name, signal)),
  );

  const page = mapPokemonListPage(listDto, results);
  setPokedexCache(listCacheKey, page, CACHE_TTL_MS, STALE_TTL_MS);
  return page;
};

export const prefetchPokemonListPage = async (
  offset: number,
  limit: number,
) => {
  await getPokemonListPage(offset, limit);
};

export const prefetchPokemonDetail = async (nameOrId: string | number) => {
  await getPokemonByName(nameOrId);
};

export const getPokemonNameIndex = async (signal?: AbortSignal) => {
  const dto = await pokeApiClient.get({
    url: "/pokemon",
    query: { offset: 0, limit: 2000 },
    cacheKey: "pokemon:names:index",
    parser: (json) => PokemonListSchema.parse(json),
    signal,
  });
  return dto.results.map((entry) => entry.name);
};

export const getPokemonTypes = async (signal?: AbortSignal) => {
  const dto = await pokeApiClient.get({
    url: "/type",
    cacheKey: "pokemon:types",
    parser: (json) => TypeListSchema.parse(json),
    signal,
  });
  return mapTypeList(dto);
};

export const getPokemonGenerations = async (signal?: AbortSignal) => {
  const dto = await pokeApiClient.get({
    url: "/generation",
    cacheKey: "pokemon:generations",
    parser: (json) => GenerationListSchema.parse(json),
    signal,
  });
  return mapGenerationList(dto);
};

export const getPokemonNamesByType = async (
  typeNameOrId: string | number,
  signal?: AbortSignal,
) => {
  const dto = await pokeApiClient.get({
    url: `/type/${typeNameOrId}`,
    cacheKey: `pokemon:type:${typeNameOrId}`,
    parser: (json) => TypeDetailSchema.parse(json),
    signal,
  });
  return mapTypeDetailPokemonNames(dto);
};

export const getPokemonNamesByGeneration = async (
  generationNameOrId: string | number,
  signal?: AbortSignal,
) => {
  const dto = await pokeApiClient.get({
    url: `/generation/${generationNameOrId}`,
    cacheKey: `pokemon:generation:${generationNameOrId}`,
    parser: (json) => GenerationDetailSchema.parse(json),
    signal,
  });
  return mapGenerationDetailPokemonNames(dto);
};
