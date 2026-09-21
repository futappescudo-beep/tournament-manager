"use server";

import { revalidatePath } from "next/cache";
import { playerAssignmentSchema, playerCreateSchema, playerIdSchema, playerSchema, type PlayerAssignmentValues, type PlayerCreateValues, type PlayerFormValues } from "@/lib/validations/players";
import * as PlayerService from "@/lib/service/player.service";

export type PlayerActionResult<T = undefined> = { ok: true; data: T } | { ok: false; message: string };

function playerErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "No se pudo guardar el jugador.";
  if (message.includes("uq_players_document") || message.includes("duplicate key")) return "Ya existe un jugador con ese DNI. Buscalo y usá Asignar jugador para incorporarlo al plantel.";
  if (message.includes("row-level security") || message.includes("permission denied")) return "No tenés permisos para modificar jugadores. Verificá que tu cuenta tenga rol de administrador o delegado autorizado.";
  return message;
}

export async function getPlayers() { return PlayerService.getPlayers(); }
export async function createPlayer(values: PlayerFormValues) { const player = await PlayerService.createPlayer(playerSchema.parse(values)); revalidatePath("/players"); return player; }
export async function updatePlayer(id: string, values: PlayerFormValues) { await PlayerService.updatePlayer(id, playerSchema.parse(values)); revalidatePath("/players"); }
export async function assignPlayerToTeam(values: PlayerAssignmentValues) { await PlayerService.assignPlayerToTeam(playerAssignmentSchema.parse(values)); revalidatePath("/players"); }
export async function deletePlayer(id: string) { await PlayerService.deletePlayer(playerIdSchema.parse(id)); revalidatePath("/players"); }
export async function unassignPlayerFromTeam(playerRegistrationId: string) { await PlayerService.unassignPlayerFromTeam(playerIdSchema.parse(playerRegistrationId)); revalidatePath("/players"); revalidatePath("/teams"); }

export async function createPlayerWithInitialAssignment(values: PlayerCreateValues): Promise<PlayerActionResult<Awaited<ReturnType<typeof PlayerService.createPlayer>>>> {
  try {
    const parsed = playerCreateSchema.parse(values);
    const { team_registration_id, shirt_number, is_captain, is_goalkeeper, ...playerValues } = parsed;
    const player = await PlayerService.createPlayer(playerValues);
    if (team_registration_id) await PlayerService.assignPlayerToTeam({ player_id: player.id, team_registration_id, shirt_number, is_captain, is_goalkeeper });
    revalidatePath("/players");
    revalidatePath("/teams");
    return { ok: true, data: player };
  } catch (error) {
    return { ok: false, message: playerErrorMessage(error) };
  }
}

export async function safelyAssignPlayerToTeam(values: PlayerAssignmentValues): Promise<PlayerActionResult> {
  try {
    await PlayerService.assignPlayerToTeam(playerAssignmentSchema.parse(values));
    revalidatePath("/players");
    revalidatePath("/teams");
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, message: playerErrorMessage(error) };
  }
}
