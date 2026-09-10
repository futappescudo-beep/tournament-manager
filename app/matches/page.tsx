import Link from "next/link";
import { CalendarDays, MapPin, UserRound } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { canManageFixture, getFixture, getFixturePhases, getFixtureSetup } from "@/lib/service/competition.service";
import { FixtureManagement } from "@/components/matches/fixture-management";
import { getPlayoffBrackets } from "@/lib/service/playoffs.service";
import { PlayoffBracketManager } from "@/components/matches/playoff-bracket-manager";
import { RegularFixtureGenerator } from "@/components/matches/regular-fixture-generator";
import { FixtureScheduleEditor } from "@/components/matches/fixture-schedule-editor";
import { FixtureFilters } from "@/components/matches/fixture-filters";
import { getDashboardCatalog } from "@/lib/service/dashboard.service";

export default async function MatchesPage({ searchParams }: { searchParams: Promise<{ tournament?: string; category?: string; zone?: string; phase?: string; round?: string }> }) {
  const params = await searchParams;
  const [matches, catalog, phases, isManager] = await Promise.all([getFixture(), getDashboardCatalog(), getFixturePhases(), canManageFixture()]);
  const tournamentId = catalog.tournaments.some((item) => item.id === params.tournament) ? params.tournament : undefined;
  const categoryId = tournamentId && catalog.categories.some((item) => item.id === params.category && item.tournament_id === tournamentId) ? params.category : undefined;
  const zoneId = categoryId && catalog.zones.some((item) => item.id === params.zone && item.category_id === categoryId) ? params.zone : undefined;
  const phaseId = phases.some((item) => item.id === params.phase) ? params.phase : undefined;
  const round = zoneId && /^\d+$/.test(params.round ?? "") ? Number(params.round) : undefined;
  const filteredMatches = matches.filter((match) => (!tournamentId || match.tournamentId === tournamentId) && (!categoryId || match.categoryId === categoryId) && (!zoneId || match.zoneId === zoneId) && (!phaseId || match.phaseId === phaseId) && (!round || match.round === round));
  const rounds = [...new Set(matches.filter((match) => (!tournamentId || match.tournamentId === tournamentId) && (!categoryId || match.categoryId === categoryId) && (!zoneId || match.zoneId === zoneId) && (!phaseId || match.phaseId === phaseId)).map((match) => match.round).filter((item): item is number => item !== null))].sort((a, b) => a - b);
  const setup = isManager ? await getFixtureSetup() : null;
  const brackets = isManager ? await getPlayoffBrackets() : [];
  const filterKey = [tournamentId, categoryId, zoneId, phaseId, round].filter(Boolean).join("-");
  return <AppShell><div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold tracking-[.18em] text-[var(--ea-gold)]">COMPETENCIA</p><h1 className="mt-1 text-3xl text-white">Fixture</h1><p className="mt-1 text-sm text-stone-400">Calendario general de partidos y resultados.</p></div>{isManager && setup && <div className="flex flex-wrap gap-2"><RegularFixtureGenerator setup={setup} /><PlayoffBracketManager setup={setup} brackets={brackets} /><FixtureManagement setup={setup} /></div>}</div><FixtureFilters key={filterKey} catalog={catalog} phases={phases} rounds={rounds} filter={{ tournamentId, categoryId, zoneId, phaseId, round: round ? String(round) : undefined }} /><section className="ea-panel overflow-hidden rounded-lg"><div className="flex items-center justify-between border-b border-[var(--ea-border)] p-5"><h2 className="ea-heading text-xl">Partidos programados</h2><span className="rounded bg-[#2b2010] px-3 py-1 text-sm text-[var(--ea-gold)]">{filteredMatches.length} encuentros</span></div>{filteredMatches.length ? <div className="divide-y divide-[var(--ea-border)]">{filteredMatches.map((match) => <article key={match.id} className="grid gap-3 p-5 lg:grid-cols-[9rem_1fr_auto_1fr_12rem]"><div className="text-sm"><p className="font-semibold text-[var(--ea-gold-soft)]">{match.phaseName ?? "Fase"} · Fecha {match.round ?? "-"}</p><p className="mt-1 text-stone-400">{match.match_date ? new Date(`${match.match_date}T00:00:00`).toLocaleDateString("es-AR") : "Pendiente de programación"}</p><p className="text-stone-500">{match.kickoff_time?.slice(0, 5) ?? "--:--"}</p></div><strong className="self-center text-right text-base">{match.home_team ?? "Por definir"}</strong><span className="self-center rounded border border-[var(--ea-gold)]/30 px-3 py-1 text-center font-bold text-[var(--ea-gold)]">{match.home_score ?? 0} - {match.away_score ?? 0}</span><strong className="self-center text-base">{match.away_team ?? "Por definir"}</strong><div className="self-center text-xs text-stone-500"><p className="flex gap-1"><MapPin size={14} />{match.field ?? "Cancha a definir"}</p><p className="mt-1 flex gap-1"><UserRound size={14} />{match.referee ?? "Sin arbitro"}</p>{isManager && setup && <FixtureScheduleEditor match={match} setup={setup} />}<Link href={`/matches/${match.id}`} className="mt-3 block font-semibold text-[var(--ea-gold)] hover:text-[var(--ea-gold-soft)]">Planilla y eventos</Link></div></article>)}</div> : <Empty text="No hay partidos para los filtros seleccionados." />}</section></div></AppShell>;
}
function Empty({ text }: { text: string }) { return <div className="grid min-h-60 place-items-center p-8 text-center"><div><CalendarDays className="mx-auto h-9 w-9 text-[var(--ea-gold)]" /><p className="mt-3 text-sm text-stone-400">{text}</p></div></div>; }
