"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PublicCompetitionCatalog } from "@/lib/service/competition.service";

type Props = {
  catalog: PublicCompetitionCatalog;
  view: string;
  tournamentId?: string;
  categoryId?: string;
  zoneId?: string;
};

export function GuestCompetitionFilters({ catalog, view, tournamentId: initialTournamentId, categoryId: initialCategoryId, zoneId: initialZoneId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tournamentId, setTournamentId] = useState(initialTournamentId ?? "");
  const [categoryId, setCategoryId] = useState(initialCategoryId ?? "");
  const [zoneId, setZoneId] = useState(initialZoneId ?? "");
  const categories = useMemo(() => catalog.categories.filter((category) => category.tournamentId === tournamentId), [catalog.categories, tournamentId]);
  const zones = useMemo(() => catalog.zones.filter((zone) => zone.categoryId === categoryId), [catalog.zones, categoryId]);

  function navigate(next: { tournamentId?: string; categoryId?: string; zoneId?: string }) {
    const params = new URLSearchParams({ view });
    if (next.tournamentId) params.set("tournament", next.tournamentId);
    if (next.categoryId) params.set("category", next.categoryId);
    if (next.zoneId) params.set("zone", next.zoneId);
    startTransition(() => router.push(`/public?${params.toString()}`));
  }

  return <div className="ea-panel grid gap-3 rounded-lg p-4 md:grid-cols-3">
    <label className="grid gap-2 text-sm font-medium">Torneo
      <select value={tournamentId} onChange={(event) => { const value = event.target.value; setTournamentId(value); setCategoryId(""); setZoneId(""); navigate({ tournamentId: value }); }}>
        <option value="">Todos los torneos</option>{catalog.tournaments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
    </label>
    <label className="grid gap-2 text-sm font-medium">Categoría
      <select disabled={!tournamentId} value={categoryId} onChange={(event) => { const value = event.target.value; setCategoryId(value); setZoneId(""); navigate({ tournamentId, categoryId: value }); }}>
        <option value="">{tournamentId ? "Todas las categorías" : "Elegí primero un torneo"}</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
    </label>
    <label className="grid gap-2 text-sm font-medium">Zona
      <select disabled={!categoryId} value={zoneId} onChange={(event) => { const value = event.target.value; setZoneId(value); navigate({ tournamentId, categoryId, zoneId: value }); }}>
        <option value="">{categoryId ? "Todas las zonas" : "Elegí primero una categoría"}</option>{zones.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
    </label>
    <p className="text-right text-xs text-stone-500 md:col-span-3" aria-live="polite">{isPending ? "Actualizando datos…" : "Orden de filtro: Torneo → Categoría → Zona."}</p>
  </div>;
}
