import { Goal } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { getTopScorers } from "@/lib/service/competition.service";

export default async function ScorersPage() {
  const scorers = await getTopScorers();
  return <AppShell><div className="space-y-6"><div><p className="text-xs font-bold tracking-[.18em] text-[var(--ea-gold)]">ESTADÍSTICAS</p><h1 className="mt-1 text-3xl text-white">Goleadores</h1><p className="mt-1 text-sm text-stone-400">Ranking actualizado con los goles registrados en las planillas.</p></div><section className="ea-panel overflow-hidden rounded-lg"><div className="flex items-center gap-3 border-b border-[var(--ea-border)] p-5"><Goal className="text-[var(--ea-gold)]" /><h2 className="ea-heading text-xl">Tabla de goleadores</h2></div>{scorers.length ? <table className="w-full text-sm"><thead className="border-b border-[var(--ea-border)] text-left text-xs uppercase tracking-wider text-stone-500"><tr><th className="p-4">#</th><th>Jugador</th><th>Goles</th></tr></thead><tbody>{scorers.map((scorer, index) => <tr key={scorer.id} className="border-b border-[var(--ea-border)]/70"><td className="p-4">{index + 1}</td><td className="font-semibold">{scorer.first_name} {scorer.last_name}</td><td className="font-bold text-[var(--ea-gold-soft)]">{scorer.goals ?? 0}</td></tr>)}</tbody></table> : <p className="p-10 text-center text-sm text-stone-500">Todavía no hay goles registrados.</p>}</section></div></AppShell>;
}
