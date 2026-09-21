"use client";

import { useMemo, useState } from "react";
import { UserMinus, UserPlus, UserRound, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPlayerWithInitialAssignment, safelyAssignPlayerToTeam, unassignPlayerFromTeam } from "@/lib/actions/players";
import { PlayerAssignmentDialog } from "@/components/players/player-assignment-dialog";
import { PlayerDialog } from "@/components/players/players-dialog";
import type { Player, TeamRegistrationOption } from "@/lib/types/player";
import type { PlayerAssignmentValues, PlayerCreateValues } from "@/lib/validations/players";

type RosterEntry = { id: string; shirt_number: number; is_captain: boolean; is_goalkeeper: boolean; team_registration_id: string; players: { first_name: string; last_name: string; document_number: string; photo_url: string | null } | null };
type Registration = { id: string; category_name: string; zone_name: string; label: string };
type AvailablePlayer = { id: string; first_name: string; last_name: string; document_number: string; document_type: string; birth_date: string | null; photo_url: string | null };

export function TeamRosterClient({ team, players, registrations, availablePlayers }: { team: { id: string; name: string }; players: RosterEntry[]; registrations: Registration[]; availablePlayers: AvailablePlayer[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const labels = new Map(registrations.map((registration) => [registration.id, registration.label]));
  const teamRegistrations = useMemo<TeamRegistrationOption[]>(() => registrations.map((registration) => ({ ...registration, team_id: team.id, team_name: team.name })), [registrations, team]);
  const selectablePlayers = useMemo<Player[]>(() => availablePlayers.map((player) => ({ ...player, assignments: [] })), [availablePlayers]);

  async function create(values: PlayerCreateValues) {
    setLoading(true);
    try {
      const result = await createPlayerWithInitialAssignment(values);
      if (!result.ok) throw new Error(result.message);
      toast.success("Jugador creado y asignado al plantel.");
      setCreateOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el jugador.");
    } finally {
      setLoading(false);
    }
  }

  async function assign(values: PlayerAssignmentValues) {
    setLoading(true);
    try {
      const result = await safelyAssignPlayerToTeam(values);
      if (!result.ok) throw new Error(result.message);
      toast.success("Jugador asignado al plantel.");
      setAssignOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo asignar el jugador.");
    } finally {
      setLoading(false);
    }
  }

  async function unassign(entry: RosterEntry) {
    if (!window.confirm("¿Quitar este jugador del equipo? Su ficha quedará disponible para asignarla nuevamente.") || loading) return;
    setLoading(true);
    try {
      await unassignPlayerFromTeam(entry.id);
      toast.success("Jugador quitado del equipo. Su ficha permanece en el padrón.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo quitar el jugador del equipo.");
    } finally {
      setLoading(false);
    }
  }

  return <><section className="ea-panel overflow-hidden rounded-lg"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--ea-border)] p-4"><div><h2 className="font-semibold text-white">Plantel</h2><p className="text-xs text-stone-500">Registrá nuevos jugadores o asigná jugadores existentes a la categoría y zona correspondiente.</p></div><div className="flex flex-wrap gap-2"><button onClick={() => setAssignOpen(true)} className="inline-flex shrink-0 items-center gap-2 rounded-md border border-[var(--ea-gold)]/60 px-4 py-2 text-sm font-bold text-[var(--ea-gold-soft)]"><UsersRound size={16} />Asignar jugador</button><button onClick={() => setCreateOpen(true)} className="inline-flex shrink-0 items-center gap-2 rounded-md bg-[linear-gradient(135deg,#b71920,#77080d)] px-4 py-2 text-sm font-bold text-white"><UserPlus size={16} />Agregar jugador</button></div></div>{players.length ? <div className="divide-y divide-[var(--ea-border)]">{players.map((entry) => <article key={entry.id} className="flex items-center gap-4 p-4">{entry.players?.photo_url ? <img src={entry.players.photo_url} alt="" className="h-10 w-10 rounded-full object-cover" /> : <UserRound className="h-8 w-8 text-stone-500" />}<div className="min-w-0 flex-1"><p className="font-semibold">{entry.players?.first_name} {entry.players?.last_name}</p><p className="truncate text-xs text-stone-500">DNI: {entry.players?.document_number} · {labels.get(entry.team_registration_id) ?? "Zona sin definir"}</p></div><button onClick={() => unassign(entry)} disabled={loading} aria-label={`Quitar a ${entry.players?.first_name ?? "jugador"} del equipo`} className="rounded border border-red-900/70 p-2 text-red-200 hover:bg-red-950/40 disabled:opacity-50"><UserMinus size={15} /></button></article>)}</div> : <div className="grid min-h-48 place-items-center p-8 text-center"><p className="text-sm text-stone-400">Todavía no hay jugadores asignados a este equipo.</p></div>}</section><PlayerDialog open={createOpen} onOpenChange={setCreateOpen} player={null} teamRegistrations={teamRegistrations} fixedTeamId={team.id} loading={loading} onSave={create} /><PlayerAssignmentDialog open={assignOpen} onOpenChange={setAssignOpen} player={null} selectablePlayers={selectablePlayers} teamRegistrations={teamRegistrations} fixedTeamId={team.id} loading={loading} onSave={assign} /></>;
}
