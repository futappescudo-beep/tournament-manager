import Link from "next/link";
import { CalendarDays, MapPin, UserRound } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { canManageFixture, getFixture, getFixturePhases, getFixtureSetup, type FixtureMatch } from "@/lib/service/competition.service";
import { FixtureManagement } from "@/components/matches/fixture-management";
import { PlayoffBracketManager } from "@/components/matches/playoff-bracket-manager";
import { RegularFixtureGenerator } from "@/components/matches/regular-fixture-generator";
import { FixtureScheduleEditor } from "@/components/matches/fixture-schedule-editor";
import { FixtureFilters } from "@/components/matches/fixture-filters";
import { PlayoffFilters } from "@/components/matches/playoff-filters";
import { getDashboardCatalog } from "@/lib/service/dashboard.service";
import { getPlayoffBrackets } from "@/lib/service/playoffs.service";
import { PlayoffBracketBoard } from "@/components/matches/playoff-bracket-board";
import { PLAYOFF_STAGES, type PlayoffStage } from "@/lib/constants/playoffs";

type FixtureSearchParams = { tournament?: string; category?: string; zone?: string; phase?: string; round?: string; stage?: string; tab?: string; view?: string };
type Setup = Awaited<ReturnType<typeof getFixtureSetup>> | null;

function MatchRow({ match, isManager, setup }: { match: FixtureMatch; isManager: boolean; setup: Setup }) {
  return <article className="grid gap-3 p-5 lg:grid-cols-[9rem_1fr_auto_1fr_12rem]"><div className="text-sm"><p className="font-semibold text-[var(--ea-gold-soft)]">{match.phaseName ?? "Fase"} · Fecha {match.round ?? "-"}</p><p className="mt-1 text-stone-400">{match.match_date ? new Date(`${match.match_date}T00:00:00`).toLocaleDateString("es-AR") : "Pendiente de programación"}</p><p className="text-stone-500">{match.kickoff_time?.slice(0, 5) ?? "--:--"}</p></div><strong className="self-center text-right text-base">{match.home_team ?? "Por definir"}</strong><span className="self-center rounded border border-[var(--ea-gold)]/30 px-3 py-1 text-center font-bold text-[var(--ea-gold)]">{match.home_score ?? 0} - {match.away_score ?? 0}</span><strong className="self-center text-base">{match.away_team ?? "Por definir"}</strong><div className="self-center text-xs text-stone-500"><p className="flex gap-1"><MapPin size={14} />{match.field ?? "Cancha a definir"}</p><p className="mt-1 flex gap-1"><UserRound size={14} />{match.referee ?? "Sin árbitro"}</p>{isManager && setup && <FixtureScheduleEditor match={match} setup={setup} />}<Link href={`/matches/${match.id}`} className="mt-3 block font-semibold text-[var(--ea-gold)] hover:text-[var(--ea-gold-soft)]">Planilla y eventos</Link></div></article>;
}

export default async function MatchesPage({ searchParams }: { searchParams: Promise<FixtureSearchParams> }) {
  const params = await searchParams;
  const agenda = params.view === "agenda";
  const playoffTab = params.tab === "playoffs";
  const [matches, catalog, phases, isManager, brackets] = await Promise.all([getFixture(), getDashboardCatalog(), getFixturePhases(), canManageFixture(), getPlayoffBrackets()]);
  const tournamentId = catalog.tournaments.some((item) => item.id === params.tournament) ? params.tournament : undefined;
  const categoryId = tournamentId && catalog.categories.some((item) => item.id === params.category && item.tournament_id === tournamentId) ? params.category : undefined;
  const zoneId = categoryId && catalog.zones.some((item) => item.id === params.zone && item.category_id === categoryId) ? params.zone : undefined;
  const phaseId = phases.some((item) => item.id === params.phase) ? params.phase : undefined;
  const selectedStage = PLAYOFF_STAGES.includes(params.stage as PlayoffStage) ? params.stage as PlayoffStage : undefined;
  const round = categoryId && /^\d+$/.test(params.round ?? "") ? Number(params.round) : undefined;
  const regularPhases = phases.filter((phase) => !phase.is_elimination);
  const regularPhaseIds = new Set(regularPhases.map((phase) => phase.id));
  const regularMatches = matches.filter((match) => regularPhaseIds.has(match.phaseId ?? ""));
  const filteredRegularMatches = regularMatches.filter((match) => (!tournamentId || match.tournamentId === tournamentId) && (!categoryId || match.categoryId === categoryId) && (!zoneId || match.zoneId === zoneId) && (!phaseId || match.phaseId === phaseId) && (!round || match.round === round));
  const rounds = [...new Set(regularMatches.filter((match) => (!tournamentId || match.tournamentId === tournamentId) && (!categoryId || match.categoryId === categoryId) && (!zoneId || match.zoneId === zoneId) && (!phaseId || match.phaseId === phaseId)).map((match) => match.round).filter((item): item is number => item !== null))].sort((a, b) => a - b);
  const filteredBrackets = brackets.filter((bracket) => (!tournamentId || bracket.tournamentId === tournamentId) && (!categoryId || bracket.categoryId === categoryId) && (!selectedStage || bracket.matches.some((match) => match.stageName === selectedStage)));
  const scheduled = matches.filter((match) => Boolean(match.match_date && match.kickoff_time)).sort((a, b) => `${a.match_date} ${a.kickoff_time}`.localeCompare(`${b.match_date} ${b.kickoff_time}`));
  const setup = isManager ? await getFixtureSetup() : null;
  const filterKey = [tournamentId, categoryId, zoneId, phaseId, round].filter(Boolean).join("-");

  return <AppShell><div className="space-y-6"><header><p className="text-xs font-bold tracking-[.18em] text-[var(--ea-gold)]">COMPETENCIA</p><div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="mt-1 text-3xl text-white">Fixture</h1><p className="mt-1 text-sm text-stone-400">Cruces, programación y resultados del torneo.</p></div><Link href="/matches?view=agenda" className="rounded-md border border-[var(--ea-gold)]/50 px-3 py-2 text-sm font-bold text-[var(--ea-gold)] hover:bg-[var(--ea-gold)]/10">Partidos programados</Link></div></header>{agenda ? <Agenda matches={scheduled} isManager={isManager} setup={setup} /> : <><nav className="flex border-b border-[var(--ea-border)]"><Link href="/matches?tab=regular" className={`px-4 py-3 text-sm font-bold ${!playoffTab ? "border-b-2 border-[var(--ea-gold)] text-[var(--ea-gold)]" : "text-stone-400 hover:text-white"}`}>Fase regular</Link><Link href="/matches?tab=playoffs" className={`px-4 py-3 text-sm font-bold ${playoffTab ? "border-b-2 border-[var(--ea-gold)] text-[var(--ea-gold)]" : "text-stone-400 hover:text-white"}`}>Play Off</Link></nav>{playoffTab ? <PlayoffsView catalog={catalog} tournamentId={tournamentId} categoryId={categoryId} selectedStage={selectedStage} brackets={filteredBrackets} isManager={isManager} setup={setup} /> : <RegularView catalog={catalog} phases={regularPhases} rounds={rounds} filterKey={filterKey} filter={{ tournamentId, categoryId, zoneId, phaseId, round: round ? String(round) : undefined }} matches={filteredRegularMatches} isManager={isManager} setup={setup} />}</>}</div></AppShell>;
}

