"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DashboardCatalog, DashboardFilter } from "@/lib/service/dashboard.service";

type Props = { catalog: DashboardCatalog; filter: DashboardFilter };

export function DashboardFilters({ catalog, filter }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tournamentId, setTournamentId] = useState(filter.tournamentId ?? "");
  const [categoryId, setCategoryId] = useState(filter.categoryId ?? "");
  const [zoneId, setZoneId] = useState(filter.zoneId ?? "");

  useEffect(() => {
    setTournamentId(filter.tournamentId ?? "");
    setCategoryId(filter.categoryId ?? "");
    setZoneId(filter.zoneId ?? "");
  }, [filter.tournamentId, filter.categoryId, filter.zoneId]);

  const categories = useMemo(
    () => catalog.categories.filter((category) => !tournamentId || category.tournament_id === tournamentId),
    [catalog.categories, tournamentId],
  );
  const zones = useMemo(() => {
    if (categoryId) return catalog.zones.filter((zone) => zone.category_id === categoryId);
    if (!tournamentId) return catalog.zones;
    const categoryIds = new Set(categories.map((category) => category.id));
    return catalog.zones.filter((zone) => categoryIds.has(zone.category_id));
  }, [catalog.zones, categories, categoryId, tournamentId]);

  function navigate(next: DashboardFilter) {
    const params = new URLSearchParams();
    if (next.tournamentId) params.set("tournament", next.tournamentId);
    if (next.categoryId) params.set("category", next.categoryId);
    if (next.zoneId) params.set("zone", next.zoneId);
    startTransition(() => router.push(`/dashboard${params.size ? `?${params.toString()}` : ""}`));
  }

  return <div className="ea-panel grid gap-3 rounded-lg p-4 md:grid-cols-3">
    <label className="sr-only" htmlFor="dashboard-tournament">Torneo</label>
    <select id="dashboard-tournament" value={tournamentId} onChange={(event) => {
      const value = event.target.value;
      setTournamentId(value); setCategoryId(""); setZoneId("");
      navigate({ tournamentId: value });
    }}>
      <option value="">Todos los torneos</option>
      {catalog.tournaments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
    </select>
    <label className="sr-only" htmlFor="dashboard-category">Categoría</label>
    <select id="dashboard-category" value={categoryId} onChange={(event) => {
      const value = event.target.value;
      setCategoryId(value); setZoneId("");
      navigate({ tournamentId, categoryId: value });
    }}>
      <option value="">Todas las categorías</option>
      {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
    </select>
    <label className="sr-only" htmlFor="dashboard-zone">Zona</label>
    <select id="dashboard-zone" value={zoneId} onChange={(event) => {
      const value = event.target.value;
      setZoneId(value);
      navigate({ tournamentId, categoryId, zoneId: value });
    }}>
      <option value="">Todas las zonas</option>
      {zones.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
    </select>
    <p className="md:col-span-3 text-right text-xs text-stone-500" aria-live="polite">{isPending ? "Actualizando datos…" : "Los filtros se aplican automáticamente."}</p>
  </div>;
}
