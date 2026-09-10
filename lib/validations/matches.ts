import { z } from "zod";

const optionalUuid = z.union([z.uuid(), z.literal("")]).transform((value) => value || null);

export const resultSchema = z.object({
  matchId: z.uuid({ error: "El partido seleccionado no es válido." }),
  homeScore: z.coerce.number().int("El marcador debe ser un número entero.").min(0, "El marcador no puede ser negativo.").max(99, "El marcador no puede superar 99."),
  awayScore: z.coerce.number().int("El marcador debe ser un número entero.").min(0, "El marcador no puede ser negativo.").max(99, "El marcador no puede superar 99."),
});

export type ResultValues = z.infer<typeof resultSchema>;

export const fixtureMatchSchema = z.object({
  tournamentId: z.uuid({ error: "Seleccioná un torneo válido." }),
  categoryId: z.uuid({ error: "Seleccioná una categoría válida." }),
  zoneId: z.uuid({ error: "Seleccioná una zona válida." }),
  phaseId: z.uuid({ error: "Seleccioná una fase válida." }),
  round: z.coerce.number().int("La fecha debe ser un número entero.").min(1, "La fecha debe ser mayor a cero.").max(99),
  homeTeamRegistrationId: z.uuid({ error: "Seleccioná el equipo local." }),
  awayTeamRegistrationId: z.uuid({ error: "Seleccioná el equipo visitante." }),
  matchDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ingresá una fecha válida."),
  kickoffTime: z.string().regex(/^\d{2}:\d{2}$/, "Ingresá una hora válida."),
  fieldId: optionalUuid,
  refereeId: optionalUuid,
  assistantReferee1Id: optionalUuid,
  assistantReferee2Id: optionalUuid,
  observations: z.string().trim().max(500, "Las observaciones no pueden superar 500 caracteres.").optional(),
}).refine((values) => values.homeTeamRegistrationId !== values.awayTeamRegistrationId, {
  message: "El equipo local y visitante deben ser distintos.",
  path: ["awayTeamRegistrationId"],
});

export type FixtureMatchValues = z.infer<typeof fixtureMatchSchema>;

export const regularFixtureGeneratorSchema = z.object({
  tournamentId: z.uuid({ error: "Seleccioná un torneo válido." }),
  categoryId: z.uuid({ error: "Seleccioná una categoría válida." }),
  zoneId: z.uuid({ error: "Seleccioná una zona válida." }),
  phaseId: z.uuid({ error: "Seleccioná una fase válida." }),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ingresá una fecha inicial válida."),
  daysBetweenRounds: z.coerce.number().int().min(1, "El intervalo debe ser de al menos un día.").max(31),
  kickoffTime: z.string().regex(/^\d{2}:\d{2}$/, "Ingresá una hora válida."),
});

export type RegularFixtureGeneratorValues = z.infer<typeof regularFixtureGeneratorSchema>;
