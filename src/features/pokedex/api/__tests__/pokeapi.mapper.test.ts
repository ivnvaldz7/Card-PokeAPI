import { describe, expect, it } from "vitest";
import { mapPokemon } from "@/features/pokedex/api/pokeapi.mapper";
import type { PokemonDto } from "@/features/pokedex/api/pokeapi.dto";

describe("pokeapi mapper", () => {
  it("maps pokemon dto into summary", () => {
    const dto: PokemonDto = {
      id: 25,
      name: "pikachu",
      height: 4,
      weight: 60,
      types: [
        {
          slot: 1,
          type: {
            name: "electric",
            url: "https://pokeapi.co/api/v2/type/13/",
          },
        },
      ],
      stats: [
        { base_stat: 35, stat: { name: "hp", url: "" } },
        { base_stat: 55, stat: { name: "attack", url: "" } },
        { base_stat: 40, stat: { name: "defense", url: "" } },
        { base_stat: 50, stat: { name: "special-attack", url: "" } },
        { base_stat: 50, stat: { name: "special-defense", url: "" } },
        { base_stat: 90, stat: { name: "speed", url: "" } },
      ],
      sprites: {
        other: {
          "official-artwork": {
            front_default: "https://example.com/pikachu.png",
          },
        },
      },
    };

    const summary = mapPokemon(dto);

    expect(summary).toEqual({
      id: 25,
      name: "pikachu",
      height: 4,
      weight: 60,
      image: "https://example.com/pikachu.png",
      types: ["electric"],
      stats: {
        hp: 35,
        attack: 55,
        defense: 40,
        specialAttack: 50,
        specialDefense: 50,
        speed: 90,
      },
    });
  });
});
