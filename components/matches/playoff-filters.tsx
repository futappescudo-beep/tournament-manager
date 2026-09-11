"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DashboardCatalog } from "@/lib/service/dashboard.service";
import { PLAYOFF_STAGES } from "@/lib/constants/playoffs";

type Filter = { tournamentId?: string; categoryId?: string; stage?: string };

export function PlayoffFilters({ catalog, filter }: { catalog: DashboardCatalog; filter: Filter }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [tournamentId, setTournamentId] = useState(filter.tournamentId ?? "");
  const [categoryId, setCategoryId] = useState(filter.categoryId ?? "");
  const [stage, setStage] = useState(filter.stage ?? "");
  const categories = useMemo(() => catalog.categories.filter((category) => category.tournament_id === tournamentId), [catalog.categories, tournamentId]);

  function navigate(next: Filter) {
    const params = new URLSearchParams({ tab: "playoffs" });
    if (next.tournamentId) params.set("tournament", next.tournamentId);
    if (next.categoryId) params.set("category", next.categoryId);
    if (next.stage) params.set("stage", next.stage);
    startTransition(() => router.push(`/matches?${params}`));
  }

  return <div className="ea-panel grid gap-3 rounded-lg p-4 md:grid-cols-3">
    <select aria-label="Torneo" value={tournamentId} onChange={(event) => { const value = event.target.value; setTournamentId(value); setCategoryId(""); navigate({ tournamentId: value, stage }); }}>
      <option value="">Todos los torneos</option>{catalog.tournaments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
    </select>
    <select aria-label="Categoría" disabled={!tournamentId} value={categoryId} onChange={(event) => { const value = event.target.value; setCategoryId(value); navigate({ tournamentId, categoryId: value, stage }); }}>
      <option value="">{tournamentId ? "Todas las categorías" : "Elegí primero un torneo"}</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
    </select>
    <select aria-label="Instancia" value={stage} onChange={(event) => { const value = event.target.value; setStage(value); navigate({ tournamentId, categoryId, stage: value }); }}>
      <option value="">Todas las instancias</option>{PLAYOFF_STAGES.map((item) => <option key={item} value={item}>{item}</option>)}
    </select>
    <p className="md:col-span-3 text-right text-xs text-stone-500">{pending ? "Actualizando…" : "Los Play Off son generales por categoría: no se filtran por zona ni por fecha."}</p>
  </div>;
}
