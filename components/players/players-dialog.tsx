"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlayerPhotoUpload } from "./player-photo-upload";
import { playerSchema, type PlayerFormValues } from "@/lib/validations/players";
import type { Player } from "@/lib/types/player";

const emptyValues: PlayerFormValues = { document_type: "DNI", document_number: "", first_name: "", last_name: "", birth_date: "", photo_url: "" };

export function PlayerDialog({ open, onOpenChange, player, loading, onSave }: { open: boolean; onOpenChange: (open: boolean) => void; player: Player | null; loading: boolean; onSave: (values: PlayerFormValues) => Promise<void> }) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PlayerFormValues>({ resolver: zodResolver(playerSchema), defaultValues: emptyValues });
  const photoUrl = watch("photo_url") ?? "";
  useEffect(() => { reset(player ? { document_type: player.document_type, document_number: player.document_number, first_name: player.first_name, last_name: player.last_name, birth_date: player.birth_date ?? "", photo_url: player.photo_url ?? "" } : emptyValues); }, [player, reset, open]);
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>{player ? "Editar jugador" : "Nuevo jugador"}</DialogTitle><DialogDescription>Los datos personales se vinculan luego a su categoría y equipo.</DialogDescription></DialogHeader><form onSubmit={handleSubmit(onSave)} className="grid gap-4 py-2 sm:grid-cols-2"><Field label="Tipo de documento"><select {...register("document_type")}><option>DNI</option><option>Pasaporte</option><option>Otro</option></select></Field><Field label="Número de documento" error={errors.document_number?.message}><input {...register("document_number")} /></Field><Field label="Nombre" error={errors.first_name?.message}><input {...register("first_name")} /></Field><Field label="Apellido" error={errors.last_name?.message}><input {...register("last_name")} /></Field><Field label="Fecha de nacimiento"><input type="date" {...register("birth_date")} /></Field><div className="sm:col-span-2"><Field label="Foto del jugador" error={errors.photo_url?.message}><PlayerPhotoUpload value={photoUrl} onChange={(url) => setValue("photo_url", url, { shouldValidate: true })} /></Field></div><div className="sm:col-span-2 flex justify-end gap-3 pt-3"><button type="button" onClick={() => onOpenChange(false)} className="rounded-md border border-[var(--ea-border)] px-4 py-2 text-sm">Cancelar</button><button disabled={loading} className="rounded-md bg-[linear-gradient(135deg,#b71920,#77080d)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{loading ? "Guardando..." : "Guardar jugador"}</button></div></form></DialogContent></Dialog>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <label className="grid gap-1 text-sm font-medium"><span>{label}</span>{children}{error && <span className="text-xs text-red-400">{error}</span>}</label>; }
