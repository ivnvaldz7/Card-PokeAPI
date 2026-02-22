export type SortKey =
  | "id"
  | "name"
  | "attack"
  | "defense"
  | "specialAttack"
  | "specialDefense"
  | "hp"
  | "speed";

export type SortDirection = "asc" | "desc";

export type PokedexFilters = {
  type: string | null;
  generation: string | null;
};
