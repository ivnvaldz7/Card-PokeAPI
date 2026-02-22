import { http, HttpResponse } from "msw";

const BASE_URL = "https://pokeapi.co/api/v2";

const pokemonData = [
  {
    id: 1,
    name: "bulbasaur",
    types: ["grass", "poison"],
    stats: {
      hp: 45,
      attack: 49,
      defense: 49,
      specialAttack: 65,
      specialDefense: 65,
      speed: 45,
    },
  },
  {
    id: 2,
    name: "ivysaur",
    types: ["grass", "poison"],
    stats: {
      hp: 60,
      attack: 62,
      defense: 63,
      specialAttack: 80,
      specialDefense: 80,
      speed: 60,
    },
  },
  {
    id: 4,
    name: "charmander",
    types: ["fire"],
    stats: {
      hp: 39,
      attack: 52,
      defense: 43,
      specialAttack: 60,
      specialDefense: 50,
      speed: 65,
    },
  },
  {
    id: 7,
    name: "squirtle",
    types: ["water"],
    stats: {
      hp: 44,
      attack: 48,
      defense: 65,
      specialAttack: 50,
      specialDefense: 64,
      speed: 43,
    },
  },
  {
    id: 25,
    name: "pikachu",
    types: ["electric"],
    stats: {
      hp: 35,
      attack: 55,
      defense: 40,
      specialAttack: 50,
      specialDefense: 50,
      speed: 90,
    },
  },
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
    { base_stat: pokemon.stats.hp, stat: { name: "hp", url: `${BASE_URL}/stat/1/` } },
    {
      base_stat: pokemon.stats.attack,
      stat: { name: "attack", url: `${BASE_URL}/stat/2/` },
    },
    {
      base_stat: pokemon.stats.defense,
      stat: { name: "defense", url: `${BASE_URL}/stat/3/` },
    },
    {
      base_stat: pokemon.stats.specialAttack,
      stat: { name: "special-attack", url: `${BASE_URL}/stat/4/` },
    },
    {
      base_stat: pokemon.stats.specialDefense,
      stat: { name: "special-defense", url: `${BASE_URL}/stat/5/` },
    },
    {
      base_stat: pokemon.stats.speed,
      stat: { name: "speed", url: `${BASE_URL}/stat/6/` },
    },
  ],
  sprites: {
    other: {
      "official-artwork": {
        front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`,
      },
    },
  },
});

export const handlers = [
  http.get(`${BASE_URL}/pokemon`, ({ request }) => {
    const url = new URL(request.url);
    const offset = Number(url.searchParams.get("offset") ?? "0");
    const limit = Number(url.searchParams.get("limit") ?? "20");
    const results = pokemonData.slice(offset, offset + limit).map((pokemon) => ({
      name: pokemon.name,
      url: `${BASE_URL}/pokemon/${pokemon.name}/`,
    }));
    return HttpResponse.json({
      count: pokemonData.length,
      next: null,
      previous: null,
      results,
    });
  }),
  http.get(`${BASE_URL}/pokemon/:name`, ({ params }) => {
    const name = String(params.name);
    const pokemon = pokemonData.find(
      (entry) => entry.name === name || entry.id === Number(name),
    );
    if (!pokemon) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(toPokemonDto(pokemon));
  }),
  http.get(`${BASE_URL}/type`, () =>
    HttpResponse.json({
      results: [
        { name: "grass", url: `${BASE_URL}/type/12/` },
        { name: "fire", url: `${BASE_URL}/type/10/` },
        { name: "water", url: `${BASE_URL}/type/11/` },
        { name: "electric", url: `${BASE_URL}/type/13/` },
      ],
    }),
  ),
  http.get(`${BASE_URL}/generation`, () =>
    HttpResponse.json({
      results: [{ name: "generation-i", url: `${BASE_URL}/generation/1/` }],
    }),
  ),
  http.get(`${BASE_URL}/type/:type`, ({ params }) => {
    const type = String(params.type);
    const matches = pokemonData.filter((pokemon) =>
      pokemon.types.includes(type),
    );
    return HttpResponse.json({
      id: 1,
      name: type,
      pokemon: matches.map((pokemon) => ({
        pokemon: {
          name: pokemon.name,
          url: `${BASE_URL}/pokemon/${pokemon.name}/`,
        },
      })),
    });
  }),
  http.get(`${BASE_URL}/generation/:generation`, ({ params }) => {
    const generation = String(params.generation);
    if (generation !== "generation-i" && generation !== "1") {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({
      id: 1,
      name: "generation-i",
      pokemon_species: pokemonData.map((pokemon) => ({
        name: pokemon.name,
        url: `${BASE_URL}/pokemon-species/${pokemon.id}/`,
      })),
    });
  }),
];
