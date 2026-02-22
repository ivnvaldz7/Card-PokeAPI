// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const replace = vi.fn();
const params = new URLSearchParams("");

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => params,
  usePathname: () => "/",
}));

vi.mock("@/features/pokedex/api/pokeapi.service", () => {
  const pokemonMap = {
    bulbasaur: {
      id: 1,
      name: "bulbasaur",
      image: "https://example.com/bulbasaur.png",
      types: ["grass", "poison"],
      height: 7,
      weight: 69,
      stats: {
        hp: 45,
        attack: 49,
        defense: 49,
        specialAttack: 65,
        specialDefense: 65,
        speed: 45,
      },
    },
    charmander: {
      id: 4,
      name: "charmander",
      image: "https://example.com/charmander.png",
      types: ["fire"],
      height: 6,
      weight: 85,
      stats: {
        hp: 39,
        attack: 52,
        defense: 43,
        specialAttack: 60,
        specialDefense: 50,
        speed: 65,
      },
    },
    pikachu: {
      id: 25,
      name: "pikachu",
      image: "https://example.com/pikachu.png",
      types: ["electric"],
      height: 4,
      weight: 60,
      stats: {
        hp: 35,
        attack: 55,
        defense: 40,
        specialAttack: 50,
        specialDefense: 50,
        speed: 90,
      },
    },
  } as const;
  const pokemonList = [pokemonMap.bulbasaur, pokemonMap.charmander];

  return {
    getPokemonListPage: vi.fn().mockResolvedValue({
      count: 2,
      nextOffset: null,
      prevOffset: null,
      results: pokemonList,
    }),
    getPokemonTypes: vi.fn().mockResolvedValue([
      { id: 12, name: "grass" },
      { id: 10, name: "fire" },
    ]),
    getPokemonGenerations: vi.fn().mockResolvedValue([
      { id: 1, name: "generation-i" },
    ]),
    getPokemonNamesByType: vi.fn().mockResolvedValue(["bulbasaur"]),
    getPokemonNamesByGeneration: vi.fn().mockResolvedValue([
      "bulbasaur",
      "charmander",
    ]),
    getPokemonNameIndex: vi.fn().mockResolvedValue([
      "bulbasaur",
      "charmander",
      "pikachu",
    ]),
    getPokemonByName: vi.fn().mockImplementation((name: string | number) => {
      const key = String(name).toLowerCase() as keyof typeof pokemonMap;
      return Promise.resolve(pokemonMap[key] ?? pokemonMap.bulbasaur);
    }),
    prefetchPokemonListPage: vi.fn(),
    pokedexCache: {
      get: vi.fn().mockReturnValue(undefined),
    },
  };
});

import { PokedexPage } from "@/features/pokedex/ui/PokedexPage";

describe("PokedexPage", () => {
  it("renders list from API", async () => {
    render(<PokedexPage />);

    const showButton = await screen.findByRole("button", {
      name: /ver listado completo/i,
    });
    const user = userEvent.setup();
    await user.click(showButton);

    expect(await screen.findByText(/bulbasaur/i)).toBeInTheDocument();
  });

  it("searches by name", async () => {
    const user = userEvent.setup();
    render(<PokedexPage />);

    const input = await screen.findByLabelText(/buscar pokémon/i);
    await user.type(input, "pikachu");
    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(await screen.findByText(/resultado de búsqueda/i)).toBeInTheDocument();
    expect(await screen.findByText(/pikachu/i)).toBeInTheDocument();
  });

  it("filters by type", async () => {
    params.set("type", "grass");
    render(<PokedexPage />);

    expect(await screen.findByText(/bulbasaur/i)).toBeInTheDocument();
    expect(screen.queryByText(/charmander/i)).not.toBeInTheDocument();
    params.delete("type");
  });
});
