"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardCheck, Plus, ScrollText } from "lucide-react";
import { toast } from "sonner";
import { confirmSheet, saveMatchEvent, saveSheetEntry, setSheetStatus } from "@/lib/actions/match-events";
import type { MatchReport } from "@/lib/service/competition.service";

export function MatchEventsClient({ report }: { report: MatchReport }) {
  const [teamId, setTeamId] = useState(report.homeTeamRegistrationId);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [eventPlayerId, setEventPlayerId] = useState("");
  const [eventTypeId, setEventTypeId] = useState("");
  const [loading, setLoading] = useState(false);
  const players = useMemo(() => report.players.filter((player) => player.teamRegistrationId === teamId), [report.players, teamId]);
  const entries = new Map(report.sheetEntries.map((entry) => [entry.playerRegistrationId, entry]));
  const teamName = teamId === report.homeTeamRegistrationId ? report.homeTeam : report.awayTeam;

  async function togglePlayer(player: MatchReport["players"][number]) {
    setSavingId(player.id);
    try {
      const entry = entries.get(player.id);
      await saveSheetEntry({ matchId: report.id, playerRegistrationId: player.id, teamRegistrationId: teamId, shirtNumber: entry?.shirtNumber ?? player.shirtNumber, isPresent: !entry?.isPresent, notes: entry?.notes ?? "" });
      toast.success(!entry?.isPresent ? `${player.name} marcado presente.` : `${player.name} marcado ausente.`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo actualizar la planilla."); } finally { setSavingId(null); }
  }

  async function submitEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true);
    try {
      const form = new FormData(event.currentTarget);
      await saveMatchEvent({ matchId: report.id, playerRegistrationId: eventPlayerId, eventTypeId, minute: Number(form.get("minute")), comments: String(form.get("comments") ?? "") });
      setEventPlayerId(""); setEventTypeId(""); event.currentTarget.reset(); toast.success("Evento registrado.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo registrar el evento."); } finally { setLoading(false); }
  }

  async function confirm(confirmationType: "REFEREE" | "HOME_DELEGATE" | "AWAY_DELEGATE") {
    try { await confirmSheet({ matchId: report.id, confirmationType }); toast.success("Confirmación digital registrada."); }
    catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo confirmar la planilla."); }
  }

  async function changeStatus(status: "DRAFT" | "OPEN" | "CLOSED") {
    try { await setSheetStatus({ matchId: report.id, status }); toast.success(status === "DRAFT" ? "Planilla preliminar creada con jugadores precargados." : status === "OPEN" ? "Planilla abierta para el árbitro." : "Planilla cerrada."); }
    catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo cambiar el estado de la planilla."); }
  }

  const confirmationLabels = { REFEREE: "Árbitro", HOME_DELEGATE: "Delegado local", AWAY_DELEGATE: "Delegado visitante" };
  const editable = report.sheetStatus === "OPEN";
  return <div className="space-y-5"><div><p className="text-xs font-bold tracking-[.18em] text-[var(--ea-gold)]">PLANILLA DIGITAL</p><h1 className="mt-1 text-2xl text-white sm:text-3xl">{report.homeTeam} vs. {report.awayTeam}</h1><p className="mt-1 text-sm text-stone-400">Marcá presentes, registrá eventos y cerrá con constancia digital.</p></div>
    <section className="ea-panel rounded-lg p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="ea-heading text-lg">Estado: {report.sheetStatus === "DRAFT" ? "Preliminar" : report.sheetStatus === "OPEN" ? "Abierta" : report.sheetStatus === "CLOSED" ? "Cerrada" : "Sin iniciar"}</p><p className="text-xs text-stone-400">La primera etapa precarga automáticamente ambos planteles.</p></div><div className="flex gap-2">{!report.sheetStatus && <button onClick={() => changeStatus("DRAFT")} className="rounded-md border border-[var(--ea-gold)]/50 px-3 py-2 text-xs font-bold">Crear preliminar</button>}{report.sheetStatus === "DRAFT" && <button onClick={() => changeStatus("OPEN")} className="rounded-md bg-[#9e1016] px-3 py-2 text-xs font-bold text-white">Abrir para árbitro</button>}{report.sheetStatus === "OPEN" && <button onClick={() => changeStatus("CLOSED")} className="rounded-md bg-[#9e1016] px-3 py-2 text-xs font-bold text-white">Cerrar planilla</button>}{report.sheetStatus === "CLOSED" && <button onClick={() => changeStatus("OPEN")} className="rounded-md border border-[var(--ea-gold)]/50 px-3 py-2 text-xs font-bold text-[var(--ea-gold-soft)]">Reabrir (administración)</button>}</div></div></section>
    <section className="ea-panel rounded-lg p-3 sm:p-5"><div className="grid grid-cols-2 gap-2"><button onClick={() => setTeamId(report.homeTeamRegistrationId)} className={`rounded-md px-3 py-3 text-sm font-bold ${teamId === report.homeTeamRegistrationId ? "bg-[#9e1016] text-white" : "border border-[var(--ea-border)]"}`}>{report.homeTeam}</button><button onClick={() => setTeamId(report.awayTeamRegistrationId)} className={`rounded-md px-3 py-3 text-sm font-bold ${teamId === report.awayTeamRegistrationId ? "bg-[#9e1016] text-white" : "border border-[var(--ea-border)]"}`}>{report.awayTeam}</button></div><div className="mt-4 flex items-center justify-between"><h2 className="ea-heading text-xl">{teamName}</h2><span className="text-xs text-stone-400">{players.filter((player) => entries.get(player.id)?.isPresent).length}/{players.length} presentes</span></div><div className="mt-3 divide-y divide-[var(--ea-border)] overflow-hidden rounded-md border border-[var(--ea-border)]">{players.map((player) => { const present = entries.get(player.id)?.isPresent ?? false; return <button key={player.id} disabled={!editable || savingId === player.id} onClick={() => togglePlayer(player)} className="flex w-full items-center gap-3 p-3 text-left disabled:opacity-50"><span className="grid h-8 w-8 shrink-0 place-items-center rounded border border-[var(--ea-gold)]/40 text-sm font-bold text-[var(--ea-gold)]">{entries.get(player.id)?.shirtNumber ?? player.shirtNumber}</span><span className="flex-1 font-semibold">{player.name}</span><span className={`grid h-7 w-7 place-items-center rounded-full border ${present ? "border-green-500 bg-green-700 text-white" : "border-stone-600 text-stone-500"}`}>{present && <Check size={17} />}</span></button>; })}{!players.length && <p className="p-6 text-center text-sm text-stone-500">No hay jugadores habilitados para este equipo.</p>}</div></section>
    <section className="ea-panel rounded-lg p-4 sm:p-5"><div className="flex items-center gap-3"><Plus className="text-[var(--ea-gold)]" /><h2 className="ea-heading text-xl">Evento del partido</h2></div><form onSubmit={submitEvent} className="mt-4 grid gap-3 sm:grid-cols-2"><select disabled={!editable} required value={eventPlayerId} onChange={(event) => setEventPlayerId(event.target.value)}><option value="" disabled>Jugador</option>{report.players.map((player) => <option key={player.id} value={player.id}>#{player.shirtNumber} · {player.name}</option>)}</select><select disabled={!editable} required value={eventTypeId} onChange={(event) => setEventTypeId(event.target.value)}><option value="" disabled>Evento</option>{report.eventTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}</select><input disabled={!editable} required name="minute" type="number" min="0" max="130" placeholder="Minuto" /><input disabled={!editable} name="comments" maxLength={300} placeholder="Observación (opcional)" /><button disabled={!editable || loading} className="rounded-md bg-[linear-gradient(135deg,#b71920,#77080d)] px-4 py-3 text-sm font-bold text-white disabled:opacity-50 sm:col-span-2">{loading ? "Guardando..." : "Registrar evento"}</button></form></section>
    <section className="ea-panel rounded-lg p-4 sm:p-5"><div className="flex items-center gap-3"><ClipboardCheck className="text-[var(--ea-gold)]" /><div><h2 className="ea-heading text-xl">Confirmación digital</h2><p className="text-xs text-stone-400">Registra usuario y fecha/hora como constancia de conformidad.</p></div></div><div className="mt-4 grid gap-2 sm:grid-cols-3">{(["HOME_DELEGATE", "AWAY_DELEGATE", "REFEREE"] as const).map((type) => { const item = report.confirmations.find((confirmation) => confirmation.confirmationType === type); return <button key={type} disabled={!editable || Boolean(item)} onClick={() => confirm(type)} className="rounded-md border border-[var(--ea-border)] px-3 py-3 text-sm font-bold disabled:border-green-700 disabled:text-green-300">{item ? `${confirmationLabels[type]} confirmado` : `Confirmar: ${confirmationLabels[type]}`}</button>; })}</div></section>
    <section className="ea-panel overflow-hidden rounded-lg"><div className="flex items-center gap-3 border-b border-[var(--ea-border)] p-4"><ScrollText className="text-[var(--ea-gold)]" /><h2 className="ea-heading text-xl">Eventos registrados</h2></div>{report.events.length ? <div className="divide-y divide-[var(--ea-border)]">{report.events.map((event) => <div key={event.id} className="grid grid-cols-[3rem_1fr_auto] items-center gap-2 p-3"><span className="font-bold text-[var(--ea-gold)]">{event.minute}&apos;</span><span className="font-semibold">{event.playerName}</span><span className="text-xs text-stone-400">{event.eventName}</span></div>)}</div> : <p className="p-6 text-center text-sm text-stone-500">Todavía no hay eventos registrados.</p>}</section></div>;
}
