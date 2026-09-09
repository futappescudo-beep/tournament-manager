import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getFixture, getStandings, points, type FixtureMatch, type Standing } from "@/lib/service/competition.service";

export type DashboardFilter = { tournamentId?: string; categoryId?: string; zoneId?: string };
export type DashboardCatalog = { tournaments: { id: string; name: string }[]; categories: { id: string; tournament_id: string; name: string }[]; zones: { id: string; category_id: string; name: string }[] };

function catalogKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{L}\p{N}]/gu, "")
    .toLocaleLowerCase("es-AR");
}

export async function getDashboardCatalog(): Promise<DashboardCatalog> {
  await requireUser(); const supabase = await createClient();
  const [tournaments, categories, zones] = await Promise.all([supabase.from("tournaments").select("id,name").is("deleted_at", null).order("name"), supabase.from("categories").select("id,tournament_id,name").is("deleted_at", null).eq("active", true).order("display_order"), supabase.from("zones").select("id,category_id,name").is("deleted_at", null).order("display_order")]);
  if (tournaments.error) throw new Error(tournaments.error.message); if (categories.error) throw new Error(categories.error.message); if (zones.error) throw new Error(zones.error.message);
  const visibleCategories = (categories.data ?? []).filter((category, index, all) => all.findIndex((item) => item.tournament_id === category.tournament_id && catalogKey(item.name) === catalogKey(category.name)) === index);
  const visibleCategoryIds = new Set(visibleCategories.map((category) => category.id));
  const visibleZones = (zones.data ?? []).filter((zone, index, all) => visibleCategoryIds.has(zone.category_id) && all.findIndex((item) => item.category_id === zone.category_id && catalogKey(item.name) === catalogKey(zone.name)) === index);
  return { tournaments: tournaments.data ?? [], categories: visibleCategories, zones: visibleZones };
}

export async function getDashboardData(filter: DashboardFilter): Promise<{ teamCount: number; playerCount: number; goalCount: number; matches: FixtureMatch[]; standings: Standing[] }> {
  await requireUser(); const supabase = await createClient(); const catalog = await getDashboardCatalog();
  const { data: rawCategories, error: rawCategoriesError } = await supabase.from("categories").select("id,tournament_id,name").is("deleted_at", null).eq("active", true);
  if (rawCategoriesError) throw new Error(rawCategoriesError.message);
  const selectedCategory = catalog.categories.find((category) => category.id === filter.categoryId);
  const categoryIds = selectedCategory
    ? (rawCategories ?? []).filter((category) => category.tournament_id === selectedCategory.tournament_id && catalogKey(category.name) === catalogKey(selectedCategory.name)).map((category) => category.id)
    : filter.tournamentId
      ? (rawCategories ?? []).filter((category) => category.tournament_id === filter.tournamentId).map((category) => category.id)
      : [];
  let registrationsQuery = supabase.from("team_category_registrations").select("id,team_id,teams!inner(id,active,deleted_at)").is("deleted_at", null).is("teams.deleted_at", null).eq("teams.active", true);
  if (categoryIds.length) registrationsQuery = registrationsQuery.in("category_id", categoryIds);
  if (filter.zoneId) registrationsQuery = registrationsQuery.eq("zone_id", filter.zoneId);
  const { data: registrations, error } = await registrationsQuery;
  if (error) throw new Error(error.message);
  const registrationIds = (registrations ?? []).map((item) => item.id); const teamCount = new Set((registrations ?? []).map((item) => item.team_id)).size;
  if (!registrationIds.length) return { teamCount: 0, playerCount: 0, goalCount: 0, matches: [], standings: [] };
  const [playersResult, matchesResult, fixture, standings] = await Promise.all([supabase.from("player_team_registrations").select("player_id").is("deleted_at", null).is("left_at", null).in("team_registration_id", registrationIds), supabase.from("matches").select("id,home_score,away_score").is("deleted_at", null).in("home_team_registration_id", registrationIds), getFixture(), getStandings()]);
  if (playersResult.error) throw new Error(playersResult.error.message); if (matchesResult.error) throw new Error(matchesResult.error.message);
  const matchIds = new Set((matchesResult.data ?? []).map((item) => item.id));
  return { teamCount, playerCount: new Set((playersResult.data ?? []).map((item) => item.player_id)).size, goalCount: (matchesResult.data ?? []).reduce((sum, item) => sum + (item.home_score ?? 0) + (item.away_score ?? 0), 0), matches: fixture.filter((item) => matchIds.has(item.id)).slice(0, 5), standings: standings.filter((item) => item.team_registration_id && registrationIds.includes(item.team_registration_id)).sort((a, b) => points(b) - points(a)).slice(0, 5) };
}
