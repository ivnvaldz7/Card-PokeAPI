"use client";

import { useParams } from "next/navigation";
import { PokemonDetailPage } from "@/features/pokedex/ui/PokemonDetailPage";

export default function PokemonPage() {
  const params = useParams();
  const nameParam = params?.name;
  const name =
    typeof nameParam === "string"
      ? nameParam
      : Array.isArray(nameParam)
        ? nameParam[0]
        : null;

  if (!name) return null;

  return <PokemonDetailPage name={name} />;
}
