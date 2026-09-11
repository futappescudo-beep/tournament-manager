import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { PlayoffBracketValues } from "@/lib/validations/playoffs";

type BracketMatchRow = { id: string; bracket_id: string; stage_name: string; match_order: number; home_team_registration_id: string | null; away_team_registration_id: string | null; home_source_label: string | null; away_source_label: string | null; home_source_match_id: string | null; away_source_match_id: string | null; fixture_match_id: string | null; winner_team_registration_id: string | null; is_neutral_venue: boolean; is_final: boolean };
type BracketRow = { id: string; tournament_id: string; category_id: string; name: string; trophy: "GOLD" | "SILVER" | "CUSTOM"; status: "DRAFT" | "CONFIRMED" | "COMPLETED" };

export type PlayoffBracketSummary = { id: string; name: string; trophy: "GOLD" | "SILVER" | "CUSTOM"; categoryName: string; status: "DRAFT" | "CONFIRMED" | "COMPLETED"; matches: { id: string; stageName: string; matchOrder: number; home: string; away: string; isNeutralVenue: boolean; isFinal: boolean; fixtureMatchId: string | null; homeScore: number | null; awayScore: number | null; winner: string | null }[]; };

async function getNames(supabase: Awaited<ReturnType<typeof createClient>>, registrationIds: string[]) {
  if (!registrationIds.length) return new Map<string, string>();
  const { data: registrations, error } = await supabase.from("team_category_registrations").select("id,display_name,team_id").in("id", registrationIds).is("deleted_at", null);
  if (error) throw new Error(error.message);
  const { data: teams, error: teamsError } = await supabase.from("teams").select("id,name").in("id", (registrations ?? []).map((item) => item.team_id));
  if (teamsError) throw new Error(teamsError.message);
  const names = new Map((teams ?? []).map((team) => [team.id, team.name]));
  return new Map((registrations ?? []).map((item) => [item.id, item.display_name ?? names.get(item.team_id) ?? "Equipo"]));
}

export async function getPlayoffBrackets(): Promise<PlayoffBracketSummary[]> {
  await requireUser(); const supabase = await createClient();
  const { data: brackets, error } = await (supabase.from("playoff_brackets" as never).select("id,tournament_id,category_id,name,trophy,status").order("created_at", { ascending: false }) as unknown as Promise<{ data: BracketRow[] | null; error: { message: string; code?: string } | null }>);
  if (error) { if (error.code === "42P01" || error.code === "42703") return []; throw new Error(error.message); }
  if (!brackets?.length) return [];
  const [categoriesResult, matchesResult] = await Promise.all([
    supabase.from("categories").select("id,name").in("id", brackets.map((item) => item.category_id)),
    supabase.from("playoff_bracket_matches" as never).select("id,bracket_id,stage_name,match_order,home_team_registration_id,away_team_registration_id,home_source_label,away_source_label,home_source_match_id,away_source_match_id,fixture_match_id,winner_team_registration_id,is_neutral_venue,is_final").in("bracket_id", brackets.map((item) => item.id)).order("match_order") as unknown as Promise<{ data: BracketMatchRow[] | null; error: { message: string } | null }>,
  ]);
  if (categoriesResult.error || matchesResult.error) throw new Error(categoriesResult.error?.message ?? matchesResult.error?.message ?? "No se pudieron cargar los cuadros.");
  const rows = matchesResult.data ?? [];
  const ids = rows.flatMap((item) => [item.home_team_registration_id, item.away_team_registration_id, item.winner_team_registration_id]).filter((item): item is string => Boolean(item));
  const names = await getNames(supabase, [...new Set(ids)]);
  const fixtureIds = rows.map((item) => item.fixture_match_id).filter((item): item is string => Boolean(item));
  const { data: fixtures, error: fixturesError } = fixtureIds.length ? await supabase.from("matches").select("id,home_score,away_score").in("id", fixtureIds) : { data: [], error: null };
  if (fixturesError) throw new Error(fixturesError.message);
  const scores = new Map((fixtures ?? []).map((item) => [item.id, item]));
  const categories = new Map((categoriesResult.data ?? []).map((item) => [item.id, item.name]));
  return brackets.map((bracket) => ({ id: bracket.id, name: bracket.name, trophy: bracket.trophy, status: bracket.status, categoryName: categories.get(bracket.category_id) ?? "Categoría", matches: rows.filter((item) => item.bracket_id === bracket.id).map((item) => ({ id: item.id, stageName: item.stage_name, matchOrder: item.match_order, home: item.home_team_registration_id ? names.get(item.home_team_registration_id) ?? "Equipo" : item.home_source_label ?? "Por definir", away: item.away_team_registration_id ? names.get(item.away_team_registration_id) ?? "Equipo" : item.away_source_label ?? "Por definir", isNeutralVenue: item.is_neutral_venue, isFinal: item.is_final, fixtureMatchId: item.fixture_match_id, homeScore: item.fixture_match_id ? scores.get(item.fixture_match_id)?.home_score ?? null : null, awayScore: item.fixture_match_id ? scores.get(item.fixture_match_id)?.away_score ?? null : null, winner: item.winner_team_registration_id ? names.get(item.winner_team_registration_id) ?? "Equipo" : null })) }));
}

