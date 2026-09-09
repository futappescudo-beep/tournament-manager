import { z } from "zod";

export const playerSchema = z.object({
  document_type: z.string().trim().min(1, "Selecciona el tipo de documento."),
  document_number: z.string().trim().min(5, "Ingresa un documento valido.").max(30),
  first_name: z.string().trim().min(2, "Ingresa el nombre.").max(80),
  last_name: z.string().trim().min(2, "Ingresa el apellido.").max(80),
  birth_date: z.string().optional().or(z.literal("")),
  photo_url: z.string().trim().url("La URL de la foto no es válida.").optional().or(z.literal("")),
});

export type PlayerFormValues = z.infer<typeof playerSchema>;

export const playerAssignmentSchema = z.object({
  player_id: z.uuid(),
  team_registration_id: z.uuid({ error: "Selecciona el equipo y la categoria." }),
  shirt_number: z.number().int().min(1, "El numero debe ser entre 1 y 99.").max(99, "El numero debe ser entre 1 y 99."),
  is_captain: z.boolean(),
  is_goalkeeper: z.boolean(),
});

export type PlayerAssignmentValues = z.infer<typeof playerAssignmentSchema>;

export const playerIdSchema = z.uuid({ error: "El jugador seleccionado no es válido." });
