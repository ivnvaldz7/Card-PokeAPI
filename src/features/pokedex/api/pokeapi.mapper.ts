import type {
  GenerationDetailDto,
  GenerationListDto,
  PokemonDto,
  PokemonListDto,
  TypeDetailDto,
  TypeListDto,
} from "@/features/pokedex/api/pokeapi.dto";
import type {
  PokemonGeneration,
  PokemonListPage,
  PokemonSummary,
  PokemonType,
} from "@/features/pokedex/model/pokemon";

const getIdFromUrl = (url: string) => {
  const parts = url.split("/").filter(Boolean);
  const id = Number(parts[parts.length - 1]);
  return Number.isNaN(id) ? 0 : id;
};

const getOffsetFromUrl = (url: string | null) => {
  if (!url) return null;
  const parsed = new URL(url);
  const offset = parsed.searchParams.get("offset");
  return offset ? Number(offset) : null;
};

const getStat = (pokemon: PokemonDto, name: string) =>
  pokemon.stats.find((stat) => stat.stat.name === name)?.base_stat ?? 0;

export const mapPokemon = (pokemon: PokemonDto): PokemonSummary => {
  const artwork =
    pokemon.sprites.other?.["official-artwork"]?.front_default ??
    pokemon.sprites.other?.dream_world?.front_default ??
    null;

  return {
    id: pokemon.id,
    name: pokemon.name,
    height: pokemon.height,
    weight: pokemon.weight,
    image: artwork,
    types: pokemon.types
      .slice()
      .sort((a, b) => a.slot - b.slot)
      .map((type) => type.type.name),
    stats: {
      hp: getStat(pokemon, "hp"),
      attack: getStat(pokemon, "attack"),
      defense: getStat(pokemon, "defense"),
      specialAttack: getStat(pokemon, "special-attack"),
      specialDefense: getStat(pokemon, "special-defense"),
      speed: getStat(pokemon, "speed"),
    },
  };
};

export const mapPokemonListPage = (
  dto: PokemonListDto,
  results: PokemonSummary[],
): PokemonListPage => ({
  count: dto.count,
  nextOffset: getOffsetFromUrl(dto.next),
  prevOffset: getOffsetFromUrl(dto.previous),
  results,
});

export const mapTypeList = (dto: TypeListDto): PokemonType[] =>
  dto.results.map((type) => ({
    id: getIdFromUrl(type.url),
    name: type.name,
  }));

export const mapGenerationList = (
  dto: GenerationListDto,
): PokemonGeneration[] =>
  dto.results.map((gen) => ({
    id: getIdFromUrl(gen.url),
    name: gen.name,
  }));

export const mapTypeDetailPokemonNames = (dto: TypeDetailDto) =>
  dto.pokemon.map((entry) => entry.pokemon.name);

export const mapGenerationDetailPokemonNames = (
  dto: GenerationDetailDto,
) => dto.pokemon_species.map((entry) => entry.name);
