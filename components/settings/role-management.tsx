"use client";

import { useState } from "react";
import { ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteProfile, updateProfileRole } from "@/lib/actions/settings";
import type { ProfileOption, RoleOption } from "@/lib/service/settings.service";

export function RoleManagement({ profiles: initialProfiles, roles }: { profiles: ProfileOption[]; roles: RoleOption[] }) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [saving, setSaving] = useState<string | null>(null);

  async function changeRole(userId: string, roleCode: string) {
    setSaving(userId);
    try {
      await updateProfileRole({ userId, roleCode: roleCode as "SUPER_ADMIN" | "TOURNAMENT_ADMIN" | "TEAM_MANAGER" | "REFEREE" | "PLAYER" });
      setProfiles((current) => current.map((profile) => profile.id === userId ? { ...profile, role_code: roleCode } : profile));
      toast.success("Rol actualizado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar el rol.");
    } finally {
      setSaving(null);
    }
  }

  async function removeProfile(profile: ProfileOption) {
    if (!window.confirm(`¿Eliminar de forma permanente la cuenta de ${profile.first_name} ${profile.last_name}? Esta acción no se puede deshacer.`)) return;
    setSaving(profile.id);
    try {
      await deleteProfile({ userId: profile.id });
      setProfiles((current) => current.filter((item) => item.id !== profile.id));
      toast.success("Usuario eliminado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar el usuario.");
    } finally {
      setSaving(null);
    }
  }

  return <section className="ea-panel overflow-hidden rounded-lg"><div className="flex items-start gap-3 border-b border-[var(--ea-border)] p-5"><ShieldCheck className="mt-0.5 text-[var(--ea-gold)]" /><div><h2 className="ea-heading text-xl">Accesos y roles</h2><p className="mt-1 text-sm text-stone-400">Las cuentas nuevas ingresan como Jugador. Solo un super administrador puede cambiar estos permisos.</p></div></div>{roles.length <= 1 && <p className="m-5 rounded border border-amber-500/40 bg-amber-950/30 p-3 text-sm text-amber-200">Solo existe el rol Jugador. Ejecutá la migración <code>20260907_seed_standard_roles.sql</code> en Supabase para habilitar los demás roles.</p>}{profiles.length ? <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-sm"><thead className="border-b border-[var(--ea-border)] text-left text-xs uppercase tracking-wider text-stone-500"><tr><th className="p-4">Usuario</th><th>Rol actual</th><th className="p-4">Asignar rol</th><th className="p-4 text-right">Acción</th></tr></thead><tbody>{profiles.map((profile) => <tr key={profile.id} className="border-b border-[var(--ea-border)]/70"><td className="p-4 font-semibold">{profile.first_name} {profile.last_name}</td><td className="text-stone-400">{roles.find((role) => role.code === profile.role_code)?.name ?? profile.role_code}</td><td className="p-4"><select aria-label={`Rol para ${profile.first_name} ${profile.last_name}`} value={profile.role_code} disabled={saving === profile.id} onChange={(event) => changeRole(profile.id, event.target.value)}>{roles.map((role) => <option key={role.code} value={role.code}>{role.name}</option>)}</select></td><td className="p-4 text-right"><button type="button" aria-label={`Eliminar ${profile.first_name} ${profile.last_name}`} disabled={saving === profile.id} onClick={() => removeProfile(profile)} className="inline-flex items-center gap-2 rounded-md border border-red-900/70 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-950/40 disabled:opacity-50"><Trash2 size={15} />Eliminar</button></td></tr>)}</tbody></table></div> : <p className="p-5 text-sm text-stone-500">Todavía no hay usuarios registrados.</p>}</section>;
}