async function createFixtureIfReady(supabase: Awaited<ReturnType<typeof createClient>>, bracket: BracketRow, match: BracketMatchRow) {
  if (match.fixture_match_id || !match.home_team_registration_id || !match.away_team_registration_id) return;
  const [{ data: phase, error: phaseError }, { data: status, error: statusError }] = await Promise.all([
    supabase.from("competition_phases").select("id").eq("is_elimination", true).is("deleted_at", null).order("display_order").limit(1).maybeSingle(),
    supabase.from("match_statuses").select("id").eq("code", "SCHEDULED").maybeSingle(),
  ]);
  if (phaseError || statusError || !phase || !status) throw new Error(phaseError?.message ?? statusError?.message ?? "Falta configurar la fase Play Off o el estado SCHEDULED.");
  const matchdayName = `Play Off · ${bracket.name} · ${match.stage_name}`;
  const { data: existingMatchday, error: dayError } = await supabase.from("matchdays").select("id").eq("tournament_id", bracket.tournament_id).eq("category_id", bracket.category_id).eq("competition_phase_id", phase.id).eq("name", matchdayName).is("zone_id", null).is("deleted_at", null).maybeSingle();
  if (dayError) throw new Error(dayError.message);
  let matchdayId = existingMatchday?.id;
  if (!matchdayId) { const { data, error } = await supabase.from("matchdays").insert({ tournament_id: bracket.tournament_id, category_id: bracket.category_id, zone_id: null, competition_phase_id: phase.id, round: match.match_order, name: matchdayName, starts_at: null, is_closed: false }).select("id").single(); if (error) throw new Error(error.message); matchdayId = data.id; }
  const { data: fixture, error: fixtureError } = await supabase.from("matches").insert({ matchday_id: matchdayId, competition_phase_id: phase.id, home_team_registration_id: match.home_team_registration_id, away_team_registration_id: match.away_team_registration_id, match_status_id: status.id, match_date: null, kickoff_time: null }).select("id").single();
  if (fixtureError) throw new Error(fixtureError.message);
  const { error: linkError } = await (supabase.from("playoff_bracket_matches" as never).update({ fixture_match_id: fixture.id }).eq("id", match.id) as unknown as Promise<{ error: { message: string } | null }>);
  if (linkError) throw new Error(linkError.message);
}

