import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import type { TeamFormValues, TeamRegistration } from "@/lib/validations/teams";

function registrationKey(registration: TeamRegistration) {
  return `${registration.category_id}:${registration.zone_id}`;
}

function registrationRows(teamId: string, registrations: TeamRegistration[]) {
  return registrations.map((registration) => ({
    team_id: teamId,
    category_id: registration.category_id,
    zone_id: registration.zone_id,
  }));
}

function teamPayload(values: TeamFormValues) {
  return {
    name: values.name,
    short_name: values.short_name || null,
    contact_name: values.contact_name || null,
    email: values.email || null,
    phone: values.phone || null,
    logo_url: values.logo_url || null,
    notes: values.notes || null,
    active: values.active,
  };
}

async function assertZoneCapacity(registrations: TeamRegistration[]) {
  if (!registrations.length) return;
  const supabase = await createClient();
  for (const registration of registrations) {
    const { data: zones, error: zoneError } = await supabase.from("zones").select("name,max_teams").eq("id", registration.zone_id).is("deleted_at", null).limit(1);
    if (zoneError) throw new Error(zoneError.message);
    const zone = zones?.[0];
    if (!zone) throw new Error("La zona seleccionada ya no está disponible. Actualizá la página e intentá nuevamente.");
    if (zone.max_teams === null) continue;
    const { count, error: countError } = await supabase.from("team_category_registrations").select("id", { count: "exact", head: true }).eq("zone_id", registration.zone_id).is("deleted_at", null);
    if (countError) throw new Error(countError.message);
    if ((count ?? 0) >= zone.max_teams) throw new Error(`La ${zone.name} alcanzó su cupo de ${zone.max_teams} equipos.`);
  }
}

export async function getTeams() {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .select(`id, name, short_name, logo_url, contact_name, phone, email, notes, active, created_at, updated_at,
      team_category_registrations (id, category_id, zone_id, registration_status_id, categories (id, name), zones (id, name))`)
    .is("deleted_at", null)
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createTeam(values: TeamFormValues) {
  await requireUser();
  await assertZoneCapacity(values.registrations);
  const supabase = await createClient();
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .insert(teamPayload(values))
    .select("id")
    .single();
  if (teamError) throw new Error(teamError.message);

  const { error: registrationError } = await supabase
    .from("team_category_registrations")
    .insert(registrationRows(team.id, values.registrations));
  if (registrationError) {
    await supabase.from("teams").update({ deleted_at: new Date().toISOString() }).eq("id", team.id);
    throw new Error(registrationError.message);
  }
  return team;
}

export async function updateTeam(id: string, values: TeamFormValues) {
  await requireUser();
  const supabase = await createClient();
  const { error: teamError } = await supabase.from("teams").update(teamPayload(values)).eq("id", id).is("deleted_at", null);
  if (teamError) throw new Error(teamError.message);

  const { data: current, error: currentError } = await supabase
    .from("team_category_registrations")
    .select("id, category_id, zone_id")
    .eq("team_id", id)
    .is("deleted_at", null);
  if (currentError) throw new Error(currentError.message);

  const desired = new Set(values.registrations.map(registrationKey));
  const removals = (current ?? []).filter((registration) => !desired.has(`${registration.category_id}:${registration.zone_id}`));
  if (removals.length) {
    const { error } = await supabase.from("team_category_registrations").update({ deleted_at: new Date().toISOString() }).in("id", removals.map((registration) => registration.id));
    if (error) throw new Error(error.message);
  }
  const existing = new Set((current ?? []).map((registration) => `${registration.category_id}:${registration.zone_id}`));
  const additions = values.registrations.filter((registration) => !existing.has(registrationKey(registration)));
  if (additions.length) {
    await assertZoneCapacity(additions);
    const { error } = await supabase.from("team_category_registrations").insert(registrationRows(id, additions));
    if (error) throw new Error(error.message);
  }
}

export async function deleteTeam(id: string) {
  await requireUser();
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data: registrations, error: registrationsError } = await supabase.from("team_category_registrations").select("id").eq("team_id", id).is("deleted_at", null);
  if (registrationsError) throw new Error(registrationsError.message);
  const registrationIds = (registrations ?? []).map((registration) => registration.id);
  if (registrationIds.length) {
    const { error: playerRegistrationsError } = await supabase.from("player_team_registrations").update({ left_at: now.slice(0, 10), deleted_at: now }).in("team_registration_id", registrationIds).is("deleted_at", null);
    if (playerRegistrationsError) throw new Error(playerRegistrationsError.message);
    const { error: teamRegistrationsError } = await supabase.from("team_category_registrations").update({ deleted_at: now }).in("id", registrationIds).is("deleted_at", null);
    if (teamRegistrationsError) throw new Error(teamRegistrationsError.message);
  }
  const { error } = await supabase.from("teams").update({ deleted_at: now, active: false }).eq("id", id).is("deleted_at", null);
  if (error) throw new Error(error.message);
}

export async function getTeamRoster(teamId: string) {
  await requireUser();
  const supabase = await createClient();
  const { data: team, error: teamError } = await supabase.from("teams").select("id,name,logo_url").eq("id", teamId).is("deleted_at", null).single();
  if (teamError) throw new Error(teamError.message);
  const { data: registrations, error: registrationsError } = await supabase.from("team_category_registrations").select("id,display_name,categories(name),zones(name)").eq("team_id", teamId).is("deleted_at", null);
  if (registrationsError) throw new Error(registrationsError.message);
  const registrationIds = (registrations ?? []).map((registration) => registration.id);
  const [allPlayersResult, activeAssignmentsResult] = await Promise.all([
    supabase.from("players").select("id,first_name,last_name,document_number,document_type,birth_date,photo_url").is("deleted_at", null).order("last_name"),
    supabase.from("player_team_registrations").select("player_id,team_category_registrations(team_id)").is("deleted_at", null).is("left_at", null),
  ]);
  if (allPlayersResult.error) throw new Error(allPlayersResult.error.message);
  if (activeAssignmentsResult.error) throw new Error(activeAssignmentsResult.error.message);
  const assignedToOtherTeam = new Set((activeAssignmentsResult.data ?? []).flatMap((assignment) => {
    const registration = assignment.team_category_registrations as unknown as { team_id: string } | { team_id: string }[] | null;
    const assignedTeamId = Array.isArray(registration) ? registration[0]?.team_id : registration?.team_id;
    return assignedTeamId && assignedTeamId !== teamId ? [assignment.player_id] : [];
  }));
  const availablePlayers = (allPlayersResult.data ?? []).filter((player) => !assignedToOtherTeam.has(player.id));
  if (!registrationIds.length) return { team, registrations: [] as Array<{ id: string; label: string }>, players: [] as Array<Record<string, unknown>>, availablePlayers };
  const { data: players, error: playersError } = await supabase.from("player_team_registrations").select("id,shirt_number,is_captain,is_goalkeeper,team_registration_id,players(first_name,last_name,document_number,photo_url)").in("team_registration_id", registrationIds).is("deleted_at", null).is("left_at", null).order("shirt_number");
  if (playersError) throw new Error(playersError.message);
  return {
    team,
    registrations: (registrations ?? []).map((registration) => {
      const category = Array.isArray(registration.categories) ? registration.categories[0] : registration.categories;
      const zone = Array.isArray(registration.zones) ? registration.zones[0] : registration.zones;
      return { id: registration.id, label: [category?.name, zone?.name].filter(Boolean).join(" · ") || "Zona sin nombre" };
    }),
    players: players ?? [],
    availablePlayers,
  };
}
