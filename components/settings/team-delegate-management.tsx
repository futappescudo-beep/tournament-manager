"use client";

import { useState } from "react";
import { ShieldCheck, UserRoundX } from "lucide-react";
import { toast } from "sonner";
import { assignTeamDelegate, removeTeamDelegate } from "@/lib/actions/settings";
import type { ProfileOption, TeamDelegateAssignment, TeamSetup } from "@/lib/service/settings.service";

export function TeamDelegateManagement({ teams, profiles, initialAssignments }: { teams: TeamSetup[]; profiles: ProfileOption[]; initialAssignments: TeamDelegateAssignment[] }) {
  const delegateProfiles = profiles.filter((profile) => profile.role_code === "PLAYER");
  const [assignments, setAssignments] = useState(initialAssignments);
  const [teamId, setTeamId] = useState(teams[0]?.id ?? "");
  const [profileId, setProfileId] = useState(delegateProfiles[0]?.id ?? "");
  const [saving, setSaving] = useState<string | null>(null);
  const assignedTeams = new Set(assignments.map((assignment) => assignment.teamId));

  async function assign() {
    if (!teamId || !profileId) return;
    setSaving("assign");
    try {
      await assignTeamDelegate({ teamId, profileId });
      const team = teams.find((item) => item.id === teamId);
      const profile = delegateProfiles.find((item) => item.id === profileId);
      if (!team || !profile) return;
      setAssignments((current) => [...current.filter((item) => item.teamId !== teamId), { teamId, profileId, teamName: team.name, profileName: `${profile.first_name} ${profile.last_name}`.trim() }].sort((a, b) => a.teamName.localeCompare(b.teamName)));
      toast.success("Delegado asignado al equipo.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo asignar el delegado.");
    } finally {
      setSaving(null);
    }
  }

  async function remove(team: TeamDelegateAssignment) {
    if (!window.confirm(`¿Quitar a ${team.profileName} como delegado de ${team.teamName}?`)) return;
    setSaving(team.teamId);
    try {
      await removeTeamDelegate({ teamId: team.teamId });
      setAssignments((current) => current.filter((item) => item.teamId !== team.teamId));
      toast.success("Delegado quitado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo quitar el delegado.");
    } finally {
      setSaving(null);
    }
  }

  return <section className="ea-panel overflow-hidden rounded-lg"><div className="flex items-start gap-3 border-b border-[var(--ea-border)] p-5"><ShieldCheck className="mt-0.5 text-[var(--ea-gold)]" /><div><h2 className="ea-heading text-xl">Delegados por equipo</h2><p className="mt-1 text-sm text-stone-400">El superadministrador designa un único delegado activo por equipo. Esa persona conserva el rol Jugador y sólo puede confirmar la planilla de sus propios partidos.</p></div></div><div className="grid gap-3 border-b border-[var(--ea-border)] p-5 md:grid-cols-[1fr_1fr_auto]"><label className="grid gap-2 text-sm font-medium">Equipo<select value={teamId} onChange={(event) => setTeamId(event.target.value)} disabled={!teams.length || saving !== null}><option value="">Seleccionar equipo</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}{assignedTeams.has(team.id) ? " · delegado asignado" : ""}</option>)}</select></label><label className="grid gap-2 text-sm font-medium">Usuario delegado<select value={profileId} onChange={(event) => setProfileId(event.target.value)} disabled={!delegateProfiles.length || saving !== null}><option value="">Seleccionar usuario</option>{delegateProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.first_name} {profile.last_name}</option>)}</select></label><button type="button" onClick={assign} disabled={!teamId || !profileId || saving !== null} className="self-end rounded-md bg-[linear-gradient(135deg,#b71920,#77080d)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{saving === "assign" ? "Asignando..." : "Asignar delegado"}</button></div>{!delegateProfiles.length && <p className="mx-5 mt-5 rounded border border-amber-700/50 bg-amber-950/30 p-3 text-sm text-amber-100">No hay usuarios con rol Jugador disponibles para designar como delegados.</p>}{assignments.length ? <div className="overflow-x-auto"><table className="w-full min-w-[540px] text-sm"><thead className="border-b border-[var(--ea-border)] text-left text-xs uppercase tracking-wider text-stone-500"><tr><th className="p-4">Equipo</th><th className="p-4">Delegado activo</th><th className="p-4 text-right">Acción</th></tr></thead><tbody>{assignments.map((assignment) => <tr key={assignment.teamId} className="border-b border-[var(--ea-border)]/70"><td className="p-4 font-semibold">{assignment.teamName}</td><td className="p-4 text-stone-300">{assignment.profileName}</td><td className="p-4 text-right"><button type="button" disabled={saving !== null} onClick={() => remove(assignment)} className="inline-flex items-center gap-2 rounded-md border border-red-900/70 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-950/40 disabled:opacity-50"><UserRoundX size={15} />Quitar</button></td></tr>)}</tbody></table></div> : <p className="p-5 text-sm text-stone-500">Todavía no hay delegados asignados.</p>}</section>;
}
