"use client";

import { useMemo, useState } from "react";

import type {
  CategoryOption,
  Team,
} from "@/lib/types/team";

import {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
} from "@/lib/actions/teams";
import type { TeamFormValues } from "@/lib/validations/teams";
// DeleteTeamDialog not used here
import { Button } from "@/components/ui/button";

import { TeamDialog } from "./team-dialog";
import { TeamTable } from "./team-table";
 
import { toast } from "sonner";

interface TeamPageClientProps {
  teams: Team[];
  categories: CategoryOption[];
}

export function TeamPageClient({
  teams: initialTeams,
  categories,
}: TeamPageClientProps) {
  const [teams, setTeams] =
    useState<Team[]>(initialTeams);

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [selectedTeam, setSelectedTeam] =
    useState<Team | null>(null);

  const [tournamentName, setTournamentName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [zoneId, setZoneId] = useState("");

  const tournaments = useMemo(() => [...new Set(categories.map((category) => category.tournament_name))].sort((a, b) => a.localeCompare(b, "es-AR")), [categories]);
  const visibleCategories = useMemo(() => categories.filter((category) => !tournamentName || category.tournament_name === tournamentName), [categories, tournamentName]);
  const selectedCategory = useMemo(() => visibleCategories.find((category) => category.id === categoryId), [visibleCategories, categoryId]);
  const assignedTeams = useMemo(() => teams.filter((team) => team.active && team.team_category_registrations.some((registration) => (!categoryId || registration.category_id === categoryId) && (!zoneId || registration.zone_id === zoneId))), [teams, categoryId, zoneId]);

  const sortedTeams = useMemo(
    () =>
      [...assignedTeams].sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    [assignedTeams]
  );


  const handleNew = () => {
    setSelectedTeam(null);
    setDialogOpen(true);
  };

  const handleEdit = (team: Team) => {
    setSelectedTeam(team);
    setDialogOpen(true);
  };

const handleDelete = async (team: Team) => {
  const confirmed = window.confirm(
    `¿Eliminar el equipo "${team.name}"?`
  );

  if (!confirmed) return;

  try {
    setLoading(true);

    await deleteTeam(team.id);

    toast.success("Equipo eliminado correctamente.");

    await refreshTeams();
  } catch (error) {
    console.error(error);

    toast.error("No fue posible eliminar el equipo.");
  } finally {
    setLoading(false);
  }
};


const refreshTeams = async () => {
  const data = await getTeams();
  setTeams(data);
};

// Using the service functions (getTeams, createTeam, updateTeam) imported above.

const handleSave = async (
  values: TeamFormValues
) => {
  try {
    setLoading(true);

    if (selectedTeam) {
      const result = await updateTeam(selectedTeam.id, values);
      if (result.error) throw new Error(result.error);

      toast.success("Equipo actualizado correctamente.");
    } else {
      await createTeam(values);

      toast.success("Equipo creado correctamente.");
    }

    await refreshTeams();

    setDialogOpen(false);
    setSelectedTeam(null);
  } catch (error) {
    console.error(error);
    toast.error(error instanceof Error ? error.message : "No fue posible guardar el equipo.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            Equipos
          </h1>

          <p className="text-muted-foreground">
            Administración de equipos
          </p>
        </div>

        <Button onClick={handleNew}>
          Nuevo equipo
        </Button>

      </div>

      <section className="ea-panel rounded-lg p-4">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-semibold text-white">Equipos por zona</h2><p className="mt-1 text-sm text-stone-400">Consultá qué equipos activos están inscriptos en cada zona del torneo vigente.</p></div><p className="rounded bg-[#2b2010] px-3 py-1 text-sm font-semibold text-[var(--ea-gold)]">{assignedTeams.length} equipo{assignedTeams.length === 1 ? "" : "s"}</p></div>
        <div className="mt-4 grid gap-3 md:grid-cols-3"><select aria-label="Filtrar torneo" value={tournamentName} onChange={(event) => { setTournamentName(event.target.value); setCategoryId(""); setZoneId(""); }}><option value="">Todos los torneos activos</option>{tournaments.map((name) => <option key={name} value={name}>{name}</option>)}</select><select aria-label="Filtrar categoría" disabled={!tournamentName} value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setZoneId(""); }}><option value="">{tournamentName ? "Todas las categorías" : "Elegí primero un torneo"}</option>{visibleCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><select aria-label="Filtrar zona" disabled={!categoryId} value={zoneId} onChange={(event) => setZoneId(event.target.value)}><option value="">{categoryId ? "Todas las zonas" : "Elegí primero una categoría"}</option>{selectedCategory?.zones.map((zone) => <option key={zone.id} value={zone.id}>{zone.name}</option>)}</select></div>
        <div className="mt-4 flex flex-wrap gap-2">{assignedTeams.length ? assignedTeams.map((team) => <span key={team.id} className="rounded-md border border-[var(--ea-border)] bg-black/20 px-3 py-2 text-sm text-stone-200">{team.name}</span>) : <p className="text-sm text-stone-500">No hay equipos activos asignados para este filtro.</p>}</div>
      </section>

      <TeamTable
        data={sortedTeams}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <TeamDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);

          if (!open) {
            setSelectedTeam(null);
          }
        }}
        categories={categories}
        team={selectedTeam}
        loading={loading}
        onSave={handleSave}
      />

    </div>
  );
}
