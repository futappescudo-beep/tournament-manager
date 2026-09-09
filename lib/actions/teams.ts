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
  const data = teamSchema.parse(values);

  await TeamService.updateTeam(id, data);

  revalidatePath("/teams");
  revalidatePath("/dashboard");
}

export async function deleteTeam(id: string) {
  await TeamService.deleteTeam(id);

  revalidatePath("/teams");
  revalidatePath("/dashboard");
}