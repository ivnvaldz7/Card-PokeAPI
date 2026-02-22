import { useEffect, useState } from "react";
import type { PokemonSummary } from "@/features/pokedex/model/pokemon";
import { getPokemonByName } from "@/features/pokedex/api/pokeapi.service";

type LoadState = {
  status: "idle" | "loading" | "success" | "error" | "not-found";
  data: PokemonSummary | null;
  error: string | null;
};

export const usePokemonDetail = (nameOrId: string | number | null) => {
  const [state, setState] = useState<LoadState>({
    status: "idle",
    data: null,
    error: null,
  });

  useEffect(() => {
    if (!nameOrId) return;

    const controller = new AbortController();

    const load = async () => {
      try {
        setState({ status: "loading", data: null, error: null });
        const pokemon = await getPokemonByName(nameOrId, controller.signal);
        setState({ status: "success", data: pokemon, error: null });
      } catch (error) {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : "Unknown error";
        if (message.includes("404")) {
          setState({ status: "not-found", data: null, error: null });
          return;
        }
        setState({ status: "error", data: null, error: message });
      }
    };

    void load();
    return () => controller.abort();
  }, [nameOrId]);

  if (!nameOrId) {
    return { status: "idle", data: null, error: null } as LoadState;
  }

  return state;
};
