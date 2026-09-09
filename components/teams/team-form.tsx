"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CategoryOption, Team } from "@/lib/types/team";
import { teamSchema, type TeamFormValues } from "@/lib/validations/teams";
import { LogoUpload } from "./logo-upload";

type Props = {
  team?: Team | null;
  categories: CategoryOption[];
  loading?: boolean;
  onSubmit: (values: TeamFormValues) => Promise<void>;
};

const emptyValues: TeamFormValues = {
  name: "", short_name: "", contact_name: "", email: "", phone: "", logo_url: "", notes: "", active: true, registrations: [],
};

export default function TeamForm({ team, categories, loading = false, onSubmit }: Props) {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: emptyValues,
  });
  const registrations = watch("registrations") ?? [];
  const logoUrl = watch("logo_url") ?? "";

  useEffect(() => {
    if (!team) {
      reset(emptyValues);
      return;
    }
    reset({
      name: team.name,
      short_name: team.short_name ?? "",
      contact_name: team.contact_name ?? "",
      email: team.email ?? "",
      phone: team.phone ?? "",
      logo_url: team.logo_url ?? "",
      notes: team.notes ?? "",
      active: team.active,
      registrations: team.team_category_registrations.map((registration) => ({ category_id: registration.category_id, zone_id: registration.zone_id })),
    });
  }, [team, reset]);

  function toggleRegistration(categoryId: string, zoneId: string) {
    const exists = registrations.some((registration) => registration.category_id === categoryId && registration.zone_id === zoneId);
    setValue("registrations", exists
      ? registrations.filter((registration) => registration.category_id !== categoryId || registration.zone_id !== zoneId)
      : [...registrations, { category_id: categoryId, zone_id: zoneId }], { shouldValidate: true });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nombre" error={errors.name?.message}><Input {...register("name")} /></Field>
        <Field label="Nombre corto" error={errors.short_name?.message}><Input {...register("short_name")} /></Field>
        <Field label="Responsable" error={errors.contact_name?.message}><Input {...register("contact_name")} /></Field>
        <Field label="Telefono" error={errors.phone?.message}><Input {...register("phone")} /></Field>
        <Field label="Correo" error={errors.email?.message}><Input type="email" {...register("email")} /></Field>
        <Field label="Escudo" error={errors.logo_url?.message}><LogoUpload value={logoUrl} onChange={(url) => setValue("logo_url", url, { shouldValidate: true })} /><p className="mt-2 text-xs text-stone-500">También podés pegar una URL externa.</p><Input className="mt-2" placeholder="https://..." {...register("logo_url")} /></Field>
        <div className="md:col-span-2"><Label htmlFor="notes">Notas</Label><textarea id="notes" className="mt-2 min-h-20 w-full rounded-md border bg-background p-3 text-sm" {...register("notes")} />{errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>}</div>
        <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" {...register("active")} /> Equipo activo</label>
      </div>
      <div className="space-y-3"><h2 className="text-lg font-semibold">Inscripciones</h2><p className="text-sm text-muted-foreground">Marcá las zonas en las que participará el equipo.</p>
        {categories.length === 0 && <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">Todavía no hay categorías ni zonas configuradas en el torneo. Primero deben crearse en Supabase.</div>}
        {categories.length > 0 && <div className="overflow-x-auto rounded-lg border"><table className="w-full min-w-[620px] text-sm"><thead className="bg-black/20 text-left text-xs uppercase tracking-wider text-stone-500"><tr><th className="p-3">Torneo</th><th className="p-3">Categoría</th><th className="p-3">Zona</th><th className="p-3 text-center">Participa</th></tr></thead><tbody>{categories.flatMap((category) => category.zones.length ? category.zones.map((zone) => { const checked = registrations.some((registration) => registration.category_id === category.id && registration.zone_id === zone.id); return <tr key={zone.id} className="border-t border-[var(--ea-border)]"><td className="p-3 text-stone-300">{category.tournament_name}</td><td className="p-3 font-medium text-white">{category.name}</td><td className="p-3">{zone.name}</td><td className="p-3 text-center"><input aria-label={`Participa en ${category.tournament_name}, ${category.name}, ${zone.name}`} type="checkbox" checked={checked} onChange={() => toggleRegistration(category.id, zone.id)} /></td></tr>; }) : [<tr key={category.id} className="border-t border-[var(--ea-border)]"><td className="p-3 text-stone-300">{category.tournament_name}</td><td className="p-3 font-medium text-white">{category.name}</td><td colSpan={2} className="p-3 text-amber-300">Sin zonas configuradas</td></tr>])}</tbody></table></div>}
        {errors.registrations && <p className="text-sm text-red-600">{errors.registrations.message}</p>}
      </div>
      <Button type="submit" disabled={loading} className="w-full">{loading ? "Guardando..." : team ? "Guardar cambios" : "Crear equipo"}</Button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div><Label>{label}</Label>{children}{error && <p className="mt-1 text-sm text-red-600">{error}</p>}</div>;
}
