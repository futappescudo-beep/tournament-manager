import { createClient } from "@/lib/supabase/server";

export async function getTeamOptions(tournamentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, zones (id, name)")
    .eq("tournament_id", tournamentId)
    .eq("active", true)
    .is("deleted_at", null)
    .order("display_order");
  if (error) throw new Error(error.message);
  return data ?? [];
}
