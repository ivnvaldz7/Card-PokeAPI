import { Suspense } from "react";
import { PokedexPage } from "@/features/pokedex/ui/PokedexPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PokedexPage />
    </Suspense>
  );
}
