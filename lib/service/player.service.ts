import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { PlayerFormValues } from "@/lib/validations/players";
import type { Player, TeamRegistrationOption } from "@/lib/types/player";
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

  const assignments = new Map<string, Player["current_assignment"]>();
  for (const row of (assignmentsResult.data ?? []) as unknown as Array<Record<string, unknown>>) {
    const registration = row.team_category_registrations as { display_name?: string | null; teams?: { name?: string | null } | null; categories?: { name?: string | null } | null; zones?: { name?: string | null } | null } | null;
    const label = registration?.display_name || [registration?.teams?.name, registration?.categories?.name, registration?.zones?.name].filter(Boolean).join(" · ") || "Equipo asignado";
    assignments.set(row.player_id as string, { id: row.id as string, team_registration_id: row.team_registration_id as string, shirt_number: row.shirt_number as number, is_captain: Boolean(row.is_captain), is_goalkeeper: Boolean(row.is_goalkeeper), label });
  }
  return (playersResult.data ?? []).map((player) => ({ ...player, current_assignment: assignments.get(player.id) ?? null })) as Player[];
}

export async function getTeamRegistrationOptions(): Promise<TeamRegistrationOption[]> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("team_category_registrations").select("id, display_name, teams(name), categories(name), zones(name)").is("deleted_at", null).order("created_at");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => {
    const item = row as unknown as { id: string; display_name: string | null; teams: { name: string | null } | null; categories: { name: string | null } | null; zones: { name: string | null } | null };
    return { id: item.id, label: item.display_name || [item.teams?.name, item.categories?.name, item.zones?.name].filter(Boolean).join(" · ") || "Equipo sin nombre" };
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
  const now = new Date().toISOString();
  const { error: closeError } = await supabase.from("player_team_registrations").update({ left_at: now.slice(0, 10), deleted_at: now }).eq("player_id", values.player_id).is("deleted_at", null).is("left_at", null);
  if (closeError) throw new Error(closeError.message);
  const { error } = await supabase.from("player_team_registrations").insert({ ...values, joined_at: now.slice(0, 10) });
  if (error) throw new Error(error.message);
}
