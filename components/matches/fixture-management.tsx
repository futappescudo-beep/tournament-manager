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
  const [tournamentId, setTournamentId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [homeTeamRegistrationId, setHomeTeamRegistrationId] = useState("");
  const [awayTeamRegistrationId, setAwayTeamRegistrationId] = useState("");
  const categories = useMemo(() => setup.categories.filter((category) => category.tournamentId === tournamentId), [setup.categories, tournamentId]);
  const zones = useMemo(() => setup.zones.filter((zone) => zone.categoryId === categoryId), [setup.zones, categoryId]);
  const teams = useMemo(() => setup.teams.filter((team) => team.categoryId === categoryId && team.zoneId === zoneId), [setup.teams, categoryId, zoneId]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    try {
      await createManualFixtureMatch({
        tournamentId,
        categoryId,
        zoneId,
        phaseId: String(form.get("phaseId")),
        round: Number(form.get("round")),
        homeTeamRegistrationId,
        awayTeamRegistrationId,
        matchDate: String(form.get("matchDate")),
        kickoffTime: String(form.get("kickoffTime")),
        fieldId: String(form.get("fieldId") ?? ""),
        refereeId: String(form.get("refereeId") ?? ""),
        assistantReferee1Id: String(form.get("assistantReferee1Id") ?? ""),
        assistantReferee2Id: String(form.get("assistantReferee2Id") ?? ""),
        observations: String(form.get("observations") ?? ""),
      });
      toast.success("Partido agregado al fixture.");
      setOpen(false);
      setTournamentId(""); setCategoryId(""); setZoneId("");
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
    {open && <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="fixture-dialog-title"><div className="mx-auto my-6 w-full max-w-3xl rounded-xl border border-[var(--ea-border)] bg-[#121313] p-6 shadow-2xl"><div><h2 id="fixture-dialog-title" className="text-xl font-bold text-white">Agregar partido al fixture</h2><p className="mt-1 text-sm text-stone-400">Seleccioná torneo, categoría, zona y fecha antes de asignar los equipos.</p></div><form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-medium">Torneo<select required value={tournamentId} onChange={(event) => { setTournamentId(event.target.value); setCategoryId(""); setZoneId(""); setHomeTeamRegistrationId(""); setAwayTeamRegistrationId(""); }}><option value="" disabled>Seleccionar torneo</option>{setup.tournaments.map((tournament) => <option key={tournament.id} value={tournament.id}>{tournament.name}</option>)}</select></label><label className="grid gap-2 text-sm font-medium">Categoría<select required disabled={!tournamentId} value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setZoneId(""); setHomeTeamRegistrationId(""); setAwayTeamRegistrationId(""); }}><option value="" disabled>{tournamentId ? "Seleccionar categoría" : "Elegí primero un torneo"}</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="grid gap-2 text-sm font-medium">Zona<select required disabled={!categoryId} value={zoneId} onChange={(event) => { setZoneId(event.target.value); setHomeTeamRegistrationId(""); setAwayTeamRegistrationId(""); }}><option value="" disabled>{categoryId ? "Seleccionar zona" : "Elegí primero una categoría"}</option>{zones.map((zone) => <option key={zone.id} value={zone.id}>{zone.name}</option>)}</select></label><label className="grid gap-2 text-sm font-medium">Fase<select required name="phaseId" defaultValue=""><option value="" disabled>Seleccionar fase</option>{setup.phases.map((phase) => <option key={phase.id} value={phase.id}>{phase.name}</option>)}</select></label><label className="grid gap-2 text-sm font-medium">Fecha N°<input required name="round" type="number" min="1" max="99" defaultValue="1" /></label><label className="grid gap-2 text-sm font-medium">Día del partido<input required name="matchDate" type="date" defaultValue={today} /></label><label className="grid gap-2 text-sm font-medium">Hora<input required name="kickoffTime" type="time" defaultValue="12:00" /></label><label className="grid gap-2 text-sm font-medium">Cancha <span className="font-normal text-stone-500">(opcional)</span><select name="fieldId" defaultValue=""><option value="">Sin asignar</option>{setup.fields.map((field) => <option key={field.id} value={field.id}>{field.name}</option>)}</select></label><label className="grid gap-2 text-sm font-medium">Equipo local<select required disabled={!zoneId} value={homeTeamRegistrationId} onChange={(event) => setHomeTeamRegistrationId(event.target.value)}><option value="" disabled>{zoneId ? "Seleccionar equipo" : "Elegí primero una zona"}</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label><label className="grid gap-2 text-sm font-medium">Equipo visitante<select required disabled={!zoneId} value={awayTeamRegistrationId} onChange={(event) => setAwayTeamRegistrationId(event.target.value)}><option value="" disabled>{zoneId ? "Seleccionar equipo" : "Elegí primero una zona"}</option>{teams.filter((team) => team.id !== homeTeamRegistrationId).map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label><div className="grid gap-4 sm:col-span-2 sm:grid-cols-3"><label className="grid gap-2 text-sm font-medium">Árbitro <span className="font-normal text-stone-500">(opcional)</span><select name="refereeId" defaultValue=""><option value="">Sin asignar</option>{setup.referees.map((referee) => <option key={referee.id} value={referee.id}>{referee.name}</option>)}</select></label><label className="grid gap-2 text-sm font-medium">Asistente 1 <span className="font-normal text-stone-500">(opcional)</span><select name="assistantReferee1Id" defaultValue=""><option value="">Sin asignar</option>{setup.referees.map((referee) => <option key={referee.id} value={referee.id}>{referee.name}</option>)}</select></label><label className="grid gap-2 text-sm font-medium">Asistente 2 <span className="font-normal text-stone-500">(opcional)</span><select name="assistantReferee2Id" defaultValue=""><option value="">Sin asignar</option>{setup.referees.map((referee) => <option key={referee.id} value={referee.id}>{referee.name}</option>)}</select></label></div><label className="grid gap-2 text-sm font-medium sm:col-span-2">Observaciones <span className="font-normal text-stone-500">(opcional)</span><textarea name="observations" rows={3} maxLength={500} placeholder="Ej. Llevar pecheras" /></label><div className="flex justify-end gap-3 sm:col-span-2"><button type="button" disabled={loading} onClick={() => setOpen(false)} className="rounded-md border border-[var(--ea-border)] px-4 py-2 text-sm">Cancelar</button><button disabled={loading || !tournamentId || !categoryId || !zoneId || !homeTeamRegistrationId || !awayTeamRegistrationId} className="rounded-md bg-[linear-gradient(135deg,#b71920,#77080d)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{loading ? "Guardando..." : "Agregar partido"}</button></div></form></div></div>}
  </div>;
}
