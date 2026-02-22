import { test, expect, type Page } from "@playwright/test";

const BASE_URL = "https://pokeapi.co/api/v2";

const pokemonData = [
  { id: 1, name: "bulbasaur", types: ["grass", "poison"] },
  { id: 2, name: "ivysaur", types: ["grass", "poison"] },
  { id: 4, name: "charmander", types: ["fire"] },
  { id: 7, name: "squirtle", types: ["water"] },
  { id: 25, name: "pikachu", types: ["electric"] },
];

const toPokemonDto = (pokemon: (typeof pokemonData)[number]) => ({
  id: pokemon.id,
  name: pokemon.name,
  height: 6,
  weight: 85,
  types: pokemon.types.map((type, index) => ({
    slot: index + 1,
    type: {
      name: type,
      url: `${BASE_URL}/type/${type}/`,
    },
  })),
  stats: [
    { base_stat: 45, stat: { name: "hp", url: "" } },
    { base_stat: 49, stat: { name: "attack", url: "" } },
    { base_stat: 49, stat: { name: "defense", url: "" } },
    { base_stat: 65, stat: { name: "special-attack", url: "" } },
    { base_stat: 65, stat: { name: "special-defense", url: "" } },
    { base_stat: 45, stat: { name: "speed", url: "" } },
  ],
  sprites: {
    other: {
      "official-artwork": {
        front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`,
      },
    },
  },
});

const mockPokeApi = async (page: Page) => {
  await page.route("**/api/v2/**", async (route) => {
    const url = new URL(route.request().url());
    const pathname = url.pathname;

    if (pathname.endsWith("/pokemon")) {
      const offset = Number(url.searchParams.get("offset") ?? "0");
      const limit = Number(url.searchParams.get("limit") ?? "20");
      const results = pokemonData
        .slice(offset, offset + limit)
        .map((pokemon) => ({
          name: pokemon.name,
          url: `${BASE_URL}/pokemon/${pokemon.name}/`,
        }));
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          count: pokemonData.length,
          next: null,
          previous: null,
          results,
        }),
      });
    }

    if (pathname.includes("/pokemon/")) {
      const name = pathname.split("/").filter(Boolean).pop();
      const pokemon = pokemonData.find(
        (entry) => entry.name === name || String(entry.id) === name,
      );
      if (!pokemon) {
        return route.fulfill({ status: 404, body: "" });
      }
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(toPokemonDto(pokemon)),
      });
    }

    if (pathname.endsWith("/type")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          results: [
            { name: "grass", url: `${BASE_URL}/type/12/` },
            { name: "fire", url: `${BASE_URL}/type/10/` },
            { name: "water", url: `${BASE_URL}/type/11/` },
            { name: "electric", url: `${BASE_URL}/type/13/` },
          ],
        }),
      });
    }

    if (pathname.endsWith("/generation")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          results: [{ name: "generation-i", url: `${BASE_URL}/generation/1/` }],
        }),
      });
    }

    if (pathname.includes("/type/")) {
      const type = pathname.split("/").filter(Boolean).pop() ?? "";
      const matches = pokemonData.filter((pokemon) =>
        pokemon.types.includes(type),
      );
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: 1,
          name: type,
          pokemon: matches.map((pokemon) => ({
            pokemon: {
              name: pokemon.name,
              url: `${BASE_URL}/pokemon/${pokemon.name}/`,
            },
          })),
        }),
      });
    }

    if (pathname.includes("/generation/")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: 1,
          name: "generation-i",
          pokemon_species: pokemonData.map((pokemon) => ({
            name: pokemon.name,
            url: `${BASE_URL}/pokemon-species/${pokemon.id}/`,
          })),
        }),
      });
    }

    return route.fulfill({ status: 404, body: "" });
  });
};

test("pokedex flow", async ({ page }) => {
  await mockPokeApi(page);

  await page.goto("/");
  await expect(page.getByText("bulbasaur")).toBeVisible();

  await page.getByText("bulbasaur").click();
  await expect(page.getByRole("heading", { name: "bulbasaur" })).toBeVisible();

  await page.goto("/");
  await page.getByLabel("Buscar Pokémon").fill("pikachu");
  await expect(page.getByText("pikachu")).toBeVisible();
});
