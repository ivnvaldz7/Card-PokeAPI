import { useEffect, useMemo, useState } from "react";
import type { PokemonSummary } from "@/features/pokedex/model/pokemon";
import { getPokemonByName } from "@/features/pokedex/api/pokeapi.service";

type PreviewState = {
  status: "idle" | "loading" | "ready" | "error";
  items: PokemonSummary[];
  key: string;
};

const MAX_PREVIEW = 4;

export const usePokemonSuggestionPreview = (
  names: string[],
  enabled: boolean,
) => {
  const previewNames = useMemo(
    () => names.slice(0, MAX_PREVIEW),
    [names],
  );
  const previewKey = useMemo(
    () => previewNames.join("|"),
    [previewNames],
  );
  const [state, setState] = useState<PreviewState>({
    status: "idle",
    items: [],
    key: "",
  });

  useEffect(() => {
    if (!enabled || previewNames.length === 0) return;

    const controller = new AbortController();

    const load = async () => {
      try {
        setState({ status: "loading", items: [], key: previewKey });
        const results = await Promise.all(
          previewNames.map((name) =>
            getPokemonByName(name, controller.signal).catch(() => null),
          ),
        );
        const items = results.filter(Boolean) as PokemonSummary[];
        setState({ status: "ready", items, key: previewKey });
      } catch {
        if (controller.signal.aborted) return;
        setState({ status: "error", items: [], key: previewKey });
      }
    };

    void load();
    return () => controller.abort();
  }, [enabled, previewKey, previewNames]);

  if (!enabled || previewNames.length === 0) {
    return { status: "idle", items: [], key: "" };
  }

  if (state.key !== previewKey) {
    return { status: "loading", items: [], key: previewKey };
  }

  return state;
};
