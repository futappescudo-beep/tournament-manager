import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { FixtureMatchValues, FixtureScheduleValues, RegularFixtureGeneratorValues, ResultValues } from "@/lib/validations/matches";
import type { MatchEventValues } from "@/lib/validations/match-events";
import type { MatchSheetConfirmationValues, MatchSheetEntryValues, MatchSheetStatusValues } from "@/lib/validations/match-events";
import { advancePlayoffWinner } from "@/lib/service/playoffs.service";

export type FixtureMatch = { id: string; round: number | null; match_date: string | null; kickoff_time: string | null; home_team: string | null; away_team: string | null; field: string | null; referee: string | null; home_score: number | null; away_score: number | null; tournamentId?: string | null; categoryId?: string | null; zoneId?: string | null; phaseId?: string | null; phaseName?: string | null; fieldId?: string | null; refereeId?: string | null; assistantReferee1Id?: string | null; assistantReferee2Id?: string | null; sheetStatus?: "DRAFT" | "OPEN" | "CLOSED" | null; };
export type Standing = { team_registration_id: string | null; display_name: string | null; competition_phase_id: string | null; competition_group_id: string | null; played: number | null; won: number | null; drawn: number | null; lost: number | null; goals_for: number | null; goals_against: number | null; };
export type FixtureSetup = {
  tournaments: { id: string; name: string }[];
  categories: { id: string; tournamentId: string; name: string }[];
  zones: { id: string; categoryId: string; name: string }[];
  phases: { id: string; name: string; isElimination: boolean }[];
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
  sheetEntries: { playerRegistrationId: string; shirtNumber: number | null; isPresent: boolean; notes: string | null }[];
  confirmations: { confirmationType: "REFEREE" | "HOME_DELEGATE" | "AWAY_DELEGATE"; confirmedAt: string }[];
  sheetStatus: "DRAFT" | "OPEN" | "CLOSED" | null;
};

