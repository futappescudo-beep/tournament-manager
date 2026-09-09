"use server";

import { revalidatePath } from "next/cache";
import { playerAssignmentSchema, playerIdSchema, playerSchema, type PlayerAssignmentValues, type PlayerFormValues } from "@/lib/validations/players";
import * as PlayerService from "@/lib/service/player.service";

export async function getPlayers() { return PlayerService.getPlayers(); }
export async function createPlayer(values: PlayerFormValues) { const player = await PlayerService.createPlayer(playerSchema.parse(values)); revalidatePath("/players"); return player; }
export async function updatePlayer(id: string, values: PlayerFormValues) { await PlayerService.updatePlayer(id, playerSchema.parse(values)); revalidatePath("/players"); }
export async function assignPlayerToTeam(values: PlayerAssignmentValues) { await PlayerService.assignPlayerToTeam(playerAssignmentSchema.parse(values)); revalidatePath("/players"); }
export async function deletePlayer(id: string) { await PlayerService.deletePlayer(playerIdSchema.parse(id)); revalidatePath("/players"); }
