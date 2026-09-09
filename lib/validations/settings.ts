import { z } from "zod";

export const tournamentSchema = z.object({
  name: z.string().trim().min(3, "Ingresá el nombre del torneo.").max(150),
  season: z.string().trim().max(20).optional().or(z.literal("")),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const categorySchema = z.object({
  tournament_id: z.uuid({ error: "Seleccioná un torneo." }),
  name: z.string().trim().min(2, "Ingresá el nombre de la categoría.").max(100),
});

export const zoneSchema = z.object({
  category_id: z.uuid({ error: "Seleccioná una categoría." }),
  name: z.string().trim().min(1, "Ingresá el nombre de la zona.").max(100),
  max_teams: z.coerce.number().int().min(2, "El cupo debe ser de al menos 2 equipos.").max(100).nullable(),
});

export type TournamentValues = z.infer<typeof tournamentSchema>;
export type CategoryValues = z.infer<typeof categorySchema>;
export type ZoneValues = z.infer<typeof zoneSchema>;

export const profileRoleSchema = z.object({
  userId: z.uuid({ error: "El usuario seleccionado no es válido." }),
  roleCode: z.enum(["SUPER_ADMIN", "TOURNAMENT_ADMIN", "TEAM_MANAGER", "REFEREE", "PLAYER"]),
});

export type ProfileRoleValues = z.infer<typeof profileRoleSchema>;

export const deleteProfileSchema = z.object({
  userId: z.uuid({ error: "El usuario seleccionado no es válido." }),
});

export type DeleteProfileValues = z.infer<typeof deleteProfileSchema>;

export const zoneCapacitySchema = z.object({ zoneId: z.uuid(), maxTeams: z.coerce.number().int().min(2).max(100).nullable() });
export const tournamentIdSchema = z.uuid();
