import Link from "next/link";
import { Trophy } from "lucide-react";
import { PLAYOFF_STAGES, normalizePlayoffStage, type PlayoffStage } from "@/lib/constants/playoffs";
import type { PlayoffBracketSummary } from "@/lib/service/playoffs.service";
import { PublishPlayoffButton } from "@/components/matches/publish-playoff-button";

type Props = { brackets: PlayoffBracketSummary[]; selectedStage?: PlayoffStage; canManage?: boolean };

export function PlayoffBracketBoard({ brackets, selectedStage, canManage = false }: Props) {
  if (!brackets.length) return <section className="ea-panel rounded-lg p-8 text-center text-sm text-stone-400">No hay cuadros de Play Off para los filtros seleccionados.</section>;
  return <section className="ea-panel overflow-hidden rounded-lg"><div className="border-b border-[var(--ea-border)] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><Trophy className="h-5 w-5 text-[var(--ea-gold)]" /><h2 className="ea-heading text-xl">Cuadro de Play Off</h2></div>{selectedStage && <span className="rounded bg-[#2b2010] px-2 py-1 text-xs font-semibold text-[var(--ea-gold)]">Instancia: {selectedStage}</span>}</div><p className="mt-1 text-sm text-stone-400">Llaves por instancia. Los cruces completos quedan listos para programar; los siguientes se completan al cargar un ganador.</p></div><div className="space-y-6 p-5">{brackets.map((bracket) => <Bracket key={bracket.id} bracket={bracket} selectedStage={selectedStage} canManage={canManage} />)}</div></section>;
}

function Bracket({ bracket, selectedStage, canManage }: { bracket: PlayoffBracketSummary; selectedStage?: PlayoffStage; canManage: boolean }) {
  const matchesByStage = new Map<PlayoffStage, typeof bracket.matches>();
  for (const stage of PLAYOFF_STAGES) matchesByStage.set(stage, []);
  for (const match of bracket.matches) { const stage = normalizePlayoffStage(match.stageName); if (stage) matchesByStage.get(stage)?.push(match); }
  const hasUnpublished = bracket.matches.some((match) => !match.fixtureMatchId && match.home !== "Por definir" && match.away !== "Por definir");
  return <article className="rounded-lg border border-[var(--ea-border)] bg-black/15 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold text-white">{bracket.name}</h3><p className="text-xs text-stone-400">{bracket.categoryName} · {bracket.status === "DRAFT" ? "Borrador" : bracket.status}</p></div><div className="flex items-center gap-2"><span className="rounded bg-[#2b2010] px-2 py-1 text-xs font-semibold text-[var(--ea-gold)]">{bracket.trophy === "GOLD" ? "Copa de Oro" : bracket.trophy === "SILVER" ? "Copa de Plata" : "Copa"}</span>{canManage && hasUnpublished && <PublishPlayoffButton bracketId={bracket.id} />}</div></div><div className="mt-4 overflow-x-auto"><div className="grid min-w-[64rem] grid-cols-4 gap-4">{PLAYOFF_STAGES.map((stage) => <div key={stage} className={`min-h-52 space-y-3 rounded-md p-2 ${selectedStage === stage ? "bg-[var(--ea-gold)]/10 ring-1 ring-[var(--ea-gold)]/50" : "bg-white/[.02]"}`}><p className="border-b border-[var(--ea-gold)]/30 pb-2 text-center text-xs font-bold uppercase tracking-wide text-[var(--ea-gold)]">{stage}</p>{(matchesByStage.get(stage) ?? []).length ? (matchesByStage.get(stage) ?? []).map((match) => <MatchCard key={match.id} match={match} />) : <p className="py-8 text-center text-xs text-stone-600">Sin cruces</p>}</div>)}</div></div></article>;
}

function MatchCard({ match }: { match: PlayoffBracketSummary["matches"][number] }) {
  return <article className="rounded-md border border-[var(--ea-border)] bg-[#101414] p-3 text-sm shadow-sm"><p className="mb-2 text-xs text-stone-500">Cruce {match.matchOrder}{match.isFinal ? " · Final" : ""}{match.isNeutralVenue ? " · Cancha neutral" : ""}</p><div className="flex items-center justify-between gap-2"><span className={match.winner === match.home ? "font-bold text-[var(--ea-gold)]" : "text-stone-200"}>{match.home}</span><strong>{match.homeScore ?? "–"}</strong></div><div className="mt-1 flex items-center justify-between gap-2"><span className={match.winner === match.away ? "font-bold text-[var(--ea-gold)]" : "text-stone-200"}>{match.away}</span><strong>{match.awayScore ?? "–"}</strong></div>{match.winner ? <p className="mt-2 text-xs font-semibold text-[var(--ea-gold)]">Avanza: {match.winner}</p> : match.fixtureMatchId ? <Link href={`/matches/${match.fixtureMatchId}`} className="mt-2 block text-xs font-semibold text-[var(--ea-gold)] hover:text-[var(--ea-gold-soft)]">Programar / planilla</Link> : <p className="mt-2 text-xs text-stone-500">Esperando rivales</p>}</article>;
}
