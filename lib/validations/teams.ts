import { z } from "zod";

export const registrationSchema = z.object({
  category_id: z.uuid({ error: "Debe seleccionar una categoria." }),
  zone_id: z.uuid({ error: "Debe seleccionar una zona." }),
});

export const teamSchema = z
  .object({
    name: z.string().trim().min(3, "El nombre debe tener al menos 3 caracteres.").max(80, "El nombre no puede superar los 80 caracteres."),
    short_name: z.string().trim().max(20, "El nombre corto no puede superar los 20 caracteres.").optional().or(z.literal("")),
    contact_name: z.string().trim().max(100, "El responsable no puede superar los 100 caracteres.").optional().or(z.literal("")),
    email: z.string().trim().email("Correo electronico invalido.").optional().or(z.literal("")),
    phone: z.string().trim().max(30, "El telefono no puede superar los 30 caracteres.").optional().or(z.literal("")),
    logo_url: z.string().trim().url("La URL del logo no es valida.").optional().or(z.literal("")),
    notes: z.string().trim().max(1000, "Las notas no pueden superar los 1000 caracteres.").optional().or(z.literal("")),
    active: z.boolean(),
    registrations: z.array(registrationSchema).min(1, "Debe registrar el equipo en al menos una categoria."),
  })
  .superRefine((data, ctx) => {
    const used = new Set<string>();
    data.registrations.forEach((registration, index) => {
      const key = `${registration.category_id}-${registration.zone_id}`;
      if (used.has(key)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["registrations", index, "zone_id"], message: "La combinacion Categoria + Zona ya fue seleccionada." });
      }
      used.add(key);
    });
  });

export type TeamFormValues = z.infer<typeof teamSchema>;
export type TeamRegistration = z.infer<typeof registrationSchema>;
