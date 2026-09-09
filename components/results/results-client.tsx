"use client";

import { useState } from "react";
import { ClipboardCheck, Pencil } from "lucide-react";
import { saveMatchResult } from "@/lib/actions/matches";
import type { FixtureMatch } from "@/lib/service/competition.service";

export function ResultsClient({ matches }: { matches: FixtureMatch[] }) {
  const [selected, setSelected] = useState<FixtureMatch | null>(null);
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function openResult(match: FixtureMatch) {
    setSelected(match);
    setHomeScore(match.home_score?.toString() ?? "");
    setAwayScore(match.away_score?.toString() ?? "");
    setError("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setLoading(true);
    setError("");
    try {
      await saveMatchResult({ matchId: selected.id, homeScore: Number(homeScore), awayScore: Number(awayScore) });
      setSelected(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo guardar el resultado.");
    } finally {
      setLoading(false);
    }
  }

  return <div className="space-y-6">
    <div><p className="text-xs font-bold tracking-[.18em] text-[var(--ea-gold)]">COMPETENCIA</p><h1 className="mt-1 text-3xl text-white">Resultados</h1><p className="mt-1 text-sm text-stone-400">Cargá o corregí los marcadores de cada partido.</p></div>
    <section className="ea-panel overflow-hidden rounded-lg">
      <div className="flex items-center gap-3 border-b border-[var(--ea-border)] p-5"><ClipboardCheck className="text-[var(--ea-gold)]" /><h2 className="ea-heading text-xl">Partidos del fixture</h2></div>
      {matches.length ? <div className="divide-y divide-[var(--ea-border)]">{matches.map((match) => <article key={match.id} className="grid gap-3 p-5 sm:grid-cols-[1fr_auto_1fr_auto] sm:items-center">
        <div className="min-w-0 text-right"><strong className="block truncate">{match.home_team ?? "Por definir"}</strong><span className="text-xs text-stone-500">{match.match_date ? new Date(`${match.match_date}T00:00:00`).toLocaleDateString("es-AR") : "Sin fecha"}</span></div>
        <span className="rounded border border-[var(--ea-gold)]/40 bg-[#241b0d] px-4 py-2 text-center text-lg font-bold text-[var(--ea-gold-soft)]">{match.home_score ?? "–"} - {match.away_score ?? "–"}</span>
        <strong className="min-w-0 truncate">{match.away_team ?? "Por definir"}</strong>
        <button onClick={() => openResult(match)} className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--ea-gold)]/40 px-3 py-2 text-sm font-semibold text-[var(--ea-gold-soft)] hover:bg-white/5"><Pencil size={15} />{match.home_score === null || match.away_score === null ? "Cargar" : "Editar"}</button>
      </article>)}</div> : <div className="p-12 text-center text-sm text-stone-500">No hay partidos creados todavía. Cargá el fixture para registrar resultados.</div>}
    </section>
    {selected && <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="result-title"><form onSubmit={submit} className="w-full max-w-md rounded-xl border border-[var(--ea-border)] bg-[#121313] p-6 shadow-2xl"><h2 id="result-title" className="text-xl font-bold text-white">Cargar resultado</h2><p className="mt-2 text-sm text-stone-400">{selected.home_team ?? "Local"} vs. {selected.away_team ?? "Visitante"}</p><div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-end gap-3"><label className="grid gap-2 text-sm font-medium">{selected.home_team ?? "Local"}<input autoFocus required min="0" max="99" inputMode="numeric" type="number" value={homeScore} onChange={(event) => setHomeScore(event.target.value)} /></label><span className="pb-2 text-xl text-[var(--ea-gold)]">–</span><label className="grid gap-2 text-sm font-medium">{selected.away_team ?? "Visitante"}<input required min="0" max="99" inputMode="numeric" type="number" value={awayScore} onChange={(event) => setAwayScore(event.target.value)} /></label></div>{error && <p role="alert" className="mt-4 rounded border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">{error}</p>}<div className="mt-6 flex justify-end gap-3"><button type="button" disabled={loading} onClick={() => setSelected(null)} className="rounded-md border border-[var(--ea-border)] px-4 py-2 text-sm">Cancelar</button><button disabled={loading} className="rounded-md bg-[linear-gradient(135deg,#b71920,#77080d)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{loading ? "Guardando..." : "Guardar resultado"}</button></div></form></div>}
  </div>;
}
