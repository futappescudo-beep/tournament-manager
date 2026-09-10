"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { FixtureMatch } from "@/lib/service/competition.service";

type Tab = "upcoming" | "today" | "past";

function argentinaToday() {
  const values = new Map(new Intl.DateTimeFormat("en-US", { timeZone: "America/Argentina/Buenos_Aires", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date()).map((part) => [part.type, part.value]));
  return `${values.get("year")}-${values.get("month")}-${values.get("day")}`;
}

function displayDate(value: string | null) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString("es-AR") : "A confirmar";
}

export function DashboardMatchTabs({ matches }: { matches: FixtureMatch[] }) {
  const [tab, setTab] = useState<Tab>("upcoming");
  const today = argentinaToday();
  const groups = useMemo(() => ({
    upcoming: matches.filter((match) => !match.match_date || match.match_date > today),
    today: matches.filter((match) => match.match_date === today),
    past: matches.filter((match) => Boolean(match.match_date && match.match_date < today)),
  }), [matches, today]);
  const labels: Array<{ id: Tab; label: string }> = [
    { id: "upcoming", label: `Próximos (${groups.upcoming.length})` },
    { id: "today", label: `Hoy (${groups.today.length})` },
    { id: "past", label: `Anteriores (${groups.past.length})` },
  ];
  const visible = groups[tab];

  return <article className="ea-panel overflow-hidden rounded-lg"><div className="border-b border-[var(--ea-border)] px-4 pt-4"><h2 className="ea-heading text-lg">Partidos</h2><div className="mt-4 flex gap-1 overflow-x-auto" role="tablist" aria-label="Partidos por fecha">{labels.map((item) => <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id)} className={`whitespace-nowrap border-b-2 px-3 py-2 text-xs font-semibold transition ${tab === item.id ? "border-[var(--ea-gold)] text-[var(--ea-gold)]" : "border-transparent text-stone-500 hover:text-stone-200"}`}>{item.label}</button>)}</div></div>{visible.length ? <div className="divide-y divide-[var(--ea-border)]">{visible.map((match) => { const hasResult = match.home_score !== null && match.away_score !== null; return <div key={match.id} className="grid grid-cols-[4.5rem_1fr_auto_1fr] items-center gap-2 px-4 py-4 text-sm"><div className="text-xs text-stone-500"><p>{displayDate(match.match_date)}</p><p>{match.kickoff_time?.slice(0, 5) ?? "--:--"}</p></div><strong className="truncate text-right">{match.home_team ?? "Por definir"}</strong><span className="ea-gold whitespace-nowrap font-bold">{hasResult ? `${match.home_score} - ${match.away_score}` : "VS"}</span><strong className="truncate">{match.away_team ?? "Por definir"}</strong></div>; })}</div> : <p className="p-8 text-center text-sm text-stone-500">{tab === "upcoming" ? "No hay próximos partidos para los filtros seleccionados." : tab === "today" ? "No hay partidos programados para hoy." : "No hay partidos anteriores para los filtros seleccionados."}</p>}<Link href="/matches" className="flex items-center justify-end gap-1 border-t border-[var(--ea-border)] px-4 py-3 text-sm font-semibold text-[var(--ea-gold)]">Ver fixture completo<ChevronRight className="h-4 w-4" /></Link></article>;
}
