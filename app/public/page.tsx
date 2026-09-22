import Link from "next/link";
import { CalendarDays, ClipboardCheck, FileText, Goal, LayoutDashboard, LogIn, ShieldAlert, Trophy } from "lucide-react";
import { getPublicFixture, getPublicStandings, getPublicSuspensions, getPublicTopScorers, goalDifference, points } from "@/lib/service/competition.service";

const guestViews = [
  { key: "principal", label: "Principal", icon: LayoutDashboard },
  { key: "fixture", label: "Fixture", icon: CalendarDays },
  { key: "resultados", label: "Resultados", icon: ClipboardCheck },
  { key: "posiciones", label: "Posiciones", icon: Trophy },
  { key: "goleadores", label: "Goleadores", icon: Goal },
  { key: "sanciones", label: "Sanciones", icon: ShieldAlert },
  { key: "reglamento", label: "Reglamento", icon: FileText },
] as const;

type GuestView = (typeof guestViews)[number]["key"];
type PublicFixture = Awaited<ReturnType<typeof getPublicFixture>>;
type PublicStandings = Awaited<ReturnType<typeof getPublicStandings>>;

function isGuestView(value: string | undefined): value is GuestView {
  return guestViews.some((item) => item.key === value);
}

export default async function PublicCompetitionPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const params = await searchParams;
  const view: GuestView = isGuestView(params.view) ? params.view : "principal";
  const [fixtureResult, standingsResult, scorersResult, suspensionsResult] = await Promise.allSettled([getPublicFixture(), getPublicStandings(), getPublicTopScorers(), getPublicSuspensions()]);
  const fixture = fixtureResult.status === "fulfilled" ? fixtureResult.value : [];
  const standings = standingsResult.status === "fulfilled" ? standingsResult.value : [];
  const scorers = scorersResult.status === "fulfilled" ? scorersResult.value : [];
  const suspensions = suspensionsResult.status === "fulfilled" ? suspensionsResult.value : [];
  const hasLoadError = [fixtureResult, standingsResult, scorersResult, suspensionsResult].some((result) => result.status === "rejected");
  const scheduledMatches = fixture.filter((match) => Boolean(match.match_date || match.kickoff_time));
  const results = fixture.filter((match) => match.home_score !== null || match.away_score !== null);

  return <main className="min-h-screen bg-[radial-gradient(circle_at_80%_-10%,rgba(100,8,11,.28),transparent_26rem),#090a0a] text-foreground lg:grid lg:grid-cols-[16rem_1fr]">
    <aside className="border-b border-[var(--ea-border)] bg-[linear-gradient(180deg,#0b0c0c,#11100f)] lg:min-h-screen lg:border-b-0 lg:border-r">
      <div className="border-b border-[var(--ea-border)] p-5"><p className="ea-heading text-xl text-white">Escudo Amistad</p><p className="mt-1 text-[11px] uppercase tracking-[.14em] text-stone-500">Modo invitado · Solo lectura</p></div>
      <nav className="flex gap-1 overflow-x-auto p-3 lg:block lg:space-y-1">{guestViews.map(({ key, label, icon: Icon }) => <Link key={key} href={`/public?view=${key}`} className={`inline-flex shrink-0 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition lg:flex ${view === key ? "bg-[#a70e15] text-white" : "text-stone-300 hover:bg-white/5 hover:text-white"}`}><Icon size={18} />{label}</Link>)}</nav>
    </aside>
    <section className="min-w-0">
      <header className="flex min-h-16 items-center justify-between border-b border-[var(--ea-border)] bg-[#0e0f0f]/95 px-4 md:px-8"><div><p className="ea-heading text-lg text-white">Información del torneo</p><p className="text-xs text-stone-500">Consulta pública</p></div><Link href="/login" className="inline-flex items-center gap-2 rounded-md border border-[var(--ea-border)] px-3 py-2 text-sm font-semibold text-[var(--ea-gold-soft)] hover:border-[var(--ea-gold)]"><LogIn size={16} />Ingresar</Link></header>
      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
        <div><p className="text-xs font-bold tracking-[.18em] text-[var(--ea-gold)]">MODO INVITADO</p><h1 className="mt-1 text-3xl text-white md:text-4xl">{guestViews.find((item) => item.key === view)?.label}</h1><p className="mt-2 text-sm text-stone-400">Misma consulta pública que un jugador, sin opciones de edición.</p></div>
        {hasLoadError && <p className="rounded-md border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">La información pública todavía se está habilitando. Ejecutá la migración <code>20260928_guest_read_only_access.sql</code> en Supabase y recargá esta página.</p>}
        {(view === "principal" || view === "fixture") && <MatchPanel title="Partidos programados" matches={scheduledMatches} />}
        {(view === "principal" || view === "resultados") && <MatchPanel title="Resultados" matches={results} emptyMessage="Todavía no hay resultados cargados." />}
        {(view === "principal" || view === "posiciones") && <StandingsPanel standings={standings} />}
        {view === "goleadores" && <section className="ea-panel overflow-hidden rounded-lg"><PanelHeading icon={Goal} title="Tabla de goleadores" />{scorers.length ? <table className="w-full text-sm"><thead className="border-b border-[var(--ea-border)] text-left text-xs uppercase text-stone-500"><tr><th className="p-4">#</th><th>Jugador</th><th>Goles</th></tr></thead><tbody>{scorers.map((scorer, index) => <tr key={scorer.id} className="border-b border-[var(--ea-border)]/70"><td className="p-4">{index + 1}</td><td className="font-semibold">{scorer.first_name} {scorer.last_name}</td><td className="font-bold text-[var(--ea-gold-soft)]">{scorer.goals ?? 0}</td></tr>)}</tbody></table> : <EmptyMessage text="Todavía no hay goles registrados." />}</section>}
        {view === "sanciones" && <section className="ea-panel overflow-hidden rounded-lg"><PanelHeading icon={ShieldAlert} title="Sanciones" />{suspensions.length ? <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-sm"><thead className="border-b border-[var(--ea-border)] text-left text-xs uppercase text-stone-500"><tr><th className="p-4">Jugador</th><th>Amarillas</th><th>Rojas</th><th>Suspensiones</th></tr></thead><tbody>{suspensions.map((item, index) => <tr key={`${item.first_name}-${item.last_name}-${index}`} className="border-b border-[var(--ea-border)]/70"><td className="p-4 font-semibold">{item.first_name} {item.last_name}</td><td>{item.yellow_cards ?? 0}</td><td className="text-red-300">{item.red_cards ?? 0}</td><td>{(item.automatic_suspensions ?? 0) + (item.manual_suspensions ?? 0)}</td></tr>)}</tbody></table></div> : <EmptyMessage text="No hay sanciones activas." />}</section>}
        {view === "reglamento" && <section className="ea-panel rounded-lg p-6"><PanelHeading icon={FileText} title="Reglamento" /><ul className="mt-5 space-y-4 text-sm text-stone-300"><li><strong className="text-white">Victoria:</strong> 3 puntos.</li><li><strong className="text-white">Empate:</strong> 1 punto.</li><li><strong className="text-white">Derrota:</strong> 0 puntos.</li><li><strong className="text-white">Disciplina:</strong> 5 amarillas generan suspensión automática.</li></ul></section>}
      </div>
    </section>
  </main>;
}

function PanelHeading({ icon: Icon, title }: { icon: typeof Trophy; title: string }) { return <div className="flex items-center gap-3 border-b border-[var(--ea-border)] p-5"><Icon className="text-[var(--ea-gold)]" /><h2 className="ea-heading text-xl">{title}</h2></div>; }
function EmptyMessage({ text }: { text: string }) { return <p className="p-8 text-center text-sm text-stone-500">{text}</p>; }
function MatchPanel({ title, matches, emptyMessage = "Todavía no hay partidos publicados." }: { title: string; matches: PublicFixture; emptyMessage?: string }) { return <section className="ea-panel overflow-hidden rounded-lg"><PanelHeading icon={CalendarDays} title={title} />{matches.length ? <div className="divide-y divide-[var(--ea-border)]">{matches.map((match) => <div key={match.id} className="grid grid-cols-[5rem_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 p-4 text-sm"><div className="text-xs text-stone-400"><p>Fecha {match.round ?? "-"}</p><p>{match.match_date ? new Date(`${match.match_date}T00:00:00`).toLocaleDateString("es-AR") : "A confirmar"}</p><p>{match.kickoff_time?.slice(0, 5) ?? ""}</p></div><strong className="truncate text-right">{match.home_team ?? "Por definir"}</strong><span className="rounded border border-[var(--ea-gold)]/30 px-2 py-1 text-center font-bold text-[var(--ea-gold)]">{match.home_score ?? "–"} - {match.away_score ?? "–"}</span><strong className="truncate">{match.away_team ?? "Por definir"}</strong></div>)}</div> : <EmptyMessage text={emptyMessage} />}</section>; }
function StandingsPanel({ standings }: { standings: PublicStandings }) { return <section className="ea-panel overflow-hidden rounded-lg"><PanelHeading icon={Trophy} title="Tabla de posiciones" />{standings.length ? <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-sm"><thead className="border-b border-[var(--ea-border)] text-left text-xs uppercase tracking-wider text-stone-500"><tr><th className="p-4">#</th><th>Equipo</th><th>PJ</th><th>DG</th><th className="text-[var(--ea-gold)]">Pts</th></tr></thead><tbody>{standings.map((standing, index) => <tr key={standing.team_registration_id ?? index} className="border-b border-[var(--ea-border)]/70"><td className="p-4 font-semibold">{index + 1}</td><td className="font-semibold">{standing.display_name ?? "Equipo"}</td><td>{standing.played ?? 0}</td><td>{goalDifference(standing)}</td><td className="font-bold text-[var(--ea-gold-soft)]">{points(standing)}</td></tr>)}</tbody></table></div> : <EmptyMessage text="La tabla estará disponible cuando existan equipos inscriptos." />}</section>; }
