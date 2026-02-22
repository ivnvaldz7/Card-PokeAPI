import { describe, expect, it } from "vitest";
import { getPokemonListPage } from "@/features/pokedex/api/pokeapi.service";

describe("pokeapi service", () => {
  it("loads list page via MSW", async () => {
    const page = await getPokemonListPage(0, 24);

    expect(page.count).toBeGreaterThan(0);
    expect(page.results[0]?.name).toBe("bulbasaur");
  });
});
