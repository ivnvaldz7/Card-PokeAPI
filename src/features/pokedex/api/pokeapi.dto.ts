import { z } from "zod";

export const NamedResourceSchema = z.object({
  name: z.string(),
  url: z.string().url(),
});

export const PokemonListSchema = z.object({
  count: z.number(),
  next: z.string().url().nullable(),
  previous: z.string().url().nullable(),
  results: z.array(NamedResourceSchema),
});

export const PokemonTypeSchema = z.object({
  slot: z.number(),
  type: NamedResourceSchema,
});

export const PokemonStatSchema = z.object({
  base_stat: z.number(),
  stat: NamedResourceSchema,
});

export const PokemonSpritesSchema = z.object({
  other: z
    .object({
      "official-artwork": z
        .object({
          front_default: z.string().url().nullable(),
        })
        .optional(),
      dream_world: z
        .object({
          front_default: z.string().url().nullable(),
        })
        .optional(),
    })
    .optional(),
});

export const PokemonSchema = z.object({
  id: z.number(),
  name: z.string(),
  height: z.number(),
  weight: z.number(),
  types: z.array(PokemonTypeSchema),
  stats: z.array(PokemonStatSchema),
  sprites: PokemonSpritesSchema,
});

export const TypeListSchema = z.object({
  results: z.array(NamedResourceSchema),
});

export const GenerationListSchema = z.object({
  results: z.array(NamedResourceSchema),
});

export const TypeDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  pokemon: z.array(
    z.object({
      pokemon: NamedResourceSchema,
    }),
  ),
});

export const GenerationDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  pokemon_species: z.array(NamedResourceSchema),
});

export type PokemonDto = z.infer<typeof PokemonSchema>;
export type PokemonListDto = z.infer<typeof PokemonListSchema>;
export type TypeListDto = z.infer<typeof TypeListSchema>;
export type GenerationListDto = z.infer<typeof GenerationListSchema>;
export type TypeDetailDto = z.infer<typeof TypeDetailSchema>;
export type GenerationDetailDto = z.infer<typeof GenerationDetailSchema>;
