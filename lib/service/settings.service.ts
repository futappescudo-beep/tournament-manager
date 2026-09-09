import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { CategoryValues, TournamentValues, ZoneValues } from "@/lib/validations/settings";
import type { ProfileRoleValues } from "@/lib/validations/settings";
import type { DeleteProfileValues } from "@/lib/validations/settings";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export type TournamentOption = { id: string; name: string; season: string | null; description: string | null };
export type CategorySetup = { id: string; tournament_id: string; name: string; zones: { id: string; name: string; max_teams: number | null }[] };
export type RoleOption = { code: string; name: string };
export type ProfileOption = { id: string; first_name: string; last_name: string; role_code: string };

async function requireSuperAdmin() {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_super_admin" as never);
  if (error || !data) redirect("/dashboard");
  return supabase;
}

export async function getTournamentSetup(): Promise<{ tournaments: TournamentOption[]; categories: CategorySetup[]; roles: RoleOption[]; profiles: ProfileOption[] }> {
  const supabase = await requireSuperAdmin();
  const [tournamentsResult, categoriesResult, zonesResult, rolesResult, profilesResult] = await Promise.all([
    supabase.from("tournaments").select("id,name,season,description").is("deleted_at", null).order("created_at"),
    supabase.from("categories").select("id,tournament_id,name").is("deleted_at", null).order("display_order"),
    supabase.from("zones").select("id,category_id,name,max_teams").is("deleted_at", null).order("display_order"),
    supabase.from("roles").select("code,name").order("display_order"),
    supabase.from("profiles").select("id,first_name,last_name,roles(code)").eq("active", true).order("first_name"),
  ]);
  if (tournamentsResult.error) throw new Error(tournamentsResult.error.message);
  if (categoriesResult.error) throw new Error(categoriesResult.error.message);
  if (zonesResult.error) throw new Error(zonesResult.error.message);
  if (rolesResult.error) throw new Error(rolesResult.error.message);
  if (profilesResult.error) throw new Error(profilesResult.error.message);
  const profiles = (profilesResult.data ?? []).map((profile) => {
    const roles = profile.roles as unknown as { code: string }[] | { code: string } | null;
    return { id: profile.id, first_name: profile.first_name, last_name: profile.last_name, role_code: Array.isArray(roles) ? roles[0]?.code ?? "PLAYER" : roles?.code ?? "PLAYER" };
  });
  return { tournaments: tournamentsResult.data ?? [], categories: (categoriesResult.data ?? []).map((category) => ({ ...category, zones: (zonesResult.data ?? []).filter((zone) => zone.category_id === category.id).map((zone) => ({ id: zone.id, name: zone.name, max_teams: zone.max_teams })) })), roles: (rolesResult.data ?? []) as RoleOption[], profiles };
}

export async function assignProfileRole({ userId, roleCode }: ProfileRoleValues) {
  const supabase = await requireSuperAdmin();
  const { error } = await supabase.rpc("assign_profile_role" as never, { target_user_id: userId, new_role_code: roleCode } as never);
  if (error) throw new Error(error.message);
}

export async function deleteProfile({ userId }: DeleteProfileValues) {
  const currentUser = await requireUser();
  await requireSuperAdmin();
  if (currentUser.id === userId) throw new Error("No podés eliminar tu propia cuenta.");
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Falta configurar la clave administrativa de Supabase en el servidor.");
  const { error } = await createAdminClient().auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);
}

export async function createTournament(values: TournamentValues) {
  const supabase = await requireSuperAdmin();
  const { data, error } = await supabase.from("tournaments").insert({ name: values.name, season: values.season || null, description: values.description || null }).select("id,name,season,description").single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateTournament(id: string, values: TournamentValues) {
  const supabase = await requireSuperAdmin();
  const { data, error } = await supabase.from("tournaments").update({ name: values.name, season: values.season || null, description: values.description || null }).eq("id", id).is("deleted_at", null).select("id,name,season,description").single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteTournament(id: string) {
  const supabase = await requireSuperAdmin();
  const { error } = await supabase.from("tournaments").update({ deleted_at: new Date().toISOString() }).eq("id", id).is("deleted_at", null);
  if (error) throw new Error(error.message);
}

export async function createCategory(values: CategoryValues) {
  const supabase = await requireSuperAdmin();
  const { data: last } = await supabase.from("categories").select("display_order").eq("tournament_id", values.tournament_id).order("display_order", { ascending: false }).limit(1).maybeSingle();
  const { data, error } = await supabase.from("categories").insert({ tournament_id: values.tournament_id, name: values.name, display_order: (last?.display_order ?? 0) + 1 }).select("id,tournament_id,name").single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createZone(values: ZoneValues) {
  const supabase = await requireSuperAdmin();
  const { data: last } = await supabase.from("zones").select("display_order").eq("category_id", values.category_id).order("display_order", { ascending: false }).limit(1).maybeSingle();
  const { data, error } = await supabase.from("zones").insert({ category_id: values.category_id, name: values.name, max_teams: values.max_teams, display_order: (last?.display_order ?? 0) + 1 }).select("id,category_id,name,max_teams").single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateZoneCapacity(zoneId: string, maxTeams: number | null) {
  const supabase = await requireSuperAdmin();
  const { error } = await supabase.from("zones").update({ max_teams: maxTeams }).eq("id", zoneId).is("deleted_at", null);
  if (error) throw new Error(error.message);
}
