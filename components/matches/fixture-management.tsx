"use client";

import { useMemo, useState } from "react";
import { CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { createManualFixtureMatch } from "@/lib/actions/matches";
import type { FixtureSetup } from "@/lib/service/competition.service";

const today = new Date().toISOString().slice(0, 10);

export function FixtureManagement({ setup }: { setup: FixtureSetup }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [homeTeamRegistrationId, setHomeTeamRegistrationId] = useState("");
  const [awayTeamRegistrationId, setAwayTeamRegistrationId] = useState("");
  const selectedHome = useMemo(() => setup.teams.find((team) => team.id === homeTeamRegistrationId), [homeTeamRegistrationId, setup.teams]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    try {
      await createManualFixtureMatch({
        tournamentId: String(form.get("tournamentId")),
        phaseId: String(form.get("phaseId")),
        round: Number(form.get("round")),
        homeTeamRegistrationId,
        awayTeamRegistrationId,
        matchDate: String(form.get("matchDate")),
        kickoffTime: String(form.get("kickoffTime")),
        fieldId: String(form.get("fieldId") ?? ""),
        refereeId: String(form.get("refereeId") ?? ""),
        observations: String(form.get("observations") ?? ""),
      });
      toast.success("Partido agregado al fixture.");
      setOpen(false);
      setHomeTeamRegistrationId("");
      setAwayTeamRegistrationId("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el partido.");
    } finally {
      setLoading(false);
    }
  }

  if (!setup.phases.length) {
    return <div className="rounded-md border border-amber-700/60 bg-amber-950/30 p-4 text-sm text-amber-100">No hay fases de competencia configuradas. Ejecutá la migración <code>20260908_fixture_manual_access.sql</code> y verificá que exista al menos una fase en Supabase antes de cargar el fixture.</div>;
  }

  return <div className="space-y-3">
    <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-md bg-[linear-gradient(135deg,#b71920,#77080d)] px-4 py-2 text-sm font-bold text-white"><CalendarPlus size={16} />Agregar partido</button>
    {open && <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="fixture-dialog-title"><div className="mx-auto my-6 w-full max-w-2xl rounded-xl border border-[var(--ea-border)] bg-[#121313] p-6 shadow-2xl"><div><h2 id="fixture-dialog-title" className="text-xl font-bold text-white">Agregar partido al fixture</h2><p className="mt-1 text-sm text-stone-400">La fecha se crea automáticamente si todavía no existe.</p></div><form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-medium">Torneo<select required name="tournamentId" defaultValue=""><option value="" disabled>Seleccionar torneo</option>{setup.tournaments.map((tournament) => <option key={tournament.id} value={tournament.id}>{tournament.name}</option>)}</select></label><label className="grid gap-2 text-sm font-medium">Fase<select required name="phaseId" defaultValue=""><option value="" disabled>Seleccionar fase</option>{setup.phases.map((phase) => <option key={phase.id} value={phase.id}>{phase.name}</option>)}</select></label><label className="grid gap-2 text-sm font-medium">Fecha N°<input required name="round" type="number" min="1" max="99" defaultValue="1" /></label><label className="grid gap-2 text-sm font-medium">Día del partido<input required name="matchDate" type="date" defaultValue={today} /></label><label className="grid gap-2 text-sm font-medium">Hora<input required name="kickoffTime" type="time" defaultValue="12:00" /></label><label className="grid gap-2 text-sm font-medium">Cancha <span className="font-normal text-stone-500">(opcional)</span><select name="fieldId" defaultValue=""><option value="">Sin asignar</option>{setup.fields.map((field) => <option key={field.id} value={field.id}>{field.name}</option>)}</select></label><label className="grid gap-2 text-sm font-medium">Equipo local<select required value={homeTeamRegistrationId} onChange={(event) => setHomeTeamRegistrationId(event.target.value)}><option value="" disabled>Seleccionar equipo</option>{setup.teams.map((team) => <option key={team.id} value={team.id}>{team.name}{team.category ? ` · ${team.category}` : ""}{team.zone ? ` · ${team.zone}` : ""}</option>)}</select></label><label className="grid gap-2 text-sm font-medium">Equipo visitante<select required value={awayTeamRegistrationId} onChange={(event) => setAwayTeamRegistrationId(event.target.value)}><option value="" disabled>Seleccionar equipo</option>{setup.teams.filter((team) => team.id !== homeTeamRegistrationId && (!selectedHome?.category || team.category === selectedHome.category)).map((team) => <option key={team.id} value={team.id}>{team.name}{team.category ? ` · ${team.category}` : ""}{team.zone ? ` · ${team.zone}` : ""}</option>)}</select></label><label className="grid gap-2 text-sm font-medium sm:col-span-2">Árbitro <span className="font-normal text-stone-500">(opcional)</span><select name="refereeId" defaultValue=""><option value="">Sin asignar</option>{setup.referees.map((referee) => <option key={referee.id} value={referee.id}>{referee.name}</option>)}</select></label><label className="grid gap-2 text-sm font-medium sm:col-span-2">Observaciones <span className="font-normal text-stone-500">(opcional)</span><textarea name="observations" rows={3} maxLength={500} placeholder="Ej. Llevar pecheras" /></label><div className="flex justify-end gap-3 sm:col-span-2"><button type="button" disabled={loading} onClick={() => setOpen(false)} className="rounded-md border border-[var(--ea-border)] px-4 py-2 text-sm">Cancelar</button><button disabled={loading || !setup.tournaments.length || !setup.teams.length} className="rounded-md bg-[linear-gradient(135deg,#b71920,#77080d)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{loading ? "Guardando..." : "Agregar partido"}</button></div></form></div></div>}
  </div>;
}
