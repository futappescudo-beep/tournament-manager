"use client";

import { useState } from "react";
import { Plus, Settings2, Trophy } from "lucide-react";
import { toast } from "sonner";
import { createCategory, createTournament } from "@/lib/actions/settings";
import type { CategorySetup, TournamentOption } from "@/lib/service/settings.service";
import type { ProfileOption, RoleOption } from "@/lib/service/settings.service";
import { RoleManagement } from "./role-management";
import { TournamentManagement } from "./tournament-management";

export function TournamentSettingsClient({ tournaments: initialTournaments, categories: initialCategories, profiles, roles }: { tournaments: TournamentOption[]; categories: CategorySetup[]; profiles: ProfileOption[]; roles: RoleOption[] }) {
  const [tournaments, setTournaments] = useState(initialTournaments);
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState<"tournament" | "category" | null>(null);
  const [tournamentName, setTournamentName] = useState("");
  const [season, setSeason] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [zoneCount, setZoneCount] = useState("2");
  const [tournamentId, setTournamentId] = useState(initialTournaments[0]?.id ?? "");

  async function addTournament(event: React.FormEvent) { event.preventDefault(); setLoading("tournament"); try { const tournament = await createTournament({ name: tournamentName, season, description: "" }); setTournaments((current) => [...current, tournament]); setTournamentId(tournament.id); setTournamentName(""); setSeason(""); toast.success("Torneo creado."); } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo crear el torneo."); } finally { setLoading(null); } }
  async function addCategory(event: React.FormEvent) { event.preventDefault(); setLoading("category"); try { const category = await createCategory({ tournament_id: tournamentId, name: categoryName, zone_count: Number(zoneCount) }); setCategories((current) => [...current, category]); setCategoryName(""); toast.success("Categoría y zonas creadas."); } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo crear la categoría."); } finally { setLoading(null); } }

  return <div className="space-y-6"><div><p className="text-xs font-bold tracking-[.18em] text-[var(--ea-gold)]">SUPER ADMINISTRADOR</p><h1 className="mt-1 text-3xl text-white">Configuración del torneo</h1><p className="mt-1 text-sm text-stone-400">Definí torneos y categorías antes de inscribir equipos.</p></div><section className="grid gap-5 lg:grid-cols-2"><article className="ea-panel rounded-lg p-5"><Trophy className="text-[var(--ea-gold)]" /><h2 className="ea-heading mt-3 text-xl">Nuevo torneo</h2><form onSubmit={addTournament} className="mt-4 space-y-3"><input value={tournamentName} onChange={(event) => setTournamentName(event.target.value)} placeholder="Ej. Apertura 2026" /><input value={season} onChange={(event) => setSeason(event.target.value)} placeholder="Temporada (opcional)" /><button disabled={loading !== null} className="inline-flex items-center gap-2 rounded-md bg-[linear-gradient(135deg,#b71920,#77080d)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><Plus size={16} />Crear torneo</button></form></article><article className="ea-panel rounded-lg p-5"><Settings2 className="text-[var(--ea-gold)]" /><h2 className="ea-heading mt-3 text-xl">Nueva categoría</h2><form onSubmit={addCategory} className="mt-4 space-y-3"><select value={tournamentId} onChange={(event) => setTournamentId(event.target.value)}><option value="">Seleccionar torneo</option>{tournaments.map((tournament) => <option key={tournament.id} value={tournament.id}>{tournament.name}{tournament.season ? ` · ${tournament.season}` : ""}</option>)}</select><input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Ej. +30 o Libre" /><select value={zoneCount} onChange={(event) => setZoneCount(event.target.value)}><option value="1">1 zona: Zona A</option><option value="2">2 zonas: Zona A y Zona B</option><option value="3">3 zonas: Zona A, B y C</option><option value="4">4 zonas: Zona A a D</option><option value="5">5 zonas: Zona A a E</option></select><p className="text-xs text-stone-500">Luego definís manualmente el cupo de equipos de cada zona.</p><button disabled={loading !== null || !tournamentId} className="inline-flex items-center gap-2 rounded-md bg-[linear-gradient(135deg,#b71920,#77080d)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><Plus size={16} />Crear categoría y zonas</button></form></article></section><RoleManagement profiles={profiles} roles={roles} /><TournamentManagement initialTournaments={tournaments} initialCategories={categories} /></div>;
}
