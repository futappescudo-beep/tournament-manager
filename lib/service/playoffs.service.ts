import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { PlayoffBracketValues } from "@/lib/validations/playoffs";

export type PlayoffBracketSummary = {
  id: string;
  name: string;
  trophy: "GOLD" | "SILVER" | "CUSTOM";
  categoryName: string;
  status: "DRAFT" | "CONFIRMED" | "COMPLETED";
  matches: { id: string; stageName: string; matchOrder: number; home: string; away: string; isNeutralVenue: boolean; isFinal: boolean }[];
};

export async function getPlayoffBrackets(): Promise<PlayoffBracketSummary[]> {
  await requireUser();
  const supabase = await createClient();
  const { data: brackets, error } = await (supabase.from("playoff_brackets" as never)
    .select("id,name,trophy,status,category_id")
    .order("created_at", { ascending: false }) as unknown as Promise<{ data: { id: string; name: string; trophy: "GOLD" | "SILVER" | "CUSTOM"; status: "DRAFT" | "CONFIRMED" | "COMPLETED"; category_id: string }[] | null; error: { message: string } | null }>);
  if (error) {
    // Permite desplegar la interfaz antes de que la organización ejecute la
    // migración; el fixture manual sigue disponible mientras tanto.
    if ((error as { code?: string }).code === "42P01") return [];
    throw new Error(error.message);
  }
  if (!brackets?.length) return [];
  const [categoriesResult, matchesResult, registrationsResult] = await Promise.all([
    supabase.from("categories").select("id,name").in("id", brackets.map((bracket) => bracket.category_id)),
    supabase.from("playoff_bracket_matches" as never).select("id,bracket_id,stage_name,match_order,home_team_registration_id,away_team_registration_id,home_source_label,away_source_label,is_neutral_venue,is_final").in("bracket_id", brackets.map((bracket) => bracket.id)).order("match_order") as unknown as Promise<{ data: { id: string; bracket_id: string; stage_name: string; match_order: number; home_team_registration_id: string | null; away_team_registration_id: string | null; home_source_label: string | null; away_source_label: string | null; is_neutral_venue: boolean; is_final: boolean }[] | null; error: { message: string } | null }>,
    supabase.from("team_category_registrations").select("id,display_name,team_id").is("deleted_at", null),
  ]);
  if (categoriesResult.error || matchesResult.error || registrationsResult.error) throw new Error(categoriesResult.error?.message ?? matchesResult.error?.message ?? registrationsResult.error?.message ?? "No se pudieron cargar los cuadros.");
  const registrations = registrationsResult.data ?? [];
  const { data: teams, error: teamsError } = await supabase.from("teams").select("id,name").in("id", registrations.map((registration) => registration.team_id));
  if (teamsError) throw new Error(teamsError.message);
  const teamNames = new Map((teams ?? []).map((team) => [team.id, team.name]));
  const registrationNames = new Map(registrations.map((registration) => [registration.id, registration.display_name ?? teamNames.get(registration.team_id) ?? "Equipo"]));
  const categoryNames = new Map((categoriesResult.data ?? []).map((category) => [category.id, category.name]));
  return brackets.map((bracket) => ({
    id: bracket.id, name: bracket.name, trophy: bracket.trophy, status: bracket.status, categoryName: categoryNames.get(bracket.category_id) ?? "Categoría",
    matches: (matchesResult.data ?? []).filter((match) => match.bracket_id === bracket.id).map((match) => ({
      id: match.id, stageName: match.stage_name, matchOrder: match.match_order,
      home: match.home_team_registration_id ? registrationNames.get(match.home_team_registration_id) ?? "Equipo" : match.home_source_label ?? "Por definir",
      away: match.away_team_registration_id ? registrationNames.get(match.away_team_registration_id) ?? "Equipo" : match.away_source_label ?? "Por definir",
      isNeutralVenue: match.is_neutral_venue, isFinal: match.is_final,
    })),
  }));
}

export async function createPlayoffBracket(values: PlayoffBracketValues) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: category, error: categoryError } = await supabase.from("categories").select("id").eq("id", values.categoryId).eq("tournament_id", values.tournamentId).is("deleted_at", null).maybeSingle();
  if (categoryError) throw new Error(categoryError.message);
  if (!category) throw new Error("La categoría no pertenece al torneo seleccionado.");
  const explicitTeamIds = values.matches.flatMap((match) => [match.homeTeamRegistrationId, match.awayTeamRegistrationId]).filter((id): id is string => Boolean(id));
  if (explicitTeamIds.length) {
    const { data: registrations, error: registrationsError } = await supabase.from("team_category_registrations").select("id,category_id").in("id", explicitTeamIds).is("deleted_at", null);
    if (registrationsError) throw new Error(registrationsError.message);
    if ((registrations ?? []).length !== new Set(explicitTeamIds).size || (registrations ?? []).some((registration) => registration.category_id !== values.categoryId)) throw new Error("Todos los equipos seleccionados deben pertenecer a la categoría elegida.");
  }
  const { data: bracket, error: bracketError } = await (supabase.from("playoff_brackets" as never).insert({ tournament_id: values.tournamentId, category_id: values.categoryId, name: values.name, trophy: values.trophy, notes: values.notes || null, created_by: user.id }).select("id").single() as unknown as Promise<{ data: { id: string } | null; error: { message: string } | null }>);
  if (bracketError || !bracket) throw new Error(bracketError?.message ?? "No se pudo crear el cuadro.");
  const { error: matchesError } = await (supabase.from("playoff_bracket_matches" as never).insert(values.matches.map((match, index) => ({ bracket_id: bracket.id, stage_name: match.stageName, match_order: index + 1, home_team_registration_id: match.homeTeamRegistrationId, away_team_registration_id: match.awayTeamRegistrationId, home_source_label: match.homeTeamRegistrationId ? null : match.homeSourceLabel || null, away_source_label: match.awayTeamRegistrationId ? null : match.awaySourceLabel || null, is_neutral_venue: match.isNeutralVenue || match.isFinal, is_final: match.isFinal }))) as unknown as Promise<{ error: { message: string } | null }>);
  if (matchesError) throw new Error(matchesError.message);
}
