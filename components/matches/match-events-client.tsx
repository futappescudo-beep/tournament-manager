"use client";

import { useMemo, useState } from "react";
import { Plus, ScrollText } from "lucide-react";
import { toast } from "sonner";
import { saveMatchEvent } from "@/lib/actions/match-events";
import type { MatchReport } from "@/lib/service/competition.service";

export function MatchEventsClient({ report }: { report: MatchReport }) {
  const [playerRegistrationId, setPlayerRegistrationId] = useState("");
  const [eventTypeId, setEventTypeId] = useState("");
  const [loading, setLoading] = useState(false);
  const player = useMemo(() => report.players.find((item) => item.id === playerRegistrationId), [playerRegistrationId, report.players]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(event.currentTarget);
      await saveMatchEvent({ matchId: report.id, playerRegistrationId, eventTypeId, minute: Number(form.get("minute")), comments: String(form.get("comments") ?? "") });
      setPlayerRegistrationId("");
      setEventTypeId("");
      (event.target as HTMLFormElement).reset();
      toast.success("Evento registrado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo registrar el evento.");
    } finally { setLoading(false); }
  }

  return <div className="space-y-6"><div><p className="text-xs font-bold tracking-[.18em] text-[var(--ea-gold)]">PLANILLA DIGITAL</p><h1 className="mt-1 text-3xl text-white">{report.homeTeam} vs. {report.awayTeam}</h1><p className="mt-1 text-sm text-stone-400">Registrá goles y tarjetas del partido.</p></div><section className="ea-panel rounded-lg p-5"><div className="flex items-center gap-3"><Plus className="text-[var(--ea-gold)]" /><h2 className="ea-heading text-xl">Nuevo evento</h2></div><form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-2"><label className="grid gap-2 text-sm font-medium">Jugador<select required value={playerRegistrationId} onChange={(event) => setPlayerRegistrationId(event.target.value)}><option value="" disabled>Seleccionar jugador</option><optgroup label={report.homeTeam}>{report.players.filter((item) => item.teamRegistrationId === report.homeTeamRegistrationId).map((item) => <option key={item.id} value={item.id}>#{item.shirtNumber} · {item.name}</option>)}</optgroup><optgroup label={report.awayTeam}>{report.players.filter((item) => item.teamRegistrationId === report.awayTeamRegistrationId).map((item) => <option key={item.id} value={item.id}>#{item.shirtNumber} · {item.name}</option>)}</optgroup></select></label><label className="grid gap-2 text-sm font-medium">Evento<select required value={eventTypeId} onChange={(event) => setEventTypeId(event.target.value)}><option value="" disabled>Seleccionar evento</option>{report.eventTypes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="grid gap-2 text-sm font-medium">Minuto<input required name="minute" type="number" min="0" max="130" defaultValue="0" /></label><label className="grid gap-2 text-sm font-medium">Comentario <span className="font-normal text-stone-500">(opcional)</span><input name="comments" maxLength={300} placeholder={player ? `Evento de ${player.name}` : "Ej. Penal"} /></label><div className="flex justify-end md:col-span-2"><button disabled={loading || !report.players.length || !report.eventTypes.length} className="rounded-md bg-[linear-gradient(135deg,#b71920,#77080d)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{loading ? "Guardando..." : "Registrar evento"}</button></div></form></section><section className="ea-panel overflow-hidden rounded-lg"><div className="flex items-center gap-3 border-b border-[var(--ea-border)] p-5"><ScrollText className="text-[var(--ea-gold)]" /><h2 className="ea-heading text-xl">Eventos registrados</h2></div>{report.events.length ? <div className="divide-y divide-[var(--ea-border)]">{report.events.map((event) => <div key={event.id} className="grid grid-cols-[4rem_1fr_auto] items-center gap-3 p-4"><span className="font-bold text-[var(--ea-gold)]">{event.minute}&apos;</span><div><p className="font-semibold">{event.playerName}</p>{event.comments && <p className="text-xs text-stone-500">{event.comments}</p>}</div><span className="rounded bg-[#251b0e] px-2 py-1 text-xs text-[var(--ea-gold-soft)]">{event.eventName}</span></div>)}</div> : <p className="p-10 text-center text-sm text-stone-500">Todavía no hay goles ni tarjetas registrados.</p>}</section></div>;
}
