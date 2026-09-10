import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { FixtureMatchValues, ResultValues } from "@/lib/validations/matches";
import type { MatchEventValues } from "@/lib/validations/match-events";

export type FixtureMatch = { id: string; round: number | null; match_date: string | null; kickoff_time: string | null; home_team: string | null; away_team: string | null; field: string | null; referee: string | null; home_score: number | null; away_score: number | null; };
export type Standing = { team_registration_id: string | null; display_name: string | null; competition_phase_id: string | null; competition_group_id: string | null; played: number | null; won: number | null; drawn: number | null; lost: number | null; goals_for: number | null; goals_against: number | null; };
export type FixtureSetup = {
  tournaments: { id: string; name: string }[];
  categories: { id: string; tournamentId: string; name: string }[];
  zones: { id: string; categoryId: string; name: string }[];
  phases: { id: string; name: string }[];
  teams: { id: string; name: string; categoryId: string; zoneId: string; category: string | null; zone: string | null }[];
  fields: { id: string; name: string }[];
  referees: { id: string; name: string }[];
};
export type MatchReport = {
  id: string;
  homeTeamRegistrationId: string;
  awayTeamRegistrationId: string;
  homeTeam: string;
  awayTeam: string;
  players: { id: string; teamRegistrationId: string; name: string; shirtNumber: number }[];
  eventTypes: { id: string; code: string; name: string }[];
  events: { id: string; playerName: string; eventName: string; minute: number; comments: string | null }[];
};

export async function getFixtureSetup(): Promise<FixtureSetup> {
  await requireUser();
  const supabase = await createClient();
  const [tournamentsResult, categoriesResult, zonesResult, phasesResult, teamsResult, fieldsResult, refereesResult] = await Promise.all([
    supabase.from("tournaments").select("id,name").is("deleted_at", null).order("name"),
    supabase.from("categories").select("id,tournament_id,name").is("deleted_at", null).eq("active", true).order("display_order"),
    supabase.from("zones").select("id,category_id,name").is("deleted_at", null).order("display_order"),
    supabase.from("competition_phases").select("id,name").is("deleted_at", null).order("display_order"),
    supabase.from("team_category_registrations").select("id,category_id,zone_id,display_name,categories(name),zones(name),teams(name)").is("deleted_at", null).order("display_name"),
    supabase.from("fields").select("id,name").is("deleted_at", null).eq("active", true).order("name"),
    supabase.from("referees").select("id,first_name,last_name").is("deleted_at", null).eq("active", true).order("last_name"),
  ]);
  for (const result of [tournamentsResult, categoriesResult, zonesResult, phasesResult, teamsResult, fieldsResult, refereesResult]) {
    if (result.error) throw new Error(result.error.message);
  }
  return {
    tournaments: tournamentsResult.data ?? [],
    categories: (categoriesResult.data ?? []).map((category) => ({ id: category.id, tournamentId: category.tournament_id, name: category.name })),
    zones: (zonesResult.data ?? []).map((zone) => ({ id: zone.id, categoryId: zone.category_id, name: zone.name })),
    phases: phasesResult.data ?? [],
    teams: (teamsResult.data ?? []).map((registration) => {
      const category = registration.categories as unknown as { name: string } | { name: string }[] | null;
      const zone = registration.zones as unknown as { name: string } | { name: string }[] | null;
      const team = registration.teams as unknown as { name: string } | { name: string }[] | null;
      const single = (value: typeof category) => Array.isArray(value) ? value[0] : value;
      return { id: registration.id, name: registration.display_name ?? single(team)?.name ?? "Equipo", categoryId: registration.category_id, zoneId: registration.zone_id, category: single(category)?.name ?? null, zone: single(zone)?.name ?? null };
    }),
    fields: fieldsResult.data ?? [],
    referees: (refereesResult.data ?? []).map((referee) => ({ id: referee.id, name: `${referee.first_name} ${referee.last_name}`.trim() })),
  };
}

export async function getFixture(): Promise<FixtureMatch[]> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("vw_fixture").select("id,round,match_date,kickoff_time,home_team,away_team,field,referee,home_score,away_score").order("match_date").order("kickoff_time");
  if (error) throw new Error(error.message);
  return (data ?? []) as FixtureMatch[];
}

export async function getPublicFixture(): Promise<FixtureMatch[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("vw_fixture").select("id,round,match_date,kickoff_time,home_team,away_team,field,referee,home_score,away_score").order("match_date").order("kickoff_time");
  if (error) throw new Error(error.message);
  return (data ?? []) as FixtureMatch[];
}

