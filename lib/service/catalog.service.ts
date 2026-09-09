import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import type { CategoryOption } from "@/lib/types/team";

export async function getCategoriesWithZones(): Promise<CategoryOption[]> {
  await requireUser();
  const supabase = await createClient();
  const [categoriesResult, zonesResult] = await Promise.all([
    supabase.from("categories").select("id, name").eq("active", true).is("deleted_at", null).order("display_order"),
    supabase.from("zones").select("id, category_id, name").is("deleted_at", null).order("display_order"),
  ]);

  if (categoriesResult.error) throw new Error(categoriesResult.error.message);
  if (zonesResult.error) throw new Error(zonesResult.error.message);

  return (categoriesResult.data ?? []).map((category) => ({
    id: category.id,
    name: category.name,
    zones: (zonesResult.data ?? [])
      .filter((zone) => zone.category_id === category.id)
      .map((zone) => ({ id: zone.id, name: zone.name })),
  }));
}