export async function getFixtureSetup(): Promise<FixtureSetup> {
  await requireUser();
  const supabase = await createClient();
  const [tournamentsResult, categoriesResult, zonesResult, phasesResult, teamsResult, fieldsResult, refereesResult] = await Promise.all([
    supabase.from("tournaments").select("id,name").is("deleted_at", null).is("archived_at", null).order("name"),
    supabase.from("categories").select("id,tournament_id,name").is("deleted_at", null).eq("active", true).order("display_order"),
    supabase.from("zones").select("id,category_id,name").is("deleted_at", null).order("display_order"),
    supabase.from("competition_phases").select("id,name,is_elimination").is("deleted_at", null).order("display_order"),
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
    phases: (phasesResult.data ?? []).map((phase) => ({ id: phase.id, name: phase.name, isElimination: phase.is_elimination })),
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

export async function getFixturePhases() {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("competition_phases").select("id,name").is("deleted_at", null).order("display_order");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function canManageFixture() {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase.rpc("is_tournament_administrator" as never);
  return Boolean(data);
}

export async function getFixture(): Promise<FixtureMatch[]> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("vw_fixture").select("id,round,match_date,kickoff_time,home_team,away_team,field,referee,home_score,away_score").order("match_date").order("kickoff_time");
  if (error) throw new Error(error.message);
  const matches = (data ?? []) as FixtureMatch[];
  const [controlsResult, schedulingResult] = await Promise.all([
    supabase.from("match_sheet_controls" as never).select("match_id,status") as unknown as Promise<{ data: { match_id: string; status: "DRAFT" | "OPEN" | "CLOSED" }[] | null; error: { message: string } | null }>,
    supabase.from("matches").select("id,matchday_id,competition_phase_id,field_id,referee_id,assistant_referee_1_id,assistant_referee_2_id").in("id", matches.map((match) => match.id)),
  ]);
  const { data: controls, error: controlsError } = controlsResult;
  if (schedulingResult.error) throw new Error(schedulingResult.error.message);
  const statuses = new Map((controlsError ? [] : controls ?? []).map((control) => [control.match_id, control.status]));
  const schedules = new Map((schedulingResult.data ?? []).map((match) => [match.id, match]));
  const matchdayIds = [...new Set((schedulingResult.data ?? []).map((match) => match.matchday_id))];
  const phaseIds = [...new Set((schedulingResult.data ?? []).map((match) => match.competition_phase_id))];
  const [matchdaysResult, phasesResult] = await Promise.all([
    supabase.from("matchdays").select("id,tournament_id,category_id,zone_id").in("id", matchdayIds),
    supabase.from("competition_phases").select("id,name").in("id", phaseIds),
  ]);
  if (matchdaysResult.error || phasesResult.error) throw new Error(matchdaysResult.error?.message ?? phasesResult.error?.message ?? "No se pudo cargar el alcance del fixture.");
  const matchdays = new Map((matchdaysResult.data ?? []).map((matchday) => [matchday.id, matchday]));
  const phases = new Map((phasesResult.data ?? []).map((phase) => [phase.id, phase.name]));
  return matches.map((match) => { const schedule = schedules.get(match.id); const matchday = schedule ? matchdays.get(schedule.matchday_id) : null; return { ...match, tournamentId: matchday?.tournament_id ?? null, categoryId: matchday?.category_id ?? null, zoneId: matchday?.zone_id ?? null, phaseId: schedule?.competition_phase_id ?? null, phaseName: schedule?.competition_phase_id ? phases.get(schedule.competition_phase_id) ?? null : null, fieldId: schedule?.field_id ?? null, refereeId: schedule?.referee_id ?? null, assistantReferee1Id: schedule?.assistant_referee_1_id ?? null, assistantReferee2Id: schedule?.assistant_referee_2_id ?? null, sheetStatus: statuses.get(match.id) ?? null }; });
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
  const { data: sheet, error: sheetError } = await (supabase.from("match_sheet_controls" as never).select("status").eq("match_id", matchId).maybeSingle() as unknown as Promise<{ data: { status: "DRAFT" | "OPEN" | "CLOSED" } | null; error: { message: string } | null }>);
  if (sheetError) throw new Error(sheetError.message);
  if (sheet?.status === "CLOSED") throw new Error("La planilla está cerrada. Solo un administrador puede reabrirla antes de editar el resultado.");
  const { data: playedStatus, error: statusError } = await supabase.from("match_statuses").select("id").eq("code", "PLAYED").maybeSingle();
  if (statusError) throw new Error(statusError.message);
  if (!playedStatus) throw new Error("Falta el estado PLAYED para registrar resultados. Ejecutá la migración 20260914_dashboard_results_and_standings.sql en Supabase.");
  const { error } = await supabase
    .from("matches")
    .update({ home_score: homeScore, away_score: awayScore, match_status_id: playedStatus.id })
    .eq("id", matchId);
  if (error) throw new Error(error.message);
  await advancePlayoffWinner(matchId, homeScore, awayScore);
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

function roundRobin(registrationIds: string[]) {
  const rotation = [...registrationIds];
  if (rotation.length % 2) rotation.push("BYE");
  const rounds: [string, string][][] = [];
  for (let round = 0; round < rotation.length - 1; round += 1) {
    const pairs: [string, string][] = [];
    for (let index = 0; index < rotation.length / 2; index += 1) {
      const home = rotation[index]; const away = rotation[rotation.length - 1 - index];
      if (home !== "BYE" && away !== "BYE") pairs.push(round % 2 === 0 ? [home, away] : [away, home]);
    }
    rounds.push(pairs);
    rotation.splice(1, 0, rotation.pop()!);
  }
  return rounds;
}

export async function generateRegularFixture(values: RegularFixtureGeneratorValues) {
  await requireUser();
  const supabase = await createClient();
  const [{ data: registrations, error: registrationsError }, { data: status, error: statusError }, { data: phase, error: phaseError }, { data: existingMatchdays, error: matchdaysError }] = await Promise.all([
    supabase.from("team_category_registrations").select("id").eq("category_id", values.categoryId).eq("zone_id", values.zoneId).is("deleted_at", null).order("created_at"),
    supabase.from("match_statuses").select("id").eq("code", "SCHEDULED").maybeSingle(),
    supabase.from("competition_phases").select("id,is_elimination").eq("id", values.phaseId).is("deleted_at", null).maybeSingle(),
    supabase.from("matchdays").select("id,round").eq("tournament_id", values.tournamentId).eq("category_id", values.categoryId).eq("zone_id", values.zoneId).eq("competition_phase_id", values.phaseId).is("deleted_at", null),
  ]);
  if (registrationsError || statusError || phaseError || matchdaysError) throw new Error(registrationsError?.message ?? statusError?.message ?? phaseError?.message ?? matchdaysError?.message ?? "No se pudo preparar el fixture.");
  if (!phase || phase.is_elimination) throw new Error("Seleccioná una fase regular para generar todos contra todos.");
  if ((registrations ?? []).length < 2) throw new Error("La zona necesita al menos dos equipos activos para generar el fixture.");
  if (!status) throw new Error("No se encontró el estado SCHEDULED para programar los partidos.");
  const rounds = roundRobin((registrations ?? []).map((registration) => registration.id));
  const existingMatchdayIds = (existingMatchdays ?? []).map((matchday) => matchday.id);
  const { data: existingMatches, error: existingMatchesError } = existingMatchdayIds.length
    ? await supabase.from("matches").select("matchday_id,home_team_registration_id,away_team_registration_id").in("matchday_id", existingMatchdayIds).is("deleted_at", null)
    : { data: [], error: null };
  if (existingMatchesError) throw new Error(existingMatchesError.message);
  const pairKey = (first: string, second: string) => [first, second].sort().join(":");
  const existingPairs = new Set((existingMatches ?? []).map((match) => pairKey(match.home_team_registration_id, match.away_team_registration_id)));
  const matchdayByRound = new Map((existingMatchdays ?? []).filter((matchday) => matchday.round !== null).map((matchday) => [matchday.round, matchday.id]));
  const missingRounds = rounds.map((_, index) => index + 1).filter((round) => !matchdayByRound.has(round));
  if (missingRounds.length) {
    const matchdaysPayload = missingRounds.map((round) => ({ tournament_id: values.tournamentId, category_id: values.categoryId, zone_id: values.zoneId, competition_phase_id: values.phaseId, round, name: `Fecha ${round}`, starts_at: null, is_closed: false }));
    const { data: createdMatchdays, error: createMatchdaysError } = await supabase.from("matchdays").insert(matchdaysPayload).select("id,round");
    if (createMatchdaysError) throw new Error(createMatchdaysError.message);
    for (const matchday of createdMatchdays ?? []) matchdayByRound.set(matchday.round, matchday.id);
  }
  const matchesPayload = rounds.flatMap((pairs, index) => pairs.filter(([home, away]) => !existingPairs.has(pairKey(home, away))).map(([home, away]) => ({ matchday_id: matchdayByRound.get(index + 1), competition_phase_id: values.phaseId, home_team_registration_id: home, away_team_registration_id: away, match_status_id: status.id, match_date: null, kickoff_time: null })));
  if (!matchesPayload.length) return { rounds: rounds.length, matches: 0, createdRounds: 0 };
  const { error: createMatchesError } = await supabase.from("matches").insert(matchesPayload);
  if (createMatchesError) throw new Error(createMatchesError.message);
  return { rounds: rounds.length, matches: matchesPayload.length, createdRounds: missingRounds.length };
}

export async function scheduleFixtureMatch(values: FixtureScheduleValues) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("matches").update({ match_date: values.matchDate, kickoff_time: values.kickoffTime, field_id: values.fieldId, referee_id: values.refereeId, assistant_referee_1_id: values.assistantReferee1Id, assistant_referee_2_id: values.assistantReferee2Id }).eq("id", values.matchId).is("deleted_at", null);
  if (error) throw new Error(error.message);
}

export async function getMatchReport(matchId: string): Promise<MatchReport> {
  await requireUser();
  const supabase = await createClient();
  const { data: match, error: matchError } = await supabase.from("matches")
    .select("id,home_team_registration_id,away_team_registration_id")
    .eq("id", matchId).is("deleted_at", null).single();
  if (matchError) throw new Error(matchError.message);
  const matchData = match as unknown as { id: string; home_team_registration_id: string; away_team_registration_id: string };
  const registrationIds = [matchData.home_team_registration_id, matchData.away_team_registration_id];
  const [registrationsResult, playersResult, eventTypesResult, eventsResult, entriesResult, confirmationsResult, controlResult] = await Promise.all([
    supabase.from("team_category_registrations").select("id,display_name,team_id").in("id", registrationIds),
    supabase.from("player_team_registrations").select("id,team_registration_id,shirt_number,players(first_name,last_name)").in("team_registration_id", registrationIds).is("deleted_at", null).is("left_at", null).order("shirt_number"),
    supabase.from("event_types").select("id,code,name").order("display_order"),
    supabase.from("match_events").select("id,player_registration_id,event_type_id,minute,comments").eq("match_id", matchId).order("minute"),
    supabase.from("match_sheet_entries" as never).select("player_registration_id,shirt_number,is_present,notes").eq("match_id", matchId) as unknown as Promise<{ data: { player_registration_id: string; shirt_number: number | null; is_present: boolean; notes: string | null }[] | null; error: { message: string } | null }>,
    supabase.from("match_sheet_confirmations" as never).select("confirmation_type,confirmed_at").eq("match_id", matchId) as unknown as Promise<{ data: { confirmation_type: "REFEREE" | "HOME_DELEGATE" | "AWAY_DELEGATE"; confirmed_at: string }[] | null; error: { message: string } | null }>,
    supabase.from("match_sheet_controls" as never).select("status").eq("match_id", matchId).maybeSingle() as unknown as Promise<{ data: { status: "DRAFT" | "OPEN" | "CLOSED" } | null; error: { message: string } | null }>,
  ]);
  for (const result of [registrationsResult, playersResult, eventTypesResult, eventsResult, entriesResult, confirmationsResult, controlResult]) if (result.error) throw new Error(result.error.message);
  const players = (playersResult.data ?? []).map((row) => {
    const player = row.players as unknown as { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null;
    const item = Array.isArray(player) ? player[0] : player;
    return { id: row.id, teamRegistrationId: row.team_registration_id, name: `${item?.first_name ?? "Jugador"} ${item?.last_name ?? ""}`.trim(), shirtNumber: row.shirt_number };
  });
  const eventTypes = eventTypesResult.data ?? [];
  const registrationRows = registrationsResult.data ?? [];
  const { data: teams, error: teamsError } = await supabase.from("teams").select("id,name").in("id", registrationRows.map((registration) => registration.team_id));
  if (teamsError) throw new Error(teamsError.message);
  const teamNames = new Map((teams ?? []).map((team) => [team.id, team.name]));
  const registrations = new Map(registrationRows.map((registration) => [registration.id, registration.display_name ?? teamNames.get(registration.team_id) ?? "Equipo"]));
  return { id: matchData.id, homeTeamRegistrationId: matchData.home_team_registration_id, awayTeamRegistrationId: matchData.away_team_registration_id, homeTeam: registrations.get(matchData.home_team_registration_id) ?? "Local", awayTeam: registrations.get(matchData.away_team_registration_id) ?? "Visitante", players, eventTypes, events: (eventsResult.data ?? []).map((event) => ({ id: event.id, playerName: players.find((player) => player.id === event.player_registration_id)?.name ?? "Jugador", eventName: eventTypes.find((type) => type.id === event.event_type_id)?.name ?? "Evento", minute: event.minute ?? 0, comments: event.comments })), sheetEntries: (entriesResult.data ?? []).map((entry) => ({ playerRegistrationId: entry.player_registration_id, shirtNumber: entry.shirt_number, isPresent: entry.is_present, notes: entry.notes })), confirmations: (confirmationsResult.data ?? []).map((confirmation) => ({ confirmationType: confirmation.confirmation_type, confirmedAt: confirmation.confirmed_at })), sheetStatus: controlResult.data?.status ?? null };
}

export async function setMatchSheetStatus(values: MatchSheetStatusValues) {
  const user = await requireUser(); const supabase = await createClient(); const now = new Date().toISOString();
  if (values.status === "DRAFT") {
    const { error } = await (supabase.from("match_sheet_controls" as never).insert({ match_id: values.matchId, status: "DRAFT", created_by: user.id }) as unknown as Promise<{ error: { message: string } | null }>);
    if (error) throw new Error(error.message); return;
  }
  const patch = values.status === "OPEN" ? { status: "OPEN", opened_by: user.id, opened_at: now, updated_at: now } : { status: "CLOSED", closed_by: user.id, closed_at: now, closing_observations: values.closingObservations || null, updated_at: now };
  const { error } = await (supabase.from("match_sheet_controls" as never).update(patch).eq("match_id", values.matchId) as unknown as Promise<{ error: { message: string } | null }>);
  if (error) throw new Error(error.message);
}

export async function saveMatchSheetEntry(values: MatchSheetEntryValues) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: player, error: playerError } = await supabase.from("player_team_registrations").select("team_registration_id").eq("id", values.playerRegistrationId).is("deleted_at", null).is("left_at", null).single();
  if (playerError) throw new Error(playerError.message);
  if (player.team_registration_id !== values.teamRegistrationId) throw new Error("El jugador no pertenece al equipo seleccionado.");
  const { error } = await (supabase.from("match_sheet_entries" as never).upsert({ match_id: values.matchId, player_registration_id: values.playerRegistrationId, team_registration_id: values.teamRegistrationId, shirt_number: values.shirtNumber, is_present: values.isPresent, notes: values.notes || null, updated_by: user.id, updated_at: new Date().toISOString() }, { onConflict: "match_id,player_registration_id" }) as unknown as Promise<{ error: { message: string } | null }>);
  if (error) throw new Error(error.message);
}

export async function confirmMatchSheet(values: MatchSheetConfirmationValues) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: match, error: matchError } = await supabase.from("matches").select("home_team_registration_id,away_team_registration_id").eq("id", values.matchId).single();
  if (matchError) throw new Error(matchError.message);
  const teamRegistrationId = values.confirmationType === "HOME_DELEGATE" ? match.home_team_registration_id : values.confirmationType === "AWAY_DELEGATE" ? match.away_team_registration_id : null;
  const labels = { REFEREE: "Árbitro", HOME_DELEGATE: "Delegado local", AWAY_DELEGATE: "Delegado visitante" };
  const { error } = await (supabase.from("match_sheet_confirmations" as never).upsert({ match_id: values.matchId, team_registration_id: teamRegistrationId, confirmation_type: values.confirmationType, profile_id: user.id, declaration: `${labels[values.confirmationType]} confirma digitalmente la planilla y los datos registrados.`, confirmed_at: new Date().toISOString() }, { onConflict: "match_id,confirmation_type" }) as unknown as Promise<{ error: { message: string } | null }>);
  if (error) throw new Error(error.message);
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
