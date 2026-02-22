export type PokemonStats = {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
};

export type PokemonSummary = {
  id: number;
  name: string;
  types: string[];
  image: string | null;
  height: number;
  weight: number;
  stats: PokemonStats;
};

export type PokemonListPage = {
  count: number;
  nextOffset: number | null;
  prevOffset: number | null;
  results: PokemonSummary[];
};

export type PokemonType = {
  id: number;
  name: string;
};

export type PokemonGeneration = {
  id: number;
  name: string;
};
