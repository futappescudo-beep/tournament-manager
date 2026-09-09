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

  const sortedTeams = useMemo(
    () =>
      [...teams].sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    [teams]
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
