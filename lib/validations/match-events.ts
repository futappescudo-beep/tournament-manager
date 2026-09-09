import { z } from "zod";

export const matchEventSchema = z.object({
  matchId: z.uuid(),
  playerRegistrationId: z.uuid({ error: "Seleccioná un jugador válido." }),
  eventTypeId: z.uuid({ error: "Seleccioná el tipo de evento." }),
  minute: z.coerce.number().int().min(0, "El minuto no puede ser negativo.").max(130, "El minuto no puede superar 130."),
  comments: z.string().trim().max(300, "El comentario no puede superar 300 caracteres.").optional(),
});

export type MatchEventValues = z.infer<typeof matchEventSchema>;
