"use server";

import { revalidatePath } from "next/cache";
import { categorySchema, deleteProfileSchema, profileRoleSchema, tournamentIdSchema, tournamentSchema, zoneCapacitySchema, zoneSchema, type CategoryValues, type DeleteProfileValues, type ProfileRoleValues, type TournamentValues, type ZoneValues } from "@/lib/validations/settings";
import * as SettingsService from "@/lib/service/settings.service";

export async function createTournament(values: TournamentValues) { const result = await SettingsService.createTournament(tournamentSchema.parse(values)); revalidatePath("/settings"); revalidatePath("/teams"); return result; }
export async function createCategory(values: CategoryValues) { const result = await SettingsService.createCategory(categorySchema.parse(values)); revalidatePath("/settings"); revalidatePath("/teams"); return result; }
export async function createZone(values: ZoneValues) { const result = await SettingsService.createZone(zoneSchema.parse(values)); revalidatePath("/settings"); revalidatePath("/teams"); return result; }
export async function updateProfileRole(values: ProfileRoleValues) { await SettingsService.assignProfileRole(profileRoleSchema.parse(values)); revalidatePath("/settings"); }
export async function deleteProfile(values: DeleteProfileValues) { await SettingsService.deleteProfile(deleteProfileSchema.parse(values)); revalidatePath("/settings"); }
export async function updateTournament(id: string, values: TournamentValues) { const result = await SettingsService.updateTournament(tournamentIdSchema.parse(id), tournamentSchema.parse(values)); revalidatePath("/settings"); revalidatePath("/dashboard"); return result; }
export async function deleteTournament(id: string) { await SettingsService.deleteTournament(tournamentIdSchema.parse(id)); revalidatePath("/settings"); revalidatePath("/dashboard"); revalidatePath("/teams"); }
export async function updateZoneCapacity(zoneId: string, maxTeams: number | null) { const values = zoneCapacitySchema.parse({ zoneId, maxTeams }); await SettingsService.updateZoneCapacity(values.zoneId, values.maxTeams); revalidatePath("/settings"); revalidatePath("/teams"); }
