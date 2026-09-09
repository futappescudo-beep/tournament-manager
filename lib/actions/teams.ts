"use server";

import { revalidatePath } from "next/cache";

import {
  teamSchema,
  type TeamFormValues,
} from "@/lib/validations/teams";

import * as TeamService from "@/lib/service/team.service";

export async function getTeams() {
  return await TeamService.getTeams();
}

export async function createTeam(
  values: TeamFormValues
) {
  const data = teamSchema.parse(values);

  const team = await TeamService.createTeam(data);

  revalidatePath("/teams");
  revalidatePath("/dashboard");

  return team;
}

export async function updateTeam(
  id: string,
  values: TeamFormValues
) {
  try {
    const data = teamSchema.parse(values);
    await TeamService.updateTeam(id, data);
    revalidatePath("/teams");
    revalidatePath("/dashboard");
    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo guardar el equipo." };
  }
}

export async function deleteTeam(id: string) {
  await TeamService.deleteTeam(id);

  revalidatePath("/teams");
  revalidatePath("/dashboard");
  revalidatePath("/players");
}