export async function updateMatchResult({ matchId, homeScore, awayScore }: ResultValues) {
  await requireUser();
  const supabase = await createClient();
  const { data: playedStatus, error: statusError } = await supabase.from("match_statuses").select("id").eq("code", "PLAYED").maybeSingle();
  if (statusError) throw new Error(statusError.message);
  if (!playedStatus) throw new Error("Falta el estado PLAYED para registrar resultados. Ejecutá la migración 20260914_dashboard_results_and_standings.sql en Supabase.");
  const { error } = await supabase
    .from("matches")
    .update({ home_score: homeScore, away_score: awayScore, match_status_id: playedStatus.id })
    .eq("id", matchId);
  if (error) throw new Error(error.message);
}

export async function createFixtureMatch(values: FixtureMatchValues) {
  await requireUser();
  const supabase = await createClient();
  const { data: registrations, error: registrationsError } = await supabase
    .from("team_category_registrations")
    .select("id,category_id,zone_id")
    .in("id", [values.homeTeamRegistrationId, values.awayTeamRegistrationId])
    .is("deleted_at", null);
  if (registrationsError) throw new Error(registrationsError.message);
  if ((registrations ?? []).length !== 2) throw new Error("Uno de los equipos ya no está inscripto.");
  if ((registrations ?? []).some((registration) => registration.category_id !== values.categoryId || registration.zone_id !== values.zoneId)) throw new Error("Los equipos deben pertenecer a la categoría y zona seleccionadas.");

  const { data: status, error: statusError } = await supabase
    .from("match_statuses")
    .select("id")
    .eq("code", "SCHEDULED")
    .maybeSingle();
  if (statusError) throw new Error(statusError.message);
  if (!status) throw new Error("No se encontró el estado SCHEDULED. Revisá el catálogo de estados de partido en Supabase.");

  const { data: existingMatchday, error: matchdayLookupError } = await supabase
    .from("matchdays")
    .select("id")
    .eq("tournament_id", values.tournamentId)
    .eq("category_id", values.categoryId)
    .eq("zone_id", values.zoneId)
    .eq("competition_phase_id", values.phaseId)
    .eq("round", values.round)
    .is("deleted_at", null)
    .order("created_at")
    .limit(1)
    .maybeSingle();
  if (matchdayLookupError) throw new Error(matchdayLookupError.message);

  let matchdayId = existingMatchday?.id;
  if (!matchdayId) {
    const { data: matchday, error: createMatchdayError } = await supabase
      .from("matchdays")
      .insert({ tournament_id: values.tournamentId, category_id: values.categoryId, zone_id: values.zoneId, competition_phase_id: values.phaseId, round: values.round, name: `Fecha ${values.round}`, starts_at: values.matchDate, is_closed: false })
      .select("id")
      .single();
    if (createMatchdayError) throw new Error(createMatchdayError.message);
    matchdayId = matchday.id;
  }

  const { error } = await supabase.from("matches").insert({
    matchday_id: matchdayId,
    competition_phase_id: values.phaseId,
    home_team_registration_id: values.homeTeamRegistrationId,
    away_team_registration_id: values.awayTeamRegistrationId,
    match_status_id: status.id,
    match_date: values.matchDate,
    kickoff_time: values.kickoffTime,
    field_id: values.fieldId,
    referee_id: values.refereeId,
    assistant_referee_1_id: values.assistantReferee1Id,
    assistant_referee_2_id: values.assistantReferee2Id,
    observations: values.observations || null,
  });
  if (error) throw new Error(error.message);
}

