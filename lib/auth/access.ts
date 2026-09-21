import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type AppAccess = {
  role: "SUPER_ADMIN" | "TOURNAMENT_ADMIN" | "TEAM_MANAGER" | "REFEREE" | "PLAYER";
  firstName: string;
  lastName: string;
};

const knownRoles = new Set<AppAccess["role"]>(["SUPER_ADMIN", "TOURNAMENT_ADMIN", "TEAM_MANAGER", "REFEREE", "PLAYER"]);

export const getCurrentAccess = cache(async (): Promise<AppAccess> => {
  const user = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("first_name,last_name,roles(code)").eq("id", user.id).maybeSingle();
  if (error) throw new Error(error.message);
  const roleValue = data?.roles as unknown as { code?: string } | { code?: string }[] | null;
  const roleCode = Array.isArray(roleValue) ? roleValue[0]?.code : roleValue?.code;
  return {
    role: roleCode && knownRoles.has(roleCode as AppAccess["role"]) ? roleCode as AppAccess["role"] : "PLAYER",
    firstName: data?.first_name?.trim() || "Usuario",
    lastName: data?.last_name?.trim() || "",
  };
});

export function canManageCompetition(role: AppAccess["role"]) {
  return role === "SUPER_ADMIN" || role === "TOURNAMENT_ADMIN" || role === "TEAM_MANAGER";
}

export async function requireRoleAccess(allowedRoles: AppAccess["role"][]) {
  const access = await getCurrentAccess();
  if (!allowedRoles.includes(access.role)) redirect("/dashboard");
  return access;
}
