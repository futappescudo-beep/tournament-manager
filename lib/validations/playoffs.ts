import { z } from "zod";
import { PLAYOFF_STAGES } from "@/lib/constants/playoffs";

const optionalUuid = z.union([z.uuid(), z.literal("")]).transform((value) => value || null);

const playoffMatchSchema = z.object({
  stageName: z.enum(PLAYOFF_STAGES, { error: "Seleccioná una instancia válida." }),
  homeTeamRegistrationId: optionalUuid,
  awayTeamRegistrationId: optionalUuid,
  homeSourceLabel: z.string().trim().max(80),
  awaySourceLabel: z.string().trim().max(80),
  isNeutralVenue: z.boolean(),
  isFinal: z.boolean(),
}).superRefine((match, context) => {
  if (!match.homeTeamRegistrationId && !match.homeSourceLabel) context.addIssue({ code: "custom", path: ["homeSourceLabel"], message: "Definí el equipo local o su procedencia." });
  if (!match.awayTeamRegistrationId && !match.awaySourceLabel) context.addIssue({ code: "custom", path: ["awaySourceLabel"], message: "Definí el equipo visitante o su procedencia." });
  if (match.homeTeamRegistrationId && match.homeTeamRegistrationId === match.awayTeamRegistrationId) context.addIssue({ code: "custom", path: ["awayTeamRegistrationId"], message: "Un equipo no puede jugar contra sí mismo." });
});

export const playoffBracketSchema = z.object({
  tournamentId: z.uuid({ error: "Seleccioná un torneo válido." }),
  categoryId: z.uuid({ error: "Seleccioná una categoría válida." }),
  name: z.string().trim().min(2, "Indicá el nombre de la copa.").max(80),
  trophy: z.enum(["GOLD", "SILVER", "CUSTOM"]),
  notes: z.string().trim().max(500, "Las observaciones no pueden superar 500 caracteres.").optional(),
  matches: z.array(playoffMatchSchema).min(1, "Agregá al menos un cruce."),
});

export type PlayoffBracketValues = z.infer<typeof playoffBracketSchema>;
