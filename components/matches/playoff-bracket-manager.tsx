"use client";

import { useMemo, useState } from "react";
import { GitBranchPlus, Plus, Trophy, X } from "lucide-react";
import { toast } from "sonner";
import { savePlayoffBracket } from "@/lib/actions/playoffs";
import type { FixtureSetup } from "@/lib/service/competition.service";
import type { PlayoffBracketSummary } from "@/lib/service/playoffs.service";

type DraftMatch = {
  stageName: string;
  homeTeamRegistrationId: string;
  awayTeamRegistrationId: string;
  homeSourceLabel: string;
  awaySourceLabel: string;
  isNeutralVenue: boolean;
  isFinal: boolean;
};

const emptyMatch = (stageName = "Cuartos de final"): DraftMatch => ({ stageName, homeTeamRegistrationId: "", awayTeamRegistrationId: "", homeSourceLabel: "", awaySourceLabel: "", isNeutralVenue: false, isFinal: false });

export function PlayoffBracketManager({ setup, brackets = [], compact = false }: { setup: FixtureSetup; brackets?: PlayoffBracketSummary[]; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tournamentId, setTournamentId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("Copa de Oro");
  const [trophy, setTrophy] = useState<"GOLD" | "SILVER" | "CUSTOM">("GOLD");
  const [notes, setNotes] = useState("");
  const [matches, setMatches] = useState<DraftMatch[]>([emptyMatch()]);
  const categories = useMemo(() => setup.categories.filter((category) => category.tournamentId === tournamentId), [setup.categories, tournamentId]);
  const teams = useMemo(() => setup.teams.filter((team) => team.categoryId === categoryId), [setup.teams, categoryId]);

  function reset() {
    setTournamentId(""); setCategoryId(""); setName("Copa de Oro"); setTrophy("GOLD"); setNotes(""); setMatches([emptyMatch()]);
  }
  function updateMatch(index: number, patch: Partial<DraftMatch>) { setMatches((current) => current.map((match, position) => position === index ? { ...match, ...patch } : match)); }
  function chooseTrophy(next: "GOLD" | "SILVER" | "CUSTOM") { setTrophy(next); if (next === "GOLD") setName("Copa de Oro"); if (next === "SILVER") setName("Copa de Plata"); if (next === "CUSTOM") setName(""); }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      await savePlayoffBracket({ tournamentId, categoryId, name, trophy, notes, matches });
      toast.success("Cuadro de playoff guardado como borrador.");
      setOpen(false); reset();
    } catch (error) { toast.error(error instanceof Error && /does not exist|schema cache/i.test(error.message) ? "Falta ejecutar la migración 20260918_flexible_playoff_brackets.sql en Supabase." : error instanceof Error ? error.message : "No se pudo guardar el cuadro."); }
    finally { setLoading(false); }
  }
  return <div className="space-y-4">
    <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-md border border-[var(--ea-gold)]/60 px-4 py-2 text-sm font-bold text-[var(--ea-gold)] hover:bg-[var(--ea-gold)]/10"><GitBranchPlus size={16} />Generar Play Off</button>
    {!compact && brackets.length > 0 && <section className="ea-panel rounded-lg p-5"><div className="flex items-center gap-2"><Trophy className="h-5 w-5 text-[var(--ea-gold)]" /><div><h2 className="ea-heading text-xl">Cuadros de playoff</h2><p className="text-sm text-stone-400">Borradores configurados por el administrador. Los partidos se programan al confirmar cada cruce.</p></div></div><div className="mt-5 grid gap-4 xl:grid-cols-2">{brackets.map((bracket) => <article key={bracket.id} className="rounded-md border border-[var(--ea-border)] bg-black/10 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-white">{bracket.name}</p><p className="text-xs text-stone-400">{bracket.categoryName} · {bracket.status === "DRAFT" ? "Borrador" : bracket.status}</p></div><span className="rounded bg-[#2b2010] px-2 py-1 text-xs font-semibold text-[var(--ea-gold)]">{bracket.trophy === "GOLD" ? "Oro" : bracket.trophy === "SILVER" ? "Plata" : "Copa"}</span></div><ol className="mt-4 space-y-2">{bracket.matches.map((match) => <li key={match.id} className="rounded border border-[var(--ea-border)]/70 p-3 text-sm"><p className="text-xs font-semibold text-[var(--ea-gold-soft)]">{match.stageName}{match.isFinal ? " · Final" : ""}{match.isNeutralVenue ? " · Cancha neutral" : ""}</p><p className="mt-1 font-medium">{match.home} <span className="text-[var(--ea-gold)]">vs</span> {match.away}</p></li>)}</ol></article>)}</div></section>}
    {open && <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-3 sm:p-5" role="dialog" aria-modal="true" aria-labelledby="playoff-dialog-title"><div className="mx-auto my-3 w-full max-w-5xl rounded-xl border border-[var(--ea-border)] bg-[#121313] p-5 shadow-2xl sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold tracking-[.18em] text-[var(--ea-gold)]">FASE ELIMINATORIA</p><h2 id="playoff-dialog-title" className="mt-1 text-xl font-bold text-white">Diseñar cuadro de playoff</h2><p className="mt-1 text-sm text-stone-400">Armá los cruces a medida. Para un pase directo, indicá como procedencia “Ganador de…” en vez de asignar todavía un equipo.</p></div><button type="button" onClick={() => { setOpen(false); reset(); }} className="rounded p-1 text-stone-400 hover:text-white" aria-label="Cerrar"><X size={20} /></button></div><form onSubmit={submit} className="mt-6 space-y-5"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><label className="grid gap-2 text-sm font-medium">Torneo<select required value={tournamentId} onChange={(event) => { setTournamentId(event.target.value); setCategoryId(""); }}><option value="" disabled>Seleccionar torneo</option>{setup.tournaments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="grid gap-2 text-sm font-medium">Categoría<select required disabled={!tournamentId} value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="" disabled>{tournamentId ? "Seleccionar categoría" : "Elegí primero un torneo"}</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="grid gap-2 text-sm font-medium">Copa<select value={trophy} onChange={(event) => chooseTrophy(event.target.value as "GOLD" | "SILVER" | "CUSTOM")}><option value="GOLD">Copa de Oro</option><option value="SILVER">Copa de Plata</option><option value="CUSTOM">Otra copa</option></select></label><label className="grid gap-2 text-sm font-medium">Nombre<input required value={name} maxLength={80} onChange={(event) => setName(event.target.value)} placeholder="Ej. Copa de Oro" /></label></div><p className="rounded-md border border-[var(--ea-gold)]/20 bg-[var(--ea-gold)]/5 p-3 text-sm text-stone-300">Los equipos disponibles son solo los inscriptos en la categoría elegida, sin importar su zona. Así podés armar cruces interzonales y decidir quién comienza en cada instancia.</p><div className="space-y-4">{matches.map((match, index) => <fieldset key={index} className="rounded-lg border border-[var(--ea-border)] p-4"><div className="mb-3 flex items-center justify-between gap-3"><p className="font-bold text-white">Cruce {index + 1}</p>{matches.length > 1 && <button type="button" onClick={() => setMatches((current) => current.filter((_, position) => position !== index))} className="text-xs font-semibold text-red-300 hover:text-red-200">Quitar</button>}</div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><label className="grid gap-2 text-sm font-medium">Ronda<input required value={match.stageName} maxLength={80} onChange={(event) => updateMatch(index, { stageName: event.target.value })} placeholder="Ej. Semifinal" /></label><TeamOrSource label="Local" teams={teams} teamId={match.homeTeamRegistrationId} source={match.homeSourceLabel} onChange={(patch) => updateMatch(index, patch)} /><TeamOrSource label="Visitante" teams={teams} teamId={match.awayTeamRegistrationId} source={match.awaySourceLabel} onChange={(patch) => updateMatch(index, patch)} exclude={match.homeTeamRegistrationId} /><div className="grid content-end gap-2"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={match.isFinal} onChange={(event) => updateMatch(index, { isFinal: event.target.checked, isNeutralVenue: event.target.checked || match.isNeutralVenue })} />Es la final</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={match.isNeutralVenue} onChange={(event) => updateMatch(index, { isNeutralVenue: event.target.checked })} />Cancha neutral</label></div></div></fieldset>)}</div><button type="button" onClick={() => setMatches((current) => [...current, emptyMatch("Semifinal")])} className="inline-flex items-center gap-2 rounded-md border border-[var(--ea-border)] px-3 py-2 text-sm font-semibold hover:border-[var(--ea-gold)]/60"><Plus size={16} />Agregar cruce</button><label className="grid gap-2 text-sm font-medium">Observaciones <span className="font-normal text-stone-500">(opcional)</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} maxLength={500} placeholder="Criterio de clasificación, pases directos o reglas particulares." /></label><div className="flex justify-end gap-3"><button type="button" disabled={loading} onClick={() => { setOpen(false); reset(); }} className="rounded-md border border-[var(--ea-border)] px-4 py-2 text-sm">Cancelar</button><button disabled={loading || !tournamentId || !categoryId} className="rounded-md bg-[linear-gradient(135deg,#b71920,#77080d)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{loading ? "Guardando..." : "Guardar cuadro"}</button></div></form></div></div>}
  </div>;
}

function TeamOrSource({ label, teams, teamId, source, onChange, exclude }: { label: string; teams: { id: string; name: string; zone: string | null }[]; teamId: string; source: string; onChange: (patch: Partial<DraftMatch>) => void; exclude?: string }) {
  const isHome = label === "Local";
  const teamKey = isHome ? "homeTeamRegistrationId" : "awayTeamRegistrationId";
  const sourceKey = isHome ? "homeSourceLabel" : "awaySourceLabel";
  return <div className="grid gap-2"><label className="grid gap-2 text-sm font-medium">{label}<select value={teamId} onChange={(event) => onChange({ [teamKey]: event.target.value, [sourceKey]: event.target.value ? "" : source } as Partial<DraftMatch>)}><option value="">No asignar equipo todavía</option>{teams.filter((team) => team.id !== exclude).map((team) => <option key={team.id} value={team.id}>{team.name}{team.zone ? ` · ${team.zone}` : ""}</option>)}</select></label>{!teamId && <><input required value={source} maxLength={80} onChange={(event) => onChange({ [sourceKey]: event.target.value } as Partial<DraftMatch>)} placeholder="Ej. Ganador del cruce 1" aria-label={`Procedencia ${label.toLowerCase()}`} /><span className="text-xs text-stone-500">Usá “Ganador del cruce N” para que avance automáticamente.</span></>}</div>;
}
