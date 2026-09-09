"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Player, TeamRegistrationOption } from "@/lib/types/player";
import { playerAssignmentSchema, type PlayerAssignmentValues } from "@/lib/validations/players";

type Props = { open: boolean; onOpenChange: (open: boolean) => void; player: Player | null; teamRegistrations: TeamRegistrationOption[]; loading: boolean; onSave: (values: PlayerAssignmentValues) => Promise<void>; };

export function PlayerAssignmentDialog({ open, onOpenChange, player, teamRegistrations, loading, onSave }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PlayerAssignmentValues>({ resolver: zodResolver(playerAssignmentSchema), defaultValues: { player_id: "", team_registration_id: "", shirt_number: 1, is_captain: false, is_goalkeeper: false } });
  useEffect(() => { reset({ player_id: player?.id ?? "", team_registration_id: "", shirt_number: 1, is_captain: false, is_goalkeeper: false }); }, [player, reset, open]);
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Asignar jugador a equipo</DialogTitle><DialogDescription>{player ? `${player.first_name} ${player.last_name}` : "Selecciona un jugador."}</DialogDescription></DialogHeader><form onSubmit={handleSubmit(onSave)} className="space-y-4 py-2"><label className="block text-sm font-medium">Equipo<select className="mt-1 w-full" {...register("team_registration_id")}><option value="">Seleccionar equipo</option>{teamRegistrations.map((registration) => <option key={registration.id} value={registration.id}>{registration.label}</option>)}</select>{errors.team_registration_id && <p className="mt-1 text-xs text-red-400">{errors.team_registration_id.message}</p>}</label><p className="text-xs leading-5 text-stone-500">La asignación se realiza al equipo seleccionado.</p><div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => onOpenChange(false)} className="rounded-md border border-[var(--ea-border)] px-4 py-2 text-sm">Cancelar</button><button disabled={loading || !player} className="rounded-md bg-[linear-gradient(135deg,#b71920,#77080d)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{loading ? "Asignando..." : "Guardar asignación"}</button></div></form></DialogContent></Dialog>;
}
