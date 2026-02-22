import { useEffect, useMemo, useState } from "react";
import { getPokemonNameIndex } from "@/features/pokedex/api/pokeapi.service";
import { useDebouncedValue } from "@/features/pokedex/hooks/useDebouncedValue";

type SuggestionState = {
  status: "idle" | "loading" | "ready" | "error";
  names: string[];
};

const MAX_SUGGESTIONS = 8;

export const usePokemonNameSuggestions = (query: string) => {
  const debounced = useDebouncedValue(query.trim().toLowerCase(), 200);
  const [state, setState] = useState<SuggestionState>({
    status: "idle",
    names: [],
  });

  useEffect(() => {
    if (!debounced) return;

    const controller = new AbortController();

    const load = async () => {
      try {
        setState((prev) => ({ ...prev, status: "loading" }));
        const names = await getPokemonNameIndex(controller.signal);
        const startsWith = names.filter((name) => name.startsWith(debounced));
        const contains =
          startsWith.length < MAX_SUGGESTIONS
            ? names.filter(
                (name) =>
                  !startsWith.includes(name) && name.includes(debounced),
              )
            : [];
        const filtered = [...startsWith, ...contains].slice(0, MAX_SUGGESTIONS);
        setState({ status: "ready", names: filtered });
      } catch {
        if (controller.signal.aborted) return;
        setState({ status: "error", names: [] });
      }
    };

    void load();
    return () => controller.abort();
  }, [debounced]);

  const exactMatch = useMemo(
    () => state.names.includes(debounced),
    [state.names, debounced],
  );

  return {
    query: debounced,
    status: state.status,
    suggestions: state.names,
    exactMatch,
  };
};
