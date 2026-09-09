import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { PlayerFormValues } from "@/lib/validations/players";
import type { Player, PlayerAssignment, TeamRegistrationOption } from "@/lib/types/player";
import type { PlayerAssignmentValues } from "@/lib/validations/players";

function playerPayload(values: PlayerFormValues) {
  return { ...values, birth_date: values.birth_date || null, photo_url: values.photo_url || null };
}

export async function getPlayers() {
  await requireUser();
  const supabase = await createClient();
  const [playersResult, assignmentsResult] = await Promise.all([
    supabase.from("players").select("id, document_type, document_number, first_name, last_name, birth_date, photo_url").is("deleted_at", null).order("last_name"),
    supabase.from("player_team_registrations").select("id, player_id, team_registration_id, shirt_number, is_captain, is_goalkeeper, team_category_registrations(display_name, teams(name), categories(name), zones(name))").is("deleted_at", null).is("left_at", null),
  ]);
  if (playersResult.error) throw new Error(playersResult.error.message);
  if (assignmentsResult.error) throw new Error(assignmentsResult.error.message);

  const assignments = new Map<string, PlayerAssignment[]>();
  for (const row of (assignmentsResult.data ?? []) as unknown as Array<Record<string, unknown>>) {
    const registration = row.team_category_registrations as { display_name?: string | null; teams?: { name?: string | null } | null; categories?: { name?: string | null } | null; zones?: { name?: string | null } | null } | null;
    const label = registration?.display_name || [registration?.teams?.name, registration?.categories?.name, registration?.zones?.name].filter(Boolean).join(" · ") || "Equipo asignado";
    const playerAssignments = assignments.get(row.player_id as string) ?? [];
    playerAssignments.push({ id: row.id as string, team_registration_id: row.team_registration_id as string, shirt_number: row.shirt_number as number, is_captain: Boolean(row.is_captain), is_goalkeeper: Boolean(row.is_goalkeeper), label });
    assignments.set(row.player_id as string, playerAssignments);
  }
  return (playersResult.data ?? []).map((player) => ({ ...player, assignments: assignments.get(player.id) ?? [] })) as Player[];
}

export async function getTeamRegistrationOptions(): Promise<TeamRegistrationOption[]> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("team_category_registrations")
    .select("id,team_id,teams!inner(name,active,deleted_at),categories(name),zones(name)")
    .is("deleted_at", null)
    .is("teams.deleted_at", null)
    .eq("teams.active", true)
    .order("created_at");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => {
    const item = row as unknown as { id: string; team_id: string; teams: { name: string | null } | { name: string | null }[] | null; categories: { name: string | null } | { name: string | null }[] | null; zones: { name: string | null } | { name: string | null }[] | null };
    const team = Array.isArray(item.teams) ? item.teams[0] : item.teams;
    const category = Array.isArray(item.categories) ? item.categories[0] : item.categories;
    const zone = Array.isArray(item.zones) ? item.zones[0] : item.zones;
    const teamName = team?.name ?? "Equipo sin nombre";
    const zoneName = [category?.name, zone?.name].filter(Boolean).join(" · ") || "Zona sin nombre";
    return { id: item.id, team_id: item.team_id, team_name: teamName, zone_name: zoneName, label: `${teamName} · ${zoneName}` };
  });
}

export async function createPlayer(values: PlayerFormValues) {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("players").insert(playerPayload(values)).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updatePlayer(id: string, values: PlayerFormValues) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("players").update(playerPayload(values)).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deletePlayer(id: string) {
  await requireUser();
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { error: registrationsError } = await supabase.from("player_team_registrations").update({ left_at: now.slice(0, 10), deleted_at: now }).eq("player_id", id).is("deleted_at", null);
  if (registrationsError) throw new Error(registrationsError.message);
  const { error } = await supabase.from("players").update({ deleted_at: now }).eq("id", id).is("deleted_at", null);
  if (error) throw new Error(error.message);
}

export async function assignPlayerToTeam(values: PlayerAssignmentValues) {
  await requireUser();
  const supabase = await createClient();
  const { data: activeRegistrations, error: registrationsError } = await supabase
    .from("team_category_registrations")
    .select("id,team_id,teams!inner(active,deleted_at)")
    .is("deleted_at", null)
    .is("teams.deleted_at", null)
    .eq("teams.active", true);
  if (registrationsError) throw new Error(registrationsError.message);
  const registrationsById = new Map((activeRegistrations ?? []).map((registration) => [registration.id, registration]));
  const targetRegistration = registrationsById.get(values.team_registration_id);
  if (!targetRegistration) throw new Error("El equipo seleccionado ya no está activo. Actualizá la página y elegí otro equipo.");
  const activeRegistrationIds = [...registrationsById.keys()];
  const { data: activeAssignments, error: activeError } = activeRegistrationIds.length
    ? await supabase.from("player_team_registrations").select("id,team_registration_id").eq("player_id", values.player_id).is("deleted_at", null).is("left_at", null).in("team_registration_id", activeRegistrationIds)
    : { data: [], error: null };
  if (activeError) throw new Error(activeError.message);
  const existing = (activeAssignments ?? []).find((assignment) => assignment.team_registration_id === values.team_registration_id);
  const belongsToOtherTeam = (activeAssignments ?? []).some((assignment) => {
    const teamId = registrationsById.get(assignment.team_registration_id)?.team_id;
    return teamId && teamId !== targetRegistration.team_id;
  });
  if (belongsToOtherTeam) throw new Error("Un jugador no puede estar activo en equipos distintos dentro del mismo torneo.");
  const payload = { shirt_number: values.shirt_number, is_captain: values.is_captain, is_goalkeeper: values.is_goalkeeper };
  if (existing) {
    const { error } = await supabase.from("player_team_registrations").update(payload).eq("id", existing.id);
    if (error) throw new Error(error.message);
    return;
  }
  const { error } = await supabase.from("player_team_registrations").insert({ ...values, ...payload, joined_at: new Date().toISOString().slice(0, 10) });
  if (error) throw new Error(error.message);
}
