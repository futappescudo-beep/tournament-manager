import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import type { CategoryOption } from "@/lib/types/team";

export async function getCategoriesWithZones(): Promise<CategoryOption[]> {
  await requireUser();
  const supabase = await createClient();
  const [categoriesResult, zonesResult, tournamentsResult] = await Promise.all([
    supabase.from("categories").select("id, tournament_id, name").eq("active", true).is("deleted_at", null).order("display_order"),
    supabase.from("zones").select("id, category_id, name").is("deleted_at", null).order("display_order"),
    supabase.from("tournaments").select("id,name").is("deleted_at", null),
  ]);

  if (categoriesResult.error) throw new Error(categoriesResult.error.message);
  if (zonesResult.error) throw new Error(zonesResult.error.message);
  if (tournamentsResult.error) throw new Error(tournamentsResult.error.message);

  const tournamentNames = new Map((tournamentsResult.data ?? []).map((tournament) => [tournament.id, tournament.name]));

  return (categoriesResult.data ?? []).flatMap((category) => {
    const tournamentName = tournamentNames.get(category.tournament_id);
    if (!tournamentName) return [];
    return [{
    id: category.id,
    name: category.name,
    tournament_name: tournamentName,
    zones: (zonesResult.data ?? [])
      .filter((zone) => zone.category_id === category.id)
      .map((zone) => ({ id: zone.id, name: zone.name })),
    }];
  });
}