export async function getMatchReport(matchId: string): Promise<MatchReport> {
  await requireUser();
  const supabase = await createClient();
  const { data: match, error: matchError } = await supabase.from("matches")
    .select("id,home_team_registration_id,away_team_registration_id,team_category_registrations!matches_home_team_registration_id_fkey(display_name),away:team_category_registrations!matches_away_team_registration_id_fkey(display_name)")
    .eq("id", matchId).is("deleted_at", null).single();
  if (matchError) throw new Error(matchError.message);
  const matchData = match as unknown as { id: string; home_team_registration_id: string; away_team_registration_id: string; team_category_registrations: { display_name: string | null } | null; away: { display_name: string | null } | null };
  const registrationIds = [matchData.home_team_registration_id, matchData.away_team_registration_id];
  const [playersResult, eventTypesResult, eventsResult] = await Promise.all([
    supabase.from("player_team_registrations").select("id,team_registration_id,shirt_number,players(first_name,last_name)").in("team_registration_id", registrationIds).is("deleted_at", null).is("left_at", null).order("shirt_number"),
    supabase.from("event_types").select("id,code,name").order("display_order"),
    supabase.from("match_events").select("id,player_registration_id,event_type_id,minute,comments").eq("match_id", matchId).order("minute"),
  ]);
  for (const result of [playersResult, eventTypesResult, eventsResult]) if (result.error) throw new Error(result.error.message);
  const players = (playersResult.data ?? []).map((row) => {
    const player = row.players as unknown as { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null;
    const item = Array.isArray(player) ? player[0] : player;
    return { id: row.id, teamRegistrationId: row.team_registration_id, name: `${item?.first_name ?? "Jugador"} ${item?.last_name ?? ""}`.trim(), shirtNumber: row.shirt_number };
  });
  const eventTypes = eventTypesResult.data ?? [];
  return { id: matchData.id, homeTeamRegistrationId: matchData.home_team_registration_id, awayTeamRegistrationId: matchData.away_team_registration_id, homeTeam: matchData.team_category_registrations?.display_name ?? "Local", awayTeam: matchData.away?.display_name ?? "Visitante", players, eventTypes, events: (eventsResult.data ?? []).map((event) => ({ id: event.id, playerName: players.find((player) => player.id === event.player_registration_id)?.name ?? "Jugador", eventName: eventTypes.find((type) => type.id === event.event_type_id)?.name ?? "Evento", minute: event.minute ?? 0, comments: event.comments })) };
}

export async function createMatchEvent(values: MatchEventValues) {
  await requireUser();
  const supabase = await createClient();
  const { data: match, error: matchError } = await supabase.from("matches").select("home_team_registration_id,away_team_registration_id").eq("id", values.matchId).is("deleted_at", null).single();
  if (matchError) throw new Error(matchError.message);
  const { data: player, error: playerError } = await supabase.from("player_team_registrations").select("team_registration_id").eq("id", values.playerRegistrationId).is("deleted_at", null).is("left_at", null).single();
  if (playerError) throw new Error(playerError.message);
  if (![match.home_team_registration_id, match.away_team_registration_id].includes(player.team_registration_id)) throw new Error("El jugador no forma parte de este partido.");
  const { error } = await supabase.from("match_events").insert({ match_id: values.matchId, player_registration_id: values.playerRegistrationId, team_registration_id: player.team_registration_id, event_type_id: values.eventTypeId, minute: values.minute, comments: values.comments || null });
  if (error) throw new Error(error.message);
}

export async function getTopScorers(): Promise<{ id: string; first_name: string | null; last_name: string | null; goals: number | null }[]> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("vw_top_scorers").select("id,first_name,last_name,goals").order("goals", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getSuspensions(): Promise<{ first_name: string | null; last_name: string | null; yellow_cards: number | null; red_cards: number | null; automatic_suspensions: number | null; manual_suspensions: number | null; }[]> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("vw_player_suspensions").select("first_name,last_name,yellow_cards,red_cards,automatic_suspensions,manual_suspensions");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getStandings(): Promise<Standing[]> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("vw_standings").select("team_registration_id,display_name,competition_phase_id,competition_group_id,played,won,drawn,lost,goals_for,goals_against");
  if (error) throw new Error(error.message);
  return ((data ?? []) as Standing[]).sort((a, b) => points(b) - points(a) || goalDifference(b) - goalDifference(a) || (b.goals_for ?? 0) - (a.goals_for ?? 0));
}

export async function getPublicStandings(): Promise<Standing[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("vw_standings").select("team_registration_id,display_name,competition_phase_id,competition_group_id,played,won,drawn,lost,goals_for,goals_against");
  if (error) throw new Error(error.message);
  return ((data ?? []) as Standing[]).sort((a, b) => points(b) - points(a) || goalDifference(b) - goalDifference(a) || (b.goals_for ?? 0) - (a.goals_for ?? 0));
}

export const points = (standing: Standing) => (standing.won ?? 0) * 3 + (standing.drawn ?? 0);
export const goalDifference = (standing: Standing) => (standing.goals_for ?? 0) - (standing.goals_against ?? 0);

export type Payment = { id: string; amount: number; payment_date: string | null; due_date: string | null; receipt_number: string | null; observations: string | null; team_category_registrations: { display_name: string | null }[]; payment_types: { name: string }[]; payment_statuses: { name: string; code: string }[]; };

export async function getPayments(): Promise<Payment[]> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("payments").select("id,amount,payment_date,due_date,receipt_number,observations,team_category_registrations(display_name),payment_types(name),payment_statuses(name,code)").is("deleted_at", null).order("due_date");
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Payment[];
}