function RegularView({ catalog, phases, rounds, filterKey, filter, matches, isManager, setup }: { catalog: Awaited<ReturnType<typeof getDashboardCatalog>>; phases: Awaited<ReturnType<typeof getFixturePhases>>; rounds: number[]; filterKey: string; filter: { tournamentId?: string; categoryId?: string; zoneId?: string; phaseId?: string; round?: string }; matches: FixtureMatch[]; isManager: boolean; setup: Setup }) {
  return <><FixtureFilters key={filterKey} catalog={catalog} phases={phases} rounds={rounds} filter={filter} />{isManager && setup && <section className="ea-panel flex flex-wrap items-center justify-between gap-4 rounded-lg p-4"><div><p className="text-xs font-bold tracking-[.16em] text-[var(--ea-gold)]">GESTIÓN DE LA FASE REGULAR</p><p className="mt-1 text-sm text-stone-400">Generá los cruces de cada zona y programalos cuando tengas día, hora y cancha.</p></div><RegularFixtureGenerator setup={setup} /></section>}<FixtureList title="Partidos de fase regular" description="Cada zona mantiene sus propias fechas." matches={matches} isManager={isManager} setup={setup} />{isManager && setup && <section className="flex justify-end"><FixtureManagement setup={setup} /></section>}</>;
}

function PlayoffsView({ catalog, tournamentId, categoryId, selectedStage, brackets, isManager, setup }: { catalog: Awaited<ReturnType<typeof getDashboardCatalog>>; tournamentId?: string; categoryId?: string; selectedStage?: PlayoffStage; brackets: Awaited<ReturnType<typeof getPlayoffBrackets>>; isManager: boolean; setup: Setup }) {
  return <><PlayoffFilters catalog={catalog} filter={{ tournamentId, categoryId, stage: selectedStage }} />{isManager && setup && <section className="ea-panel flex flex-wrap items-center justify-between gap-4 rounded-lg p-4"><div><p className="text-xs font-bold tracking-[.16em] text-[var(--ea-gold)]">GESTIÓN DE PLAY OFF</p><p className="mt-1 text-sm text-stone-400">Diseñá las llaves por instancia. Los cruces con dos equipos se publican sin fecha para programarlos después.</p></div><PlayoffBracketManager setup={setup} compact /></section>}<PlayoffBracketBoard brackets={brackets} selectedStage={selectedStage} canManage={isManager} /></>;
}

function Agenda({ matches, isManager, setup }: { matches: FixtureMatch[]; isManager: boolean; setup: Setup }) { return <FixtureList title="Partidos programados" description="Todos los encuentros con día y hora asignados, sin importar torneo, categoría o zona." matches={matches} isManager={isManager} setup={setup} empty="Todavía no hay partidos con día y hora programados." />; }
function FixtureList({ title, description, matches, isManager, setup, empty = "No hay partidos para los filtros seleccionados." }: { title: string; description: string; matches: FixtureMatch[]; isManager: boolean; setup: Setup; empty?: string }) { return <section className="ea-panel overflow-hidden rounded-lg"><div className="flex items-center justify-between border-b border-[var(--ea-border)] p-5"><div><h2 className="ea-heading text-xl">{title}</h2><p className="mt-1 text-sm text-stone-400">{description}</p></div><span className="rounded bg-[#2b2010] px-3 py-1 text-sm text-[var(--ea-gold)]">{matches.length} encuentros</span></div>{matches.length ? <div className="divide-y divide-[var(--ea-border)]">{matches.map((match) => <MatchRow key={match.id} match={match} isManager={isManager} setup={setup} />)}</div> : <Empty text={empty} />}</section>; }
function Empty({ text }: { text: string }) { return <div className="grid min-h-60 place-items-center p-8 text-center"><div><CalendarDays className="mx-auto h-9 w-9 text-[var(--ea-gold)]" /><p className="mt-3 text-sm text-stone-400">{text}</p></div></div>; }
