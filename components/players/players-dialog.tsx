"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlayerPhotoUpload } from "./player-photo-upload";
import { playerCreateSchema, type PlayerCreateValues } from "@/lib/validations/players";
import type { Player, TeamRegistrationOption } from "@/lib/types/player";

const emptyValues: PlayerCreateValues = { document_type: "DNI", document_number: "", first_name: "", last_name: "", birth_date: "", photo_url: "", team_registration_id: "", shirt_number: 1, is_captain: false, is_goalkeeper: false };

export function PlayerDialog({ open, onOpenChange, player, teamRegistrations, loading, onSave }: { open: boolean; onOpenChange: (open: boolean) => void; player: Player | null; teamRegistrations: TeamRegistrationOption[]; loading: boolean; onSave: (values: PlayerCreateValues) => Promise<void> }) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PlayerCreateValues>({ resolver: zodResolver(playerCreateSchema), defaultValues: emptyValues });
  const [teamId, setTeamId] = useState("");
  const photoUrl = watch("photo_url") ?? "";
  const teams = useMemo(() => [...new Map(teamRegistrations.map((registration) => [registration.team_id, registration.team_name])).entries()], [teamRegistrations]);
  const zones = useMemo(() => teamRegistrations.filter((registration) => registration.team_id === teamId && registration.id), [teamRegistrations, teamId]);
  useEffect(() => { reset(player ? { ...emptyValues, document_type: "DNI", document_number: player.document_number, first_name: player.first_name, last_name: player.last_name, birth_date: player.birth_date ?? "", photo_url: player.photo_url ?? "" } : emptyValues); setTeamId(""); }, [player, reset, open]);
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>{player ? "Editar jugador" : "Nuevo jugador"}</DialogTitle><DialogDescription>{player ? "Actualizá los datos personales del jugador." : "Completá los datos y elegí el equipo y la zona para su primera asignación."}</DialogDescription></DialogHeader><form onSubmit={handleSubmit(onSave)} className="grid gap-4 py-2 sm:grid-cols-2"><Field label="Nombre" error={errors.first_name?.message}><input {...register("first_name")} /></Field><Field label="Apellido" error={errors.last_name?.message}><input {...register("last_name")} /></Field><Field label="DNI" error={errors.document_number?.message}><input type="number" inputMode="numeric" min="0" step="1" {...register("document_number")} /></Field><Field label="Fecha de nacimiento"><input type="date" {...register("birth_date")} /></Field>{!player && <><Field label="Equipo"><select value={teamId} onChange={(event) => { setTeamId(event.target.value); setValue("team_registration_id", "", { shouldValidate: true }); }}><option value="">Asignar después</option>{teams.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></Field><Field label="Zona"><select disabled={!teamId || !zones.length} {...register("team_registration_id")}><option value="">{!teamId ? "Elegí primero un equipo" : zones.length ? "Seleccionar zona" : "El equipo no tiene zonas activas"}</option>{zones.map((registration) => <option key={registration.id} value={registration.id}>{registration.zone_name}</option>)}</select></Field></>}<div className="sm:col-span-2"><Field label="Foto del jugador" error={errors.photo_url?.message}><PlayerPhotoUpload value={photoUrl} onChange={(url) => setValue("photo_url", url, { shouldValidate: true })} /></Field></div><div className="sm:col-span-2 flex justify-end gap-3 pt-3"><button type="button" onClick={() => onOpenChange(false)} className="rounded-md border border-[var(--ea-border)] px-4 py-2 text-sm">Cancelar</button><button disabled={loading} className="rounded-md bg-[linear-gradient(135deg,#b71920,#77080d)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{loading ? "Guardando..." : "Guardar jugador"}</button></div></form></DialogContent></Dialog>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <label className="grid gap-1 text-sm font-medium"><span>{label}</span>{children}{error && <span className="text-xs text-red-400">{error}</span>}</label>; }
