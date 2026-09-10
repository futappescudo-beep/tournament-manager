import { Trophy } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { getDashboardCatalog, getDashboardData } from "@/lib/service/dashboard.service";
import { goalDifference, points } from "@/lib/service/competition.service";

export default async function StandingsPage({ searchParams }: { searchParams: Promise<{ tournament?: string; category?: string; zone?: string }> }) {
  const params = await searchParams;
  const catalog = await getDashboardCatalog();
  const tournamentId = catalog.tournaments.some((item) => item.id === params.tournament) ? params.tournament : undefined;
  const categoryId = tournamentId && catalog.categories.some((item) => item.id === params.category && item.tournament_id === tournamentId) ? params.category : undefined;
  const zoneId = categoryId && catalog.zones.some((item) => item.id === params.zone && item.category_id === categoryId) ? params.zone : undefined;
  const filter = { tournamentId, categoryId, zoneId };
  const { standings } = await getDashboardData(filter, 0);
  const tournament = catalog.tournaments.find((item) => item.id === tournamentId)?.name;
  const category = catalog.categories.find((item) => item.id === categoryId)?.name;
  const zone = catalog.zones.find((item) => item.id === zoneId)?.name;
  const scope = [tournament, category, zone].filter(Boolean).join(" · ") || "Todos los torneos";
  return <AppShell><div className="space-y-6"><div><p className="text-xs font-bold tracking-[.18em] text-[var(--ea-gold)]">COMPETENCIA</p><h1 className="mt-1 text-3xl text-white">Tabla de posiciones</h1><p className="mt-1 text-sm text-stone-400">3 puntos por victoria, 1 por empate.</p></div><DashboardFilters catalog={catalog} filter={filter} path="/standings" idPrefix="standings" /><p className="text-sm text-stone-400">{scope}</p><section className="ea-panel overflow-hidden rounded-lg"><div className="flex items-center gap-3 border-b border-[var(--ea-border)] p-5"><Trophy className="text-[var(--ea-gold)]" /><h2 className="ea-heading text-xl">Clasificación</h2></div>{standings.length ? <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm"><thead className="border-b border-[var(--ea-border)] text-left text-xs uppercase tracking-wider text-stone-500"><tr><th className="p-4">#</th><th>Equipo</th><th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>GF</th><th>GC</th><th>DG</th><th className="text-[var(--ea-gold)]">Pts</th></tr></thead><tbody>{standings.map((standing, index) => <tr key={standing.team_registration_id ?? index} className="border-b border-[var(--ea-border)]/70"><td className="p-4"><span className="inline-grid h-6 w-6 place-items-center rounded bg-[#2f6e29] font-bold text-white">{index + 1}</span></td><td className="font-semibold">{standing.display_name ?? "Equipo"}</td><td>{standing.played ?? 0}</td><td>{standing.won ?? 0}</td><td>{standing.drawn ?? 0}</td><td>{standing.lost ?? 0}</td><td>{standing.goals_for ?? 0}</td><td>{standing.goals_against ?? 0}</td><td>{goalDifference(standing)}</td><td className="font-bold text-[var(--ea-gold-soft)]">{points(standing)}</td></tr>)}</tbody></table></div> : <div className="grid min-h-60 place-items-center p-8 text-center"><p className="text-sm text-stone-400">No hay posiciones para los filtros seleccionados.</p></div>}</section></div></AppShell>;
}
