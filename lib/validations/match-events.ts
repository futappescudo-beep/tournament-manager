import { z } from "zod";

export const matchEventSchema = z.object({
  matchId: z.uuid(),
  playerRegistrationId: z.uuid({ error: "Seleccioná un jugador válido." }),
  eventTypeId: z.uuid({ error: "Seleccioná el tipo de evento." }),
  minute: z.coerce.number().int().min(0, "El minuto no puede ser negativo.").max(130, "El minuto no puede superar 130."),
  comments: z.string().trim().max(300, "El comentario no puede superar 300 caracteres.").optional(),
});

export type MatchEventValues = z.infer<typeof matchEventSchema>;

export const matchSheetEntrySchema = z.object({
  matchId: z.uuid(),
  playerRegistrationId: z.uuid(),
  teamRegistrationId: z.uuid(),
  shirtNumber: z.coerce.number().int().min(0).max(99).nullable(),
  isPresent: z.boolean(),
  notes: z.string().trim().max(240).optional(),
});

export const matchSheetConfirmationSchema = z.object({
  matchId: z.uuid(),
  confirmationType: z.enum(["REFEREE", "HOME_DELEGATE", "AWAY_DELEGATE"]),
});

export const matchSheetStatusSchema = z.object({ matchId: z.uuid(), status: z.enum(["DRAFT", "OPEN", "CLOSED"]), closingObservations: z.string().trim().max(600).optional() });

export type MatchSheetEntryValues = z.infer<typeof matchSheetEntrySchema>;
export type MatchSheetConfirmationValues = z.infer<typeof matchSheetConfirmationSchema>;
export type MatchSheetStatusValues = z.infer<typeof matchSheetStatusSchema>;