export async function createPlayoffBracket(values: PlayoffBracketValues) {
  const user = await requireUser(); const supabase = await createClient();
  const { data: category, error: categoryError } = await supabase.from("categories").select("id").eq("id", values.categoryId).eq("tournament_id", values.tournamentId).is("deleted_at", null).maybeSingle();
  if (categoryError || !category) throw new Error(categoryError?.message ?? "La categoría no pertenece al torneo seleccionado.");
  const explicitIds = values.matches.flatMap((item) => [item.homeTeamRegistrationId, item.awayTeamRegistrationId]).filter((item): item is string => Boolean(item));
  const { data: registrations, error: registrationsError } = explicitIds.length ? await supabase.from("team_category_registrations").select("id,category_id").in("id", explicitIds).is("deleted_at", null) : { data: [], error: null };
  if (registrationsError || (registrations ?? []).some((item) => item.category_id !== values.categoryId) || new Set(explicitIds).size !== (registrations ?? []).length) throw new Error(registrationsError?.message ?? "Todos los equipos seleccionados deben pertenecer a la categoría elegida.");
  const { data: bracket, error: bracketError } = await (supabase.from("playoff_brackets" as never).insert({ tournament_id: values.tournamentId, category_id: values.categoryId, name: values.name, trophy: values.trophy, notes: values.notes || null, created_by: user.id }).select("id,tournament_id,category_id,name,trophy,status").single() as unknown as Promise<{ data: BracketRow | null; error: { message: string } | null }>);
  if (bracketError || !bracket) throw new Error(bracketError?.message ?? "No se pudo crear el cuadro.");
  const payload = values.matches.map((item, index) => ({ bracket_id: bracket.id, stage_name: item.stageName, match_order: index + 1, home_team_registration_id: item.homeTeamRegistrationId, away_team_registration_id: item.awayTeamRegistrationId, home_source_label: item.homeTeamRegistrationId ? null : item.homeSourceLabel || null, away_source_label: item.awayTeamRegistrationId ? null : item.awaySourceLabel || null, is_neutral_venue: item.isNeutralVenue || item.isFinal, is_final: item.isFinal }));
  const { data: created, error: matchesError } = await (supabase.from("playoff_bracket_matches" as never).insert(payload).select("id,bracket_id,stage_name,match_order,home_team_registration_id,away_team_registration_id,home_source_label,away_source_label,home_source_match_id,away_source_match_id,fixture_match_id,winner_team_registration_id,is_neutral_venue,is_final") as unknown as Promise<{ data: BracketMatchRow[] | null; error: { message: string } | null }>);
  if (matchesError || !created) throw new Error(matchesError?.message ?? "No se pudieron guardar los cruces.");
  const sourceOrder = (label: string | null) => Number(label?.match(/ganador(?: del)? cruce\s*(\d+)/i)?.[1] ?? 0);
  const byOrder = new Map(created.map((match) => [match.match_order, match.id]));
  const linked = [] as BracketMatchRow[];
  for (const match of created) {
    const homeSourceMatchId = byOrder.get(sourceOrder(match.home_source_label)); const awaySourceMatchId = byOrder.get(sourceOrder(match.away_source_label));
    if (!homeSourceMatchId && !awaySourceMatchId) { linked.push(match); continue; }
    const { data, error: linkError } = await (supabase.from("playoff_bracket_matches" as never).update({ home_source_match_id: homeSourceMatchId ?? null, away_source_match_id: awaySourceMatchId ?? null }).eq("id", match.id).select("id,bracket_id,stage_name,match_order,home_team_registration_id,away_team_registration_id,home_source_label,away_source_label,home_source_match_id,away_source_match_id,fixture_match_id,winner_team_registration_id,is_neutral_venue,is_final").single() as unknown as Promise<{ data: BracketMatchRow | null; error: { message: string } | null }>);
    if (linkError || !data) throw new Error(linkError?.message ?? "No se pudo vincular la procedencia del cruce.");
    linked.push(data);
  }
  for (const match of linked) await createFixtureIfReady(supabase, bracket, match);
}

export async function advancePlayoffWinner(fixtureMatchId: string, homeScore: number, awayScore: number) {
  if (homeScore === awayScore) return;
  const supabase = await createClient();
  const { data: source, error } = await (supabase.from("playoff_bracket_matches" as never).select("id,bracket_id,stage_name,match_order,home_team_registration_id,away_team_registration_id,home_source_label,away_source_label,home_source_match_id,away_source_match_id,fixture_match_id,winner_team_registration_id,is_neutral_venue,is_final,playoff_brackets(id,tournament_id,category_id,name,trophy,status)").eq("fixture_match_id", fixtureMatchId).maybeSingle() as unknown as Promise<{ data: (BracketMatchRow & { playoff_brackets: BracketRow | BracketRow[] | null }) | null; error: { message: string } | null }>);
  if (error || !source) return;
  const winner = homeScore > awayScore ? source.home_team_registration_id : source.away_team_registration_id;
  if (!winner) return;
  await (supabase.from("playoff_bracket_matches" as never).update({ winner_team_registration_id: winner }).eq("id", source.id) as unknown as Promise<{ error: { message: string } | null }>);
  const bracket = Array.isArray(source.playoff_brackets) ? source.playoff_brackets[0] : source.playoff_brackets;
  if (!bracket) return;
  const { data: targets, error: targetsError } = await (supabase.from("playoff_bracket_matches" as never).select("id,bracket_id,stage_name,match_order,home_team_registration_id,away_team_registration_id,home_source_label,away_source_label,home_source_match_id,away_source_match_id,fixture_match_id,winner_team_registration_id,is_neutral_venue,is_final").eq("bracket_id", source.bracket_id).or(`home_source_match_id.eq.${source.id},away_source_match_id.eq.${source.id}`) as unknown as Promise<{ data: BracketMatchRow[] | null; error: { message: string } | null }>);
  if (targetsError) throw new Error(targetsError.message);
  for (const target of targets ?? []) { const patch = target.home_source_match_id === source.id ? { home_team_registration_id: winner, home_source_label: null } : { away_team_registration_id: winner, away_source_label: null }; const { data: updated, error: updateError } = await (supabase.from("playoff_bracket_matches" as never).update(patch).eq("id", target.id).select("id,bracket_id,stage_name,match_order,home_team_registration_id,away_team_registration_id,home_source_label,away_source_label,home_source_match_id,away_source_match_id,fixture_match_id,winner_team_registration_id,is_neutral_venue,is_final").single() as unknown as Promise<{ data: BracketMatchRow | null; error: { message: string } | null }>); if (updateError || !updated) throw new Error(updateError?.message ?? "No se pudo actualizar el siguiente cruce."); await createFixtureIfReady(supabase, bracket, updated); }
}
