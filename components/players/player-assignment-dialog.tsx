"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Player, TeamRegistrationOption } from "@/lib/types/player";
import { playerAssignmentSchema, type PlayerAssignmentValues } from "@/lib/validations/players";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: Player | null;
  selectablePlayers?: Player[];
  teamRegistrations: TeamRegistrationOption[];
  fixedTeamId?: string;
  loading: boolean;
  onSave: (values: PlayerAssignmentValues) => Promise<void>;
};

export function PlayerAssignmentDialog(props: Props) {
  return <PlayerAssignmentDialogForm key={`${props.open}:${props.player?.id ?? ""}:${props.fixedTeamId ?? ""}`} {...props} />;
}

function PlayerAssignmentDialogForm({ open, onOpenChange, player, selectablePlayers = [], teamRegistrations, fixedTeamId, loading, onSave }: Props) {
  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm<PlayerAssignmentValues>({ resolver: zodResolver(playerAssignmentSchema), defaultValues: { player_id: player?.id ?? "", team_registration_id: "", shirt_number: 1, is_captain: false, is_goalkeeper: false } });
  const [teamId, setTeamId] = useState(fixedTeamId ?? "");
  const [categoryName, setCategoryName] = useState("");
  const selectedPlayerId = useWatch({ control, name: "player_id" });
  const teams = useMemo(() => [...new Map(teamRegistrations.map((registration) => [registration.team_id, registration.team_name])).entries()], [teamRegistrations]);
  const categories = useMemo(() => [...new Map(teamRegistrations.filter((registration) => registration.team_id === teamId && registration.category_name).map((registration) => [registration.category_name, registration.category_name])).values()], [teamRegistrations, teamId]);
  const zones = useMemo(() => teamRegistrations.filter((registration) => registration.team_id === teamId && registration.category_name === categoryName && registration.id), [teamRegistrations, teamId, categoryName]);
  const selectedPlayer = player ?? selectablePlayers.find((item) => item.id === selectedPlayerId) ?? null;

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Asignar jugador al plantel</DialogTitle><DialogDescription>{selectedPlayer ? `${selectedPlayer.first_name} ${selectedPlayer.last_name}` : "Elegí un jugador existente para incorporarlo."}</DialogDescription></DialogHeader><form onSubmit={handleSubmit(onSave)} className="space-y-4 py-2">{!player && <label className="block text-sm font-medium">Jugador<select className="mt-1 w-full" {...register("player_id")}><option value="">Seleccionar jugador</option>{selectablePlayers.map((item) => <option key={item.id} value={item.id}>{item.last_name}, {item.first_name} · {item.document_number}</option>)}</select>{errors.player_id && <p className="mt-1 text-xs text-red-400">{errors.player_id.message}</p>}</label>}<label className="block text-sm font-medium">Equipo<select disabled={Boolean(fixedTeamId)} className="mt-1 w-full" value={teamId} onChange={(event) => { setTeamId(event.target.value); setCategoryName(""); setValue("team_registration_id", "", { shouldValidate: true }); }}><option value="">Seleccionar equipo</option>{teams.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label><label className="block text-sm font-medium">Categoría<select disabled={!teamId || !categories.length} className="mt-1 w-full" value={categoryName} onChange={(event) => { setCategoryName(event.target.value); setValue("team_registration_id", "", { shouldValidate: true }); }}><option value="">{!teamId ? "Elegí primero un equipo" : categories.length ? "Seleccionar categoría" : "El equipo no tiene categorías activas"}</option>{categories.map((name) => <option key={name} value={name}>{name}</option>)}</select></label><label className="block text-sm font-medium">Zona<select disabled={!categoryName || !zones.length} className="mt-1 w-full" {...register("team_registration_id")}><option value="">{!categoryName ? "Elegí primero una categoría" : zones.length ? "Seleccionar zona" : "La categoría no tiene zonas activas"}</option>{zones.map((registration) => <option key={registration.id} value={registration.id}>{registration.zone_name}</option>)}</select>{errors.team_registration_id && <p className="mt-1 text-xs text-red-400">{errors.team_registration_id.message}</p>}</label><p className="text-xs leading-5 text-stone-500">El número de camiseta, capitán y arquero se indican en la planilla de cada partido.</p><div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => onOpenChange(false)} className="rounded-md border border-[var(--ea-border)] px-4 py-2 text-sm">Cancelar</button><button disabled={loading || !selectedPlayer} className="rounded-md bg-[linear-gradient(135deg,#b71920,#77080d)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{loading ? "Asignando..." : "Guardar asignación"}</button></div></form></DialogContent></Dialog>;
}
